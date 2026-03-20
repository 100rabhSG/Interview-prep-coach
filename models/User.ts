import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  googleId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    googleId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
