import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String, // e.g. CEO, Developer, Colleague
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
  approved: {
    type: Boolean,
    default: false, // Must be approved by admin before showing on site
  },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);
