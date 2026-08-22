import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  projectUrl: { type: String, required: true },
  categories: [{ type: String }], // e.g. ["saas", "api"]
  featuredText: { type: String }, // e.g. "Featured SaaS"
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
