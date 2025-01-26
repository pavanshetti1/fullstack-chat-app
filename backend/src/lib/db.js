import mongoose from 'mongoose';

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MONGO DB connected successfully`);
    }
    catch(error){
        console.log("Mongodb connection error" , error);
    }
}