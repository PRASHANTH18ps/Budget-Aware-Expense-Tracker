import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"));
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
