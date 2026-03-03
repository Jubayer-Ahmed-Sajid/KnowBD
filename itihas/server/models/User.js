const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * User – authenticated visitor / admin account.
 *
 * Passwords are hashed on save with bcryptjs (12 salt rounds).
 * The `password` field is excluded from query results by default;
 * use `.select('+password')` when authenticating.
 *
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema(
  {
    /* ── Profile ─────────────────────────────────────────── */

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never returned in queries by default
    },

    avatar: {
      type: String,
      default:
        'https://ui-avatars.com/api/?background=1a5632&color=f5f0e8&name=User',
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },

    /* ── Collections ─────────────────────────────────────── */

    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
    ],

    visitedPlaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
      },
    ],

    /* ── About ───────────────────────────────────────────── */

    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Pre-save: hash password ────────────────────────────────────

/**
 * Hash the plain-text password whenever it is new or modified.
 * Uses bcryptjs with 12 salt rounds.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance methods ───────────────────────────────────────────

/**
 * Compare a plain-text candidate password against the stored hash.
 *
 * @param  {string}  enteredPassword - Plain-text password from login form
 * @returns {Promise<boolean>} true when passwords match
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate a signed JSON Web Token containing the user's id and role.
 *
 * @returns {string} Signed JWT
 */
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = mongoose.model('User', userSchema);
