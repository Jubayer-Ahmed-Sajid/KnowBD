const mongoose = require('mongoose');

/**
 * Review – a user's rating & commentary for a heritage place.
 *
 * A compound unique index on `{ place, user }` enforces the
 * one-review-per-user-per-place constraint at the database level.
 *
 * After every save or remove the static `calcAverageRating` on the
 * Place model is invoked to keep aggregated stats in sync.
 *
 * @type {mongoose.Schema}
 */
const reviewSchema = new mongoose.Schema(
  {
    /* ── References ───────────────────────────────────────── */

    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: [true, 'Review must belong to a place'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },

    /* ── Content ─────────────────────────────────────────── */

    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      maxlength: [1000, 'Review text cannot exceed 1000 characters'],
    },

    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },

    visitDate: {
      type: Date,
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    /* ── Social ──────────────────────────────────────────── */

    helpful: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────

/**
 * Compound unique index — a user may only review a place once.
 */
reviewSchema.index({ place: 1, user: 1 }, { unique: true });

// ─── Statics: recalculate Place rating ─────────────────────────

/**
 * Run an aggregation pipeline over Reviews for the given place
 * and persist the calculated averageRating / totalReviews on the
 * Place document.
 *
 * @param {mongoose.Types.ObjectId} placeId
 */
reviewSchema.statics.calcAverageRating = async function (placeId) {
  const Place = mongoose.model('Place');

  const [stats] = await this.aggregate([
    { $match: { place: placeId } },
    {
      $group: {
        _id: '$place',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Place.findByIdAndUpdate(placeId, {
    averageRating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
    totalReviews: stats ? stats.totalReviews : 0,
  });
};

// ─── Hooks ──────────────────────────────────────────────────────

/**
 * After saving a review, recalculate the parent Place's stats.
 */
reviewSchema.post('save', async function () {
  await this.constructor.calcAverageRating(this.place);
});

/**
 * After removing a review, recalculate the parent Place's stats.
 *
 * Works with `findOneAndDelete` / `deleteOne` via the query middleware
 * pattern: the pre-hook stores the doc, and the post-hook triggers the
 * recalculation.
 */
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // Stash the document being removed so we can access its `place` in post
  this._docToUpdate = await this.model.findOne(this.getQuery());
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this._docToUpdate) {
    await this._docToUpdate.constructor.calcAverageRating(
      this._docToUpdate.place
    );
  }
});

/**
 * Also handle doc-level `remove()` calls.
 */
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.calcAverageRating(this.place);
});

module.exports = mongoose.model('Review', reviewSchema);
