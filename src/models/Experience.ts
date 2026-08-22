import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  year: { type: String, required: true }, // e.g. "2024 - Present"
  role: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
