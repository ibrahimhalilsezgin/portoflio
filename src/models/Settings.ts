import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  openaiApiKey: {
    type: String,
    default: '',
  },
  openaiModel: {
    type: String,
    default: 'gpt-4o-mini',
  },
  // Singleton pattern, we only need one settings document
  isSingleton: {
    type: Boolean,
    default: true,
    unique: true
  }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
