const Place = require('../models/Place');
const Review = require('../models/Review');
const Story = require('../models/Story');
const ApiFeatures = require('../utils/apiFeatures');
const asyncHandler = require('../utils/asyncHandler');

// ─── Select strings for light / card queries ───────────────────
const CARD_FIELDS =
  'name slug coverImage category location.division location.coordinates averageRating heritageScore subtitle era';

const MAP_FIELDS =
  'name.en slug category location.coordinates coverImage averageRating heritageScore';

// ─────────────────────────────────────────────────────────────────
// 1.  GET /api/places
// ─────────────────────────────────────────────────────────────────

/**
 * List places with search, filter, sort and pagination.
 *
 * Query params handled by ApiFeatures:
 *   ?keyword=  ?category=  ?era=  ?division=  ?significance=
 *   ?featured=true  ?sort=rating|-createdAt|score  ?page=1  ?limit=12
 */
exports.getPlaces = asyncHandler(async (req, res) => {
  // Total matching documents (for pagination metadata)
  const countFeatures = new ApiFeatures(Place.find({ published: true }), req.query)
    .search()
    .filter();
  const total = await Place.countDocuments(countFeatures.query.getFilter());

  // Actual paginated query
  const features = new ApiFeatures(Place.find({ published: true }), req.query)
    .search()
    .filter()
    .sort()
    .paginate();

  const places = await features.query.select(CARD_FIELDS).lean();

  const { page, limit } = features.pagination;

  res.json({
    success: true,
    count: places.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: places,
  });
});

// ─────────────────────────────────────────────────────────────────
// 2.  GET /api/places/:slug
// ─────────────────────────────────────────────────────────────────

/**
 * Get a single place by its SEO-friendly slug.
 * Increments `totalViews` atomically and populates related data.
 */
exports.getPlace = asyncHandler(async (req, res, next) => {
  const place = await Place.findOneAndUpdate(
    { slug: req.params.slug, published: true },
    { $inc: { totalViews: 1 } },
    { new: true }
  )
    .populate({
      path: 'practicalInfo.nearbyPlaces',
      select: 'name slug coverImage category location.division averageRating',
    })
    .populate({
      path: 'createdBy',
      select: 'name avatar',
    });

  if (!place) {
    const err = new Error('Place not found');
    err.statusCode = 404;
    return next(err);
  }

  res.json({ success: true, data: place });
});

// ─────────────────────────────────────────────────────────────────
// 3.  GET /api/places/category/:category
// ─────────────────────────────────────────────────────────────────

/**
 * List places filtered by a single category.
 */
exports.getPlacesByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { category, published: true };

  const [places, total] = await Promise.all([
    Place.find(filter)
      .select(CARD_FIELDS)
      .sort('-heritageScore -createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Place.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: places.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: places,
  });
});

// ─────────────────────────────────────────────────────────────────
// 4.  GET /api/places/era/:era
// ─────────────────────────────────────────────────────────────────

/**
 * List places whose `era` array contains the specified era.
 * Sorted by heritageScore descending.
 */
exports.getPlacesByEra = asyncHandler(async (req, res) => {
  const { era } = req.params;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
  const skip = (page - 1) * limit;

  const filter = { era: era, published: true };

  const [places, total] = await Promise.all([
    Place.find(filter)
      .select(CARD_FIELDS)
      .sort('-heritageScore')
      .skip(skip)
      .limit(limit)
      .lean(),
    Place.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: places.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: places,
  });
});

// ─────────────────────────────────────────────────────────────────
// 5.  GET /api/places/featured
// ─────────────────────────────────────────────────────────────────

/**
 * Return top 6 featured places for the homepage hero / carousel.
 */
exports.getFeaturedPlaces = asyncHandler(async (_req, res) => {
  const places = await Place.find({ featured: true, published: true })
    .select('name slug coverImage subtitle category averageRating heritageScore')
    .sort('-heritageScore')
    .limit(6)
    .lean();

  res.json({ success: true, count: places.length, data: places });
});

// ─────────────────────────────────────────────────────────────────
// 6.  GET /api/places/nearby?lat=&lng=&maxDistance=
// ─────────────────────────────────────────────────────────────────

/**
 * Geospatial query — return up to 10 places near a point.
 * `maxDistance` is in **metres** (default 50 000 = 50 km).
 */
exports.getNearbyPlaces = asyncHandler(async (req, res, next) => {
  const { lat, lng, maxDistance } = req.query;

  if (!lat || !lng) {
    const err = new Error('Please provide lat and lng query parameters');
    err.statusCode = 400;
    return next(err);
  }

  const maxDist = parseInt(maxDistance, 10) || 50000;

  const places = await Place.find({
    published: true,
    'location.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: maxDist,
      },
    },
  })
    .select(CARD_FIELDS)
    .limit(10)
    .lean();

  res.json({ success: true, count: places.length, data: places });
});

// ─────────────────────────────────────────────────────────────────
// 7.  GET /api/places/search?q=
// ─────────────────────────────────────────────────────────────────

/**
 * Full-text search with regex fallback for partial matches.
 *
 * Tries the `$text` index first (relevance-scored), then falls back
 * to case-insensitive regex across name.en, name.bn, description.short,
 * and tags.
 */
exports.searchPlaces = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q || !q.trim()) {
    const err = new Error('Please provide a search query (?q=…)');
    err.statusCode = 400;
    return next(err);
  }

  const term = q.trim();
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

  // Attempt $text search (uses text index, returns with relevance score)
  let places = await Place.find(
    { $text: { $search: term }, published: true },
    { score: { $meta: 'textScore' } }
  )
    .select(`${CARD_FIELDS} score`)
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();

  // Regex fallback when text search yields nothing
  if (places.length === 0) {
    const regex = new RegExp(term, 'i');
    places = await Place.find({
      published: true,
      $or: [
        { 'name.en': regex },
        { 'name.bn': regex },
        { 'description.short': regex },
        { tags: regex },
      ],
    })
      .select(CARD_FIELDS)
      .sort('-heritageScore')
      .limit(limit)
      .lean();
  }

  res.json({ success: true, count: places.length, data: places });
});

// ─────────────────────────────────────────────────────────────────
// 8.  GET /api/places/stats
// ─────────────────────────────────────────────────────────────────

/**
 * Aggregation pipeline returning catalogue-wide statistics.
 */
exports.getPlaceStats = asyncHandler(async (_req, res) => {
  const [stats] = await Place.aggregate([
    { $match: { published: true } },
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              totalPlaces: { $sum: 1 },
              avgHeritageScore: { $avg: '$heritageScore' },
              totalViews: { $sum: '$totalViews' },
            },
          },
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byEra: [
          { $unwind: '$era' },
          { $group: { _id: '$era', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        byDivision: [
          { $group: { _id: '$location.division', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
      },
    },
  ]);

  const overall = stats.overall[0] || {
    totalPlaces: 0,
    avgHeritageScore: 0,
    totalViews: 0,
  };

  res.json({
    success: true,
    data: {
      totalPlaces: overall.totalPlaces,
      avgHeritageScore: Math.round((overall.avgHeritageScore || 0) * 10) / 10,
      totalViews: overall.totalViews,
      byCategory: stats.byCategory,
      byEra: stats.byEra,
      byDivision: stats.byDivision,
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// 9.  POST /api/places  (admin)
// ─────────────────────────────────────────────────────────────────

/**
 * Create a new heritage place (admin only).
 */
exports.createPlace = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;

  const place = await Place.create(req.body);

  res.status(201).json({ success: true, data: place });
});

// ─────────────────────────────────────────────────────────────────
// 10.  PUT /api/places/:id  (admin)
// ─────────────────────────────────────────────────────────────────

/**
 * Update a place by its MongoDB _id (admin only).
 */
exports.updatePlace = asyncHandler(async (req, res, next) => {
  const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!place) {
    const err = new Error('Place not found');
    err.statusCode = 404;
    return next(err);
  }

  res.json({ success: true, data: place });
});

// ─────────────────────────────────────────────────────────────────
// 11.  DELETE /api/places/:id  (admin)
// ─────────────────────────────────────────────────────────────────

/**
 * Delete a place and cascade-remove all associated reviews & stories.
 */
exports.deletePlace = asyncHandler(async (req, res, next) => {
  const place = await Place.findById(req.params.id);

  if (!place) {
    const err = new Error('Place not found');
    err.statusCode = 404;
    return next(err);
  }

  // Cascade: remove related reviews and stories
  await Promise.all([
    Review.deleteMany({ place: place._id }),
    Story.deleteMany({ place: place._id }),
  ]);

  await place.deleteOne();

  res.json({ success: true, message: 'Place and related data deleted' });
});

// ─────────────────────────────────────────────────────────────────
// 12.  GET /api/places/map/all
// ─────────────────────────────────────────────────────────────────

/**
 * Return **all** published places with only the fields needed for
 * map markers.  No pagination — intended for the interactive map view.
 *
 * Cache-friendly: sets a 5-minute Cache-Control header.
 */
exports.getMapPlaces = asyncHandler(async (_req, res) => {
  const places = await Place.find({ published: true })
    .select(MAP_FIELDS)
    .lean();

  // Cache for 5 minutes (static-ish data)
  res.set('Cache-Control', 'public, max-age=300, s-maxage=300');

  res.json({ success: true, count: places.length, data: places });
});
