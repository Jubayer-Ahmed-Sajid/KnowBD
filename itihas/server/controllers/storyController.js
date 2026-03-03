const Story = require('../models/Story');
const Place = require('../models/Place');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────────────────────────────
// 1.  GET /api/stories
// ─────────────────────────────────────────────────────────────────

/**
 * List stories with optional place filter.
 *
 * - Public users see only `approved: true` stories.
 * - Admin users can pass `?approved=false` or `?approved=all` to see
 *   pending / all stories.
 */
exports.getStories = asyncHandler(async (req, res) => {
  const filter = {};

  // Scope to a specific place
  if (req.query.place) filter.place = req.query.place;

  // Visibility: admin can override the approval filter
  const isAdmin = req.user && req.user.role === 'admin';

  if (isAdmin && req.query.approved === 'all') {
    // no approval filter
  } else if (isAdmin && req.query.approved === 'false') {
    filter.approved = false;
  } else {
    filter.approved = true;
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const [stories, total] = await Promise.all([
    Story.find(filter)
      .populate({ path: 'user', select: 'name avatar' })
      .populate({ path: 'place', select: 'name.en slug' })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Story.countDocuments(filter),
  ]);

  // Annotate with likesCount + isLiked for authenticated users
  const currentUserId = req.user ? req.user._id.toString() : null;

  const data = stories.map((s) => ({
    ...s,
    likesCount: s.likes ? s.likes.length : 0,
    isLiked: currentUserId
      ? (s.likes || []).some((id) => id.toString() === currentUserId)
      : false,
  }));

  res.json({
    success: true,
    count: data.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data,
  });
});

// ─────────────────────────────────────────────────────────────────
// 2.  GET /api/stories/:id
// ─────────────────────────────────────────────────────────────────

/**
 * Get a single story with full details.
 */
exports.getStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id)
    .populate({ path: 'user', select: 'name avatar bio' })
    .populate({ path: 'place', select: 'name slug coverImage category' })
    .lean();

  if (!story) {
    const err = new Error('Story not found');
    err.statusCode = 404;
    return next(err);
  }

  // Non-admin can only see approved stories
  const isAdmin = req.user && req.user.role === 'admin';
  const isAuthor = req.user && story.user._id.toString() === req.user._id.toString();

  if (!story.approved && !isAdmin && !isAuthor) {
    const err = new Error('Story not found');
    err.statusCode = 404;
    return next(err);
  }

  res.json({ success: true, data: story });
});

// ─────────────────────────────────────────────────────────────────
// 3.  POST /api/stories
// ─────────────────────────────────────────────────────────────────

/**
 * Submit a user-generated story about a place.
 * Auto-sets `approved: false` — admin must approve before public display.
 */
exports.createStory = asyncHandler(async (req, res, next) => {
  const { place, title, content, images } = req.body;

  // Verify place exists
  if (!place) {
    const err = new Error('Place ID is required');
    err.statusCode = 400;
    return next(err);
  }

  const placeExists = await Place.exists({ _id: place });
  if (!placeExists) {
    const err = new Error('Place not found');
    err.statusCode = 404;
    return next(err);
  }

  const story = await Story.create({
    place,
    user: req.user.id,
    title,
    content,
    images: images || [],
    approved: false,
  });

  const populated = await story.populate([
    { path: 'user', select: 'name avatar' },
    { path: 'place', select: 'name.en slug' },
  ]);

  res.status(201).json({
    success: true,
    message: 'Story submitted for review — it will appear publicly once approved',
    data: populated,
  });
});

// ─────────────────────────────────────────────────────────────────
// 4.  PUT /api/stories/:id
// ─────────────────────────────────────────────────────────────────

/**
 * Update a story — only the original author may edit.
 *
 * If `title` or `content` changes, `approved` is reset to `false`
 * so the update goes through moderation again.
 */
exports.updateStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);

  if (!story) {
    const err = new Error('Story not found');
    err.statusCode = 404;
    return next(err);
  }

  // Ownership check
  if (story.user.toString() !== req.user.id.toString()) {
    const err = new Error('You can only edit your own stories');
    err.statusCode = 403;
    return next(err);
  }

  const { title, content, images } = req.body;
  let contentChanged = false;

  if (title !== undefined && title !== story.title) {
    story.title = title;
    contentChanged = true;
  }
  if (content !== undefined && content !== story.content) {
    story.content = content;
    contentChanged = true;
  }
  if (images !== undefined) {
    story.images = images;
  }

  // Reset approval if substantive content changed
  if (contentChanged) {
    story.approved = false;
  }

  await story.save();

  const populated = await story.populate([
    { path: 'user', select: 'name avatar' },
    { path: 'place', select: 'name.en slug' },
  ]);

  res.json({
    success: true,
    message: contentChanged
      ? 'Story updated — re-submitted for review'
      : 'Story updated',
    data: populated,
  });
});

// ─────────────────────────────────────────────────────────────────
// 5.  DELETE /api/stories/:id
// ─────────────────────────────────────────────────────────────────

/**
 * Delete a story — author or admin.
 */
exports.deleteStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);

  if (!story) {
    const err = new Error('Story not found');
    err.statusCode = 404;
    return next(err);
  }

  if (
    story.user.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    const err = new Error('Not authorised to delete this story');
    err.statusCode = 403;
    return next(err);
  }

  await story.deleteOne();

  res.json({ success: true, message: 'Story deleted' });
});

// ─────────────────────────────────────────────────────────────────
// 6.  PUT /api/stories/:id/approve  (admin only)
// ─────────────────────────────────────────────────────────────────

/**
 * Approve a pending story so it appears publicly.
 */
exports.approveStory = asyncHandler(async (req, res, next) => {
  const story = await Story.findByIdAndUpdate(
    req.params.id,
    { approved: true },
    { new: true }
  )
    .populate({ path: 'user', select: 'name avatar' })
    .populate({ path: 'place', select: 'name.en slug' });

  if (!story) {
    const err = new Error('Story not found');
    err.statusCode = 404;
    return next(err);
  }

  res.json({
    success: true,
    message: 'Story approved',
    data: story,
  });
});

// ─────────────────────────────────────────────────────────────────
// 7.  PUT /api/stories/:id/like
// ─────────────────────────────────────────────────────────────────

/**
 * Toggle the current user in the story's `likes` array.
 */
exports.toggleLike = asyncHandler(async (req, res, next) => {
  const story = await Story.findById(req.params.id);

  if (!story) {
    const err = new Error('Story not found');
    err.statusCode = 404;
    return next(err);
  }

  const userId = req.user.id.toString();
  const alreadyLiked = story.likes.some((id) => id.toString() === userId);

  if (alreadyLiked) {
    story.likes = story.likes.filter((id) => id.toString() !== userId);
  } else {
    story.likes.push(req.user.id);
  }

  await story.save();

  res.json({
    success: true,
    message: alreadyLiked ? 'Like removed' : 'Story liked',
    data: {
      likesCount: story.likes.length,
      isLiked: !alreadyLiked,
    },
  });
});
