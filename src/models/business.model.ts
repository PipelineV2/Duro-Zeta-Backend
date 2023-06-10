import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema({
  address: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
});

const BusinessSchema = new Schema({
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
  location: LocationSchema, // Nested location schema
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

const Business = mongoose.model('Business', BusinessSchema);

export default Business;
