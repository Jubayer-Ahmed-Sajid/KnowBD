const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');
const Story = require('../models/Story');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────────────────────────────
// 1.  GET /api/users/admin/dashboard
// ─────────────────────────────────────────────────────────────────

/**
 * Aggregated admin dashboard statistics.
 *
 * Returns user / place / review / story counts, breakdowns, top-viewed
 * and most-bookmarked places, and recent reviews — all in a single
 * response to minimise client round-trips.
 */
exports.getDashboardStats = asyncHandler(async (_req, res) => {
  // ── Date boundary for "new this month" ──────────────────────
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // ── Parallel aggregation ────────────────────────────────────
  const [
    totalUsers,
    newUsersThisMonth,
    placeStats,
    totalReviewsAgg,
    totalStories,
    pendingStories,
    mostViewedPlaces,
    mostBookmarkedPlaces,
    recentReviews,
    totalPageViewsAgg,
  ] = await Promise.all([
    // Users
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),

    // Places — total + by-category breakdown
    Place.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
        },
      },
    ]),

    // Reviews — total + average rating
    Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]),

    // Stories
    Story.countDocuments(),
    Story.countDocuments({ approved: false }),

    // Most viewed places (top 5)
    Place.find()
      .sort('-totalViews')
      .limit(5)
      .select('name slug coverImage totalViews category')
      .lean(),

    // Most bookmarked places (top 5)
    User.aggregate([
      { $unwind: '$bookmarks' },
      { $group: { _id: '$bookmarks', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'places',
          localField: '_id',
          foreignField: '_id',
          as: 'place',
        },
      },
      { $unwind: '$place' },
      {
        $project: {
          _id: '$place._id',
          name: '$place.name',
          slug: '$place.slug',
          coverImage: '$place.coverImage',
          category: '$place.category',
          bookmarkCount: '$count',
        },
      },
    ]),

    // Recent reviews (latest 5)
    Review.find()
      .sort('-createdAt')
      .limit(5)
      .populate({ path: 'user', select: 'name avatar' })
      .populate({ path: 'place', select: 'name.en slug' })
      .lean(),

    // Total page views
    Place.aggregate([
      { $group: { _id: null, total: { $sum: '$totalViews' } } },
    ]),
  ]);

  // ── Flatten helper results ──────────────────────────────────
  const placeFacet = placeStats[0] || { total: [], byCategory: [] };
  const totalPlaces =
    placeFacet.total.length > 0 ? placeFacet.total[0].count : 0;
  const placesByCategory = placeFacet.byCategory;

  const reviewAgg = totalReviewsAgg[0] || {
    totalReviews: 0,
    averageRating: 0,
  };

  const totalPageViews =
    totalPageViewsAgg.length > 0 ? totalPageViewsAgg[0].total : 0;

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
      },
      places: {
        total: totalPlaces,
        byCategory: placesByCategory,
      },
      reviews: {
        total: reviewAgg.totalReviews,
        averageRating:
          Math.round((reviewAgg.averageRating || 0) * 10) / 10,
      },
      stories: {
        total: totalStories,
        pending: pendingStories,
      },
      mostViewedPlaces,
      mostBookmarkedPlaces,
      recentReviews,
      totalPageViews,
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// 2.  GET /api/users/admin/users
// ─────────────────────────────────────────────────────────────────

/**
 * List all users with pagination.  Supports `?search=` on name / email.
 *
 * Includes computed review count per user via a $lookup aggregation,
 * plus bookmarks count.
 */
exports.getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('name email role avatar bookmarks visitedPlaces bio createdAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  // Enrich with counts
  const userIds = users.map((u) => u._id);
  const reviewCounts = await Review.aggregate([
    { $match: { user: { $in: userIds } } },
    { $group: { _id: '$user', count: { $sum: 1 } } },
  ]);
  const reviewMap = Object.fromEntries(
    reviewCounts.map((r) => [r._id.toString(), r.count])
  );

  const data = users.map((u) => ({
    ...u,
    bookmarksCount: u.bookmarks ? u.bookmarks.length : 0,
    reviewsCount: reviewMap[u._id.toString()] || 0,
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
// 3.  PUT /api/users/admin/users/:id/role
// ─────────────────────────────────────────────────────────────────

/**
 * Change a user's role.  Admin cannot change their own role.
 */
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    const err = new Error("Role must be either 'user' or 'admin'");
    err.statusCode = 400;
    return next(err);
  }

  // Prevent self-demotion / self-promotion
  if (req.params.id === req.user.id.toString()) {
    const err = new Error('You cannot change your own role');
    err.statusCode = 400;
    return next(err);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('name email role avatar');

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    return next(err);
  }

  res.json({
    success: true,
    message: `User role updated to '${role}'`,
    data: user,
  });
});

// ─────────────────────────────────────────────────────────────────
// 4.  DELETE /api/users/admin/users/:id
// ─────────────────────────────────────────────────────────────────

/**
 * Delete a user and cascade-remove their reviews and stories.
 * Admin cannot delete themselves.
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  if (req.params.id === req.user.id.toString()) {
    const err = new Error('You cannot delete your own account from here');
    err.statusCode = 400;
    return next(err);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    return next(err);
  }

  // Cascade
  await Promise.all([
    Review.deleteMany({ user: user._id }),
    Story.deleteMany({ user: user._id }),
  ]);

  // Recalculate ratings for places this user had reviewed
  const affectedReviews = await Review.find({ user: user._id }).select('place');
  const placeIds = [...new Set(affectedReviews.map((r) => r.place.toString()))];

  await user.deleteOne();

  // Fire rating recalculation for affected places (no await — best-effort)
  placeIds.forEach((pid) => {
    Review.calcAverageRating(pid).catch(() => {});
  });

  res.json({ success: true, message: 'User and associated data deleted' });
});

// ─────────────────────────────────────────────────────────────────
// 5.  GET /api/users/admin/stories/pending
// ─────────────────────────────────────────────────────────────────

/**
 * Return all stories awaiting approval, populated with user and place.
 */
exports.getPendingStories = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
  const skip = (page - 1) * limit;

  const filter = { approved: false };

  const [stories, total] = await Promise.all([
    Story.find(filter)
      .populate({ path: 'user', select: 'name avatar email' })
      .populate({ path: 'place', select: 'name.en slug' })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Story.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: stories.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: stories,
  });
});

// ─────────────────────────────────────────────────────────────────
// 6.  PUT /api/users/admin/stories/bulk-approve
// ─────────────────────────────────────────────────────────────────

/**
 * Bulk-approve stories by an array of IDs.
 *
 * Body: { ids: ['<storyId>', …] }
 */
exports.bulkApproveStories = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    const err = new Error('Please provide an array of story IDs');
    err.statusCode = 400;
    return next(err);
  }

  const result = await Story.updateMany(
    { _id: { $in: ids } },
    { approved: true }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} stor${result.modifiedCount === 1 ? 'y' : 'ies'} approved`,
    data: { modifiedCount: result.modifiedCount },
  });
});
