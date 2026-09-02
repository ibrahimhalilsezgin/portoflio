import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  activeProvider: {
    type: String,
    enum: ['openai', 'gemini', 'nvidia'],
    default: 'openai',
  },
  // OpenAI Settings
  openaiApiKey: { type: String, default: '' },
  openaiModel: { type: String, default: 'gpt-4o-mini' },
  // Gemini Settings
  geminiApiKey: { type: String, default: '' },
  geminiModel: { type: String, default: 'gemini-2.5-flash' },
  // NVIDIA NIM Settings
  nvidiaApiKey: { type: String, default: '' },
  nvidiaModel: { type: String, default: 'meta/llama-3.1-70b-instruct' },
  // Singleton pattern
  isSingleton: { type: Boolean, default: true, unique: true }
}, { timestamps: true });

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema);
