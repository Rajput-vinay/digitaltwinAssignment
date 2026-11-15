import { validateUser } from "../validators/userValidator.js";
import { HttpError } from "../middleware/errorHandler.js";
import User from "../models/User.js";

// Pass errors from async route functions to Express error middleware.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Escape special characters before using a search value in a regular expression.
const escapeRegex = (value) =>
  value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

const DAY = 24 * 60 * 60 * 1000;

// Create a new user.
export const createUser = asyncHandler(async (req, res) => {
  const { errors, data } = validateUser(req.body);

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Validation Error", errors);
  }

  const user = await User.create(data);
  res.status(201).json(user);
});

// Update the fields of an existing user.
export const updateUser = asyncHandler(async (req, res) => {
  const { errors, data } = validateUser(req.body, { partial: true });

  if (Object.keys(errors).length > 0) {
    throw new HttpError(400, "Validation Error", errors);
  }

  if (Object.keys(data).length === 0) {
    throw new HttpError(400, "At least one field is required");
  }

  const user = await User.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.status(200).json(user);
});

// Delete a user by ID.
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json({
    message: "User deleted successfully",
    id: user._id,
  });
});

// Get details of one user.
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  res.json(user);
});

// Return counts used by the dashboard.
export const getStats = asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * DAY);

  const [total, active, inactive, addedThisWeek] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "inactive" }),
    User.countDocuments({ createdAt: { $gte: weekAgo } }),
  ]);

  res.json({
    total,
    active,
    inactive,
    addedThisWeek,
  });
});

// Get users with optional search filters and pagination.
export const listUsers = asyncHandler(async (req, res) => {
  const { q, status, role } = req.query;
  const filter = {};

  // Search by name or email when a search term is provided.
  if (q) {
    const searchRegex = new RegExp(escapeRegex(String(q)), "i");
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  if (status) filter.status = String(status);
  if (role) filter.role = String(role);

  // Keep the page size between 1 and 50 users.
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const total = await User.countDocuments(filter);
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  // Keep the requested page within the available page range.
  const page = Math.min(
    Math.max(parseInt(req.query.page, 10) || 1, 1),
    totalPages,
  );

  const data = await User.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);

  res.json({
    data,
    total,
    totalPages,
    page,
  });
});
