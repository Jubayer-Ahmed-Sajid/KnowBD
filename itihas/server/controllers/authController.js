const User = require('../models/User');
const Place = require('../models/Place');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

/**
 * Sanitise user document for API responses.
 * Strips password and internal mongo fields.
 */
const sanitiseUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  bookmarks: user.bookmarks,
  visitedPlaces: user.visitedPlaces,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────────
// 1.  POST /api/auth/register
// ─────────────────────────────────────────────────────────────────

/**
 * Register a new user account.
 *
 * - Checks for duplicate email (case-insensitive via model `lowercase`)
 * - Password is auto-hashed by the User pre-save hook
 * - Returns JWT + sanitised user object
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check for existing user
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 400;
    return next(err);
  }

  const user = await User.create({ name, email, password });

  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    data: sanitiseUser(user),
  });
});

// ─────────────────────────────────────────────────────────────────
// 2.  POST /api/auth/login
// ─────────────────────────────────────────────────────────────────

/**
 * Authenticate an existing user with email + password.
 *
 * - Explicitly selects the `password` field (normally excluded)
 * - Verifies password via `user.matchPassword()`
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password hash for comparison
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    return next(err);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    return next(err);
  }

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Logged in successfully',
    token,
    data: sanitiseUser(user),
  });
});

// ─────────────────────────────────────────────────────────────────
// 3.  GET /api/auth/me
// ─────────────────────────────────────────────────────────────────

/**
 * Return the currently authenticated user's profile.
 *
 * Populates bookmarks with basic place info and includes
 * a count of visited places.
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate({
      path: 'bookmarks',
      select: 'name slug coverImage category location.division averageRating',
    })
    .populate({
      path: 'visitedPlaces',
      select: 'name slug coverImage category',
    });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    return next(err);
  }

  res.json({
    success: true,
    data: {
      ...sanitiseUser(user),
      bookmarks: user.bookmarks,          // already populated
      visitedPlaces: user.visitedPlaces,   // already populated
      visitedCount: user.visitedPlaces.length,
    },
  });
});

// ─────────────────────────────────────────────────────────────────
// 4.  PUT /api/auth/profile
// ─────────────────────────────────────────────────────────────────

/**
 * Update the authenticated user's name, bio, or avatar.
 *
 * Email, role and password cannot be changed through this route.
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = { name: req.body.name, bio: req.body.bio, avatar: req.body.avatar };

  // Strip undefined values so we only update fields that were sent
  const updates = Object.fromEntries(
    Object.entries(allowedFields).filter(([, v]) => v !== undefined)
  );

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    return next(err);
  }

  res.json({
    success: true,
    message: 'Profile updated',
    data: sanitiseUser(user),
  });
});

// ─────────────────────────────────────────────────────────────────
// 5.  PUT /api/auth/password
// ─────────────────────────────────────────────────────────────────

/**
 * Change the authenticated user's password.
 *
 * Requires `currentPassword` and `newPassword`.  The pre-save hook
 * automatically hashes the new password.  Returns a fresh JWT so
 * existing sessions remain valid.
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    const err = new Error('Please provide currentPassword and newPassword');
    err.statusCode = 400;
    return next(err);
  }

  if (newPassword.length < 6) {
    const err = new Error('New password must be at least 6 characters');
    err.statusCode = 400;
    return next(err);
  }

  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    const err = new Error('Current password is incorrect');
    err.statusCode = 401;
    return next(err);
  }

  user.password = newPassword;
  await user.save(); // triggers pre-save hash

  const token = generateToken(user);

  res.json({
    success: true,
    message: 'Password updated successfully',
    token,
  });
});

// ─────────────────────────────────────────────────────────────────
// 6.  PUT /api/auth/bookmarks/:placeId
// ─────────────────────────────────────────────────────────────────

/**
 * Toggle a place in the user's bookmarks array.
 *
 * - If already bookmarked → remove ($pull)
 * - If not bookmarked    → add    ($addToSet)
 */
exports.toggleBookmark = asyncHandler(async (req, res, next) => {
  const { placeId } = req.params;

  // Verify the place exists
  const placeExists = await Place.exists({ _id: placeId });
  if (!placeExists) {
    const err = new Error('Place not found');
    err.statusCode = 404;
    return next(err);
  }

  const user = await User.findById(req.user.id);
  const isBookmarked = user.bookmarks.some(
    (id) => id.toString() === placeId
  );

  let updatedUser;
  let message;

  if (isBookmarked) {
    updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { bookmarks: placeId } },
      { new: true }
    );
    message = 'Bookmark removed';
  } else {
    updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { bookmarks: placeId } },
      { new: true }
    );
    message = 'Bookmark added';
  }

  res.json({
    success: true,
    message,
    data: { bookmarks: updatedUser.bookmarks, bookmarked: !isBookmarked },
  });
});

// ─────────────────────────────────────────────────────────────────
// 7.  PUT /api/auth/visited/:placeId
// ─────────────────────────────────────────────────────────────────

/**
 * Mark a place as visited (add to `visitedPlaces` with $addToSet).
 */
exports.addVisitedPlace = asyncHandler(async (req, res, next) => {
  const { placeId } = req.params;

  const placeExists = await Place.exists({ _id: placeId });
  if (!placeExists) {
    const err = new Error('Place not found');
    err.statusCode = 404;
    return next(err);
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { visitedPlaces: placeId } },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Place marked as visited',
    data: { visitedPlaces: user.visitedPlaces },
  });
});

// ─────────────────────────────────────────────────────────────────
// 8.  GET /api/auth/bookmarks
// ─────────────────────────────────────────────────────────────────

/**
 * Return the user's bookmarked places, fully populated.
 */
exports.getBookmarks = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: 'bookmarks',
    select:
      'name slug coverImage category location.division averageRating heritageScore subtitle',
  });

  res.json({
    success: true,
    count: user.bookmarks.length,
    data: user.bookmarks,
  });
});

// ─────────────────────────────────────────────────────────────────
// 9.  POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────

/**
 * Logout — stateless.  The client discards the token.
 * Endpoint exists for symmetry and future token-blacklist support.
 */
exports.logout = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});
