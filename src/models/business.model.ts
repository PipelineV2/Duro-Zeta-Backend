import mongoose, { Schema } from 'mongoose';

const BusinessSchema = new mongoose.Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  logo: {
    type: String,
  },
  description: {
    type: String
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "inactive"
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model('Business', BusinessSchema);