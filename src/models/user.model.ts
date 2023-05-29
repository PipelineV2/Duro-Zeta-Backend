import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  googleID: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
  },
  emailVerified: {
    type: Boolean
  },
  profilePic: {
    type: String,
  },
  role: {
    type: String,
    enum: ["client", "admin"],
    default: "client"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model('User', UserSchema);