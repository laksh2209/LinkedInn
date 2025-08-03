import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Remove deprecated options
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    // In development, continue without MongoDB for testing purposes
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing in development mode without MongoDB...');
      console.log('   Note: Database operations will not work properly.');
      return;
    }
    
    process.exit(1);
  }
};

export default connectDB; 