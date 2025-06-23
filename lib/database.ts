import mongoose from "mongoose";

let client: mongoose.Mongoose | null = null;

const connectDB = async () => {
  if (client?.connection.readyState) {
    return client;
  } else {
    try {
      client = await mongoose.connect(process.env.DATABASE_URL as string);
      console.log("MongoDB connected successfully");
      return client;
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      return null;
    }
  }

};

export default connectDB;

