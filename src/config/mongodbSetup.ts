import mongoose from 'mongoose';

const connectDB = async (mongoUri: string) => {
  try {
    await mongoose.connect(
      mongoUri,
      {
        dbName: "food-nostalgia-data"
      }
    );
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

export default connectDB;
