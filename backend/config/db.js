import mongoose from "mongoose";

export async function connectDB() {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/employee_feedback";

  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected at ${mongoUri}`);
}
