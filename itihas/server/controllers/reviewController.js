const Review = require('../models/Review');
const Place = require('../models/Place');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────────────────────────────
// 1.  GET /api/reviews  OR  /api/places/:placeId/reviews
// ─────────────────────────────────────────────────────────────────

/**
 * List reviews — optionally scoped to a single place.
 *
 * - Nested route (`/api/places/:placeId/reviews`) → filter by place
 * - Query param (`?place=<id>`)                   → filter by place
 * - Otherwise returns all reviews (paginated)
 *
 * Each review includes a `helpfulCount` and, when the request is
 * authenticated, a boolean `isHelpful` showing whether the current
 * user already marked it.
 */
exports.getReviews = asyncHandler(async (req, res) => {
  const filter = {};

  // Accept placeId from nested route params OR query string
  if (req.params.placeId) filter.place = req.params.placeId;
  else if (req.query.place) filter.place = req.query.place;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate({ path: 'user', select: 'name avatar' })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Annotate each review with helpfulCount + isHelpful for current user
  const currentUserId = req.user ? req.user._id.toString() : null;

  const data = reviews.map((r) => ({
    ...r,
    helpfulCount: r.helpful ? r.helpful.length : 0,
    isHelpful: currentUserId
      ? (r.helpful || []).some((id) => id.toString() === currentUserId)
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
// 2.  GET /api/reviews/:id
// ─────────────────────────────────────────────────────────────────

/**
 * Get a single review with populated user and place info.
 */
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate({ path: 'user', select: 'name avatar' })
    .populate({ path: 'place', select: 'name slug coverImage category' })
    .lean();

  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    return next(err);
  }

  res.json({ success: true, data: review });
});

// ─────────────────────────────────────────────────────────────────
// 3.  POST /api/places/:placeId/reviews
// ─────────────────────────────────────────────────────────────────

/**
 * Create a review for a place.
 *
 * The compound unique index `{ place, user }` prevents duplicates at
 * the database level; we catch the 11000 error to give a friendly msg.
 */
exports.createReview = asyncHandler(async (req, res, next) => {
  const placeId = req.params.placeId;

  // Verify place exists
  const placeExists = await Place.exists({ _id: placeId });
  if (!placeExists) {
    const err = new Error('Place not found');
    err.statusCode = 404;
    return next(err);
  }

  // Check for existing review (friendly error before hitting unique index)
  const alreadyReviewed = await Review.findOne({
    place: placeId,
    user: req.user.id,
  });
  if (alreadyReviewed) {
    const err = new Error('You have already reviewed this place');
    err.statusCode = 400;
    return next(err);
  }

  const review = await Review.create({
    ...req.body,
    place: placeId,
    user: req.user.id,
  });

  // post-save hook on the model recalculates place averageRating

  const populated = await review.populate({ path: 'user', select: 'name avatar' });

  res.status(201).json({
    success: true,
    message: 'Review submitted',
    data: populated,
  });
});

// ─────────────────────────────────────────────────────────────────
// 4.  PUT /api/reviews/:id
// ─────────────────────────────────────────────────────────────────

/**
 * Update a review — only the original author may edit.
 *
 * Allowed fields: title, text, rating, visitDate, images.
 * After saving, the post-save hook recalculates the place's rating.
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    return next(err);
  }

  // Ownership check
  if (review.user.toString() !== req.user.id.toString()) {
    const err = new Error('You can only edit your own reviews');
    err.statusCode = 403;
    return next(err);
  }

  const { title, text, rating, visitDate, images } = req.body;
  if (title !== undefined) review.title = title;
  if (text !== undefined) review.text = text;
  if (rating !== undefined) review.rating = rating;
  if (visitDate !== undefined) review.visitDate = visitDate;
  if (images !== undefined) review.images = images;

  await review.save(); // triggers post-save → recalc rating

  const populated = await review.populate({ path: 'user', select: 'name avatar' });

  res.json({
    success: true,
    message: 'Review updated',
    data: populated,
  });
});

// ─────────────────────────────────────────────────────────────────
// 5.  DELETE /api/reviews/:id
// ─────────────────────────────────────────────────────────────────

/**
 * Delete a review — author or admin.
 * Triggers rating recalculation via post-remove hook.
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    return next(err);
  }

  // Author or admin
  if (
    review.user.toString() !== req.user.id.toString() &&
    req.user.role !== 'admin'
  ) {
    const err = new Error('Not authorised to delete this review');
    err.statusCode = 403;
    return next(err);
  }

  const placeId = review.place;
  await review.deleteOne(); // post-deleteOne hook recalculates

  // Manually recalc as a safety-net (deleteOne doc hook may not fire in all drivers)
  await Review.calcAverageRating(placeId);

  res.json({ success: true, message: 'Review deleted' });
});

// ─────────────────────────────────────────────────────────────────
// 6.  PUT /api/reviews/:id/helpful
// ─────────────────────────────────────────────────────────────────

/**
 * Toggle the current user in the review's `helpful` array.
 */
exports.toggleHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    return next(err);
  }

  const userId = req.user.id.toString();
  const alreadyMarked = review.helpful.some((id) => id.toString() === userId);

  if (alreadyMarked) {
    review.helpful = review.helpful.filter((id) => id.toString() !== userId);
  } else {
    review.helpful.push(req.user.id);
  }

  await review.save();

  res.json({
    success: true,
    message: alreadyMarked ? 'Removed helpful mark' : 'Marked as helpful',
    data: {
      helpfulCount: review.helpful.length,
      isHelpful: !alreadyMarked,
    },
  });
});
