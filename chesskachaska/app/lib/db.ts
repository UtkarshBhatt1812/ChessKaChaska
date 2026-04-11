import mongoose from "mongoose";

export const connectDB = async () => {
    
    const MONGO_URI = process.env.MONGO_URI ;
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is not defined in environment variables");
    }
    try {
        const con = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${con.connection.host}`); 
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }  
}