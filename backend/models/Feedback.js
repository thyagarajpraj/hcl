import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 5000
  },
  givenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  givenTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update updatedAt on save
feedbackSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Composite index for efficient queries
feedbackSchema.index({
  givenBy: 1,
  givenTo: 1,
  createdAt: -1,
  isDeleted: 1
});

// Index for feedback received by employee
feedbackSchema.index({
  givenTo: 1,
  createdAt: -1,
  isDeleted: 1
});

// Partial index for duplicate check (24-hour window)
feedbackSchema.index(
  {
    givenBy: 1,
    givenTo: 1,
    isDeleted: 1
  },
  {
    name: "unique_feedback_per_day",
    sparse: true
  }
);

// Soft delete middleware - exclude deleted feedback by default
feedbackSchema.pre("find", function () {
  this.where({ isDeleted: { $ne: true } });
});

feedbackSchema.pre("findOne", function () {
  this.where({ isDeleted: { $ne: true } });
});

feedbackSchema.pre("findOneAndUpdate", function () {
  this.where({ isDeleted: { $ne: true } });
});

feedbackSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
});

feedbackSchema.virtual("avgRating").get(function() {
  return this.rating;
});

export default mongoose.model("Feedback", feedbackSchema);
