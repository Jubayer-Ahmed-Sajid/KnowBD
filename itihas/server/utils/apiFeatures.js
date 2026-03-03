/**
 * ApiFeatures – chainable query helper for Mongoose.
 *
 * Wraps a Mongoose Query and progressively applies search, filter,
 * sort, pagination and geospatial constraints based on the incoming
 * request query-string.
 *
 * Usage (in a controller):
 * ```js
 * const features = new ApiFeatures(Place.find(), req.query)
 *   .search()
 *   .filter()
 *   .sort()
 *   .paginate();
 *
 * const results = await features.query;
 * ```
 */
class ApiFeatures {
  /**
   * @param {import('mongoose').Query} query     – e.g. Model.find()
   * @param {Object}                   queryStr  – req.query
   */
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  // ─── Text search ────────────────────────────────────────────

  /**
   * Full-text `$text` search across indexed fields (name.en,
   * description.short, tags).  Activated when `?keyword=…` is present.
   *
   * If no text index exists it falls back to a case-insensitive regex
   * on `name.en`.
   *
   * @returns {ApiFeatures} this (chainable)
   */
  search() {
    if (this.queryStr.keyword) {
      const keyword = this.queryStr.keyword.trim();

      // Prefer the text index; fall back to regex on name.en
      this.query = this.query.find({
        $or: [
          { $text: { $search: keyword } },
          { 'name.en': { $regex: keyword, $options: 'i' } },
          { tags: { $regex: keyword, $options: 'i' } },
        ],
      });
    }
    return this;
  }

  // ─── Field filters ──────────────────────────────────────────

  /**
   * Equality / inclusion filters for common catalogue fields:
   * `category`, `era`, `location.division`, `historicalSignificance`,
   * `featured`, `published`.
   *
   * Arrays in query-strings (e.g. `?era=Ancient,Mughal`) are split
   * and matched with `$in`.
   *
   * @returns {ApiFeatures} this
   */
  filter() {
    const conditions = {};

    // Simple string equality / $in
    const filterableFields = {
      category: 'category',
      era: 'era',
      division: 'location.division',
      significance: 'historicalSignificance',
    };

    for (const [param, field] of Object.entries(filterableFields)) {
      if (this.queryStr[param]) {
        const values = this.queryStr[param].split(',').map((v) => v.trim());
        conditions[field] = values.length === 1 ? values[0] : { $in: values };
      }
    }

    // Boolean fields
    if (this.queryStr.featured !== undefined) {
      conditions.featured = this.queryStr.featured === 'true';
    }
    if (this.queryStr.published !== undefined) {
      conditions.published = this.queryStr.published === 'true';
    }

    // Heritage-score range
    if (this.queryStr.minScore || this.queryStr.maxScore) {
      conditions.heritageScore = {};
      if (this.queryStr.minScore)
        conditions.heritageScore.$gte = Number(this.queryStr.minScore);
      if (this.queryStr.maxScore)
        conditions.heritageScore.$lte = Number(this.queryStr.maxScore);
    }

    this.query = this.query.find(conditions);
    return this;
  }

  // ─── Sorting ────────────────────────────────────────────────

  /**
   * Sort by one or more fields via `?sort=field1,-field2`.
   *
   * Recognised shortcuts:
   *   `rating`  → `-averageRating`
   *   `views`   → `-totalViews`
   *   `name`    → `name.en`
   *   `newest`  → `-createdAt`
   *   `oldest`  → `createdAt`
   *   `score`   → `-heritageScore`
   *
   * Default: `-createdAt` (newest first).
   *
   * @returns {ApiFeatures} this
   */
  sort() {
    if (this.queryStr.sort) {
      const SORT_MAP = {
        rating: '-averageRating',
        views: '-totalViews',
        name: 'name.en',
        newest: '-createdAt',
        oldest: 'createdAt',
        score: '-heritageScore',
      };

      const sortBy = this.queryStr.sort
        .split(',')
        .map((s) => SORT_MAP[s.trim()] || s.trim())
        .join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // ─── Pagination ─────────────────────────────────────────────

  /**
   * Page-based pagination.
   *
   * Query params: `?page=2&limit=12`
   * Defaults: page 1, limit 12.
   *
   * @returns {ApiFeatures} this
   */
  paginate() {
    const page = Math.max(parseInt(this.queryStr.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(this.queryStr.limit, 10) || 12, 1),
      100 // hard cap
    );
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // Stash pagination metadata so controllers can include it
    this.pagination = { page, limit, skip };
    return this;
  }

  // ─── Geospatial: nearby ─────────────────────────────────────

  /**
   * Find places near a point.
   *
   * Query params: `?lat=23.7&lng=90.4&maxDistance=50`
   * `maxDistance` is in **kilometres** (converted to metres for `$near`).
   * Defaults to 50 km.
   *
   * Requires a `2dsphere` index on `location.coordinates`.
   *
   * @returns {ApiFeatures} this
   */
  near() {
    const { lat, lng, maxDistance } = this.queryStr;

    if (lat && lng) {
      const maxDist = (parseFloat(maxDistance) || 50) * 1000; // km → m

      this.query = this.query.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)],
            },
            $maxDistance: maxDist,
          },
        },
      });
    }
    return this;
  }
}

module.exports = ApiFeatures;
