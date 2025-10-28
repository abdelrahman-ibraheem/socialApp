import mongoose from 'mongoose';

export const connectDB = () => {
  mongoose.connect(process.env.DBCONNECTION as string).then(() => {
    console.log('DB connected successfully');
  }).catch((err: unknown) => {
    console.log('DB connection failed 😢',err);
});
};

