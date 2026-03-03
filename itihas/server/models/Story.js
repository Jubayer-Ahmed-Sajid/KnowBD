const mongoose = require('mongoose');

/**
 * Story – a user-submitted experience or narrative about a heritage place.
 *
 * Stories are user-generated content and require admin approval
 * (`approved: false` by default) before they appear publicly.
 * Other users can "like" a story; the `likes` array stores unique User refs.
 *
 * @type {mongoose.Schema}
 */
const storySchema = new mongoose.Schema(
  {
    /* ── References ───────────────────────────────────────── */

    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Place',
      required: [true, 'Story must be associated with a place'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Story must have an author'],
    },

    /* ── Content ─────────────────────────────────────────── */

    title: {
      type: String,
      required: [true, 'Story title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    content: {
      type: String,
      required: [true, 'Story content is required'],
      trim: true,
      maxlength: [3000, 'Story content cannot exceed 3000 characters'],
    },

    images: [
      {
        type: String,
        trim: true,
      },
    ],

    /* ── Moderation ──────────────────────────────────────── */

    approved: {
      type: Boolean,
      default: false,
    },

    /* ── Social ──────────────────────────────────────────── */

    likes: [
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

/** Quick lookups: stories for a place, by a user, approved filter */
storySchema.index({ place: 1, approved: 1 });
storySchema.index({ user: 1 });

// ─── Virtuals ───────────────────────────────────────────────────

/**
 * Virtual `likesCount` so we don't have to transfer the whole
 * likes array just to show a count.
 */
storySchema.virtual('likesCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

module.exports = mongoose.model('Story', storySchema);
