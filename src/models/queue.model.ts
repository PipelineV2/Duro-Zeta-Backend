import mongoose, { Schema } from 'mongoose';

const QueueSchema = new mongoose.Schema({
  businessId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Business",
  },
  qrcode: {
    type: String,
    required: true,
  },
  members: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  endsAt: {
    type: Date,
  },
  status: {
    type: String,
    default: "open",
    enum: ["closed", "open"]
  }
  
});
export default mongoose.model('Queue', QueueSchema);

