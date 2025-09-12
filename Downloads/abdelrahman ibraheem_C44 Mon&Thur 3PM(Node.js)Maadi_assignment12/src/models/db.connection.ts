import mongoose from 'mongoose';

export const connectDB = () => {
  mongoose.connect('mongodb://localhost:27017/SocialApp').then(() => {
    console.log('DB connected successfully');
  }).catch((err: unknown) => {
    console.log('DB connection failed 😢',err);
});
};

