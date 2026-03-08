import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    }
  },
  {
    timestamps: true
  }
);

// Index for name and department text searches
employeeSchema.index({ name: "text", department: "text" });

export default mongoose.model("Employee", employeeSchema);
