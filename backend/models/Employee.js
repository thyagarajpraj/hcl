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
    },
    role: {
      type: String,
      enum: ["employee", "manager", "admin"],
      default: "employee"
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index for name and department text searches
employeeSchema.index({ name: "text", department: "text" });

// Soft delete middleware - exclude deleted records by default
employeeSchema.pre("find", function () {
  this.where({ isDeleted: { $ne: true } });
});

employeeSchema.pre("findOne", function () {
  this.where({ isDeleted: false });
});

employeeSchema.pre("findOneAndUpdate", function () {
  this.where({ isDeleted: false });
});

export default mongoose.model("Employee", employeeSchema);
