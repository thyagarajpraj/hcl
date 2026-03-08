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
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Composite index for efficient queries
feedbackSchema.index({
  givenBy: 1,
  givenTo: 1,
  createdAt: -1
});

// Index for feedback received by employee
feedbackSchema.index({
  givenTo: 1,
  createdAt: -1
});

// Partial index for duplicate check (24-hour window)
feedbackSchema.index(
  {
    givenBy: 1,
    givenTo: 1
  },
  {
    name: "unique_feedback_per_day",
    sparse: true
  }
);

feedbackSchema.virtual("avgRating").get(function() {
  return this.rating;
});

export default mongoose.model("Feedback", feedbackSchema);
