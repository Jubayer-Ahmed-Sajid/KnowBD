const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * @typedef {Object} StoryChapter
 * @property {number} chapter  - Chapter number (sequential order)
 * @property {string} title    - Chapter heading
 * @property {string} content  - Long-form narrative (500-1500 words)
 * @property {string} image    - Illustration URL for this chapter
 * @property {string} year     - Human-readable date, e.g. "1678 AD"
 * @property {string} era      - Broad historical era label
 */

/**
 * @typedef {Object} PlaceImage
 * @property {string} url     - Image URL (Cloudinary / external)
 * @property {string} caption - Short caption text
 * @property {string} credit  - Photographer / source credit
 */

/**
 * @typedef {Object} Fact
 * @property {string} title   - Fact heading, e.g. "Largest Mosque"
 * @property {string} content - "Did-You-Know?" paragraph
 * @property {string} icon    - Icon identifier (e.g. "mosque", "calendar")
 */

/**
 * @typedef {Object} TimelineEntry
 * @property {string} year  - e.g. "1459", "3rd Century BC"
 * @property {string} event - What happened
 */

// ─── Sub-schemas ────────────────────────────────────────────────

const storyChapterSchema = new mongoose.Schema(
  {
    chapter: {
      type: Number,
      required: [true, 'Chapter number is required'],
    },
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    year: {
      type: String,
      trim: true,
    },
    era: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const placeImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    credit: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const factSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      trim: true,
    },
    event: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// ─── Enums ──────────────────────────────────────────────────────

/** Historical-significance tiers */
const SIGNIFICANCE_ENUM = [
  'UNESCO World Heritage',
  'National Heritage',
  'Regional Heritage',
  'Cultural Landmark',
  'Natural Wonder',
];

/** Broad historical eras of Bangladesh */
const ERA_ENUM = [
  'Ancient (pre-1200)',
  'Sultanate (1200-1576)',
  'Mughal (1576-1757)',
  'Colonial (1757-1947)',
  'Liberation War (1971)',
  'Modern Bangladesh',
];

/** Site categories */
const CATEGORY_ENUM = [
  'Archaeological',
  'Architectural',
  'Religious',
  'Natural',
  'Liberation War',
  'Cultural',
  'UNESCO',
];

/** Eight administrative divisions of Bangladesh */
const DIVISION_ENUM = [
  'Barishal',
  'Chattogram',
  'Dhaka',
  'Khulna',
  'Mymensingh',
  'Rajshahi',
  'Rangpur',
  'Sylhet',
];

// ─── Main Schema ────────────────────────────────────────────────

/**
 * Place – the core heritage-site document.
 *
 * Each Place stores bilingual names (English + Bengali), rich narrative
 * "story chapters" that are the key editorial feature, geolocation for
 * map rendering, practical visitor info, and crowd-sourced ratings.
 *
 * @type {mongoose.Schema}
 */
const placeSchema = new mongoose.Schema(
  {
    /* ── Identity ─────────────────────────────────────────── */

    name: {
      en: {
        type: String,
        required: [true, 'English name is required'],
        trim: true,
        maxlength: [200, 'English name cannot exceed 200 characters'],
      },
      bn: {
        type: String,
        trim: true,
        maxlength: [200, 'Bengali name cannot exceed 200 characters'],
      },
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: [300, 'Subtitle cannot exceed 300 characters'],
    },

    /* ── Descriptions ─────────────────────────────────────── */

    description: {
      short: {
        type: String,
        trim: true,
        maxlength: [200, 'Short description cannot exceed 200 characters'],
      },
      full: {
        type: String,
        trim: true,
        maxlength: [5000, 'Full description cannot exceed 5000 characters'],
      },
    },

    /* ── Story Chapters (KEY FEATURE) ─────────────────────── */

    story: {
      type: [storyChapterSchema],
      validate: {
        validator: (arr) => arr.length <= 7,
        message: 'A place can have at most 7 story chapters',
      },
    },

    /* ── Classification ───────────────────────────────────── */

    historicalSignificance: {
      type: String,
      enum: {
        values: SIGNIFICANCE_ENUM,
        message: '{VALUE} is not a valid significance tier',
      },
    },

    era: {
      type: [String],
      enum: {
        values: ERA_ENUM,
        message: '{VALUE} is not a recognised era',
      },
    },

    category: {
      type: String,
      enum: {
        values: CATEGORY_ENUM,
        message: '{VALUE} is not a valid category',
      },
    },

    /* ── Location / GeoJSON ───────────────────────────────── */

    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
      address: {
        type: String,
        trim: true,
      },
      division: {
        type: String,
        enum: {
          values: DIVISION_ENUM,
          message: '{VALUE} is not a valid division of Bangladesh',
        },
      },
      district: {
        type: String,
        trim: true,
      },
    },

    /* ── Media ────────────────────────────────────────────── */

    images: [placeImageSchema],

    coverImage: {
      type: String,
      trim: true,
    },

    /* ── Enrichments ──────────────────────────────────────── */

    facts: [factSchema],
    timeline: [timelineSchema],

    /* ── Practical Visitor Info ────────────────────────────── */

    practicalInfo: {
      openingHours: {
        type: String,
        trim: true,
      },
      entryFee: {
        local: { type: String, trim: true },
        foreign: { type: String, trim: true },
      },
      bestTimeToVisit: {
        type: String,
        trim: true,
      },
      howToReach: {
        type: String,
        trim: true,
      },
      nearbyPlaces: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Place',
        },
      ],
    },

    /* ── Scoring & Metadata ───────────────────────────────── */

    heritageScore: {
      type: Number,
      min: [1, 'Heritage score must be at least 1'],
      max: [100, 'Heritage score cannot exceed 100'],
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    featured: {
      type: Boolean,
      default: false,
    },

    published: {
      type: Boolean,
      default: true,
    },

    /* ── Crowd-sourced aggregates ─────────────────────────── */

    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    totalViews: {
      type: Number,
      default: 0,
    },

    /* ── Ownership ────────────────────────────────────────── */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────

placeSchema.index({ 'location.coordinates': '2dsphere' });
placeSchema.index({ category: 1, era: 1 });
placeSchema.index({ featured: 1 });
placeSchema.index(
  { 'name.en': 'text', 'description.short': 'text', tags: 'text' },
  { weights: { 'name.en': 10, 'description.short': 5, tags: 3 }, name: 'place_text_idx' }
);

// ─── Pre-save: auto-generate slug ──────────────────────────────

placeSchema.pre('save', function (next) {
  if (this.isModified('name.en') || !this.slug) {
    this.slug = slugify(this.name.en, { lower: true, strict: true });
  }
  next();
});

// ─── Statics ────────────────────────────────────────────────────

/**
 * Recalculate and persist the averageRating & totalReviews for a
 * given place using the Review collection's aggregation pipeline.
 *
 * @param {mongoose.Types.ObjectId} placeId
 */
placeSchema.statics.calcAverageRating = async function (placeId) {
  const Review = mongoose.model('Review');

  const [stats] = await Review.aggregate([
    { $match: { place: placeId } },
    {
      $group: {
        _id: '$place',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await this.findByIdAndUpdate(placeId, {
    averageRating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
    totalReviews: stats ? stats.totalReviews : 0,
  });
};

// ─── Virtual: reviews ───────────────────────────────────────────

placeSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'place',
  justOne: false,
});

module.exports = mongoose.model('Place', placeSchema);
