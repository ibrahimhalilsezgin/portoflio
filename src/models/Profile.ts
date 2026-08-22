import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  about: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  githubUrl: { type: String, required: true },
  linkedinUrl: { type: String, required: true },
  githubUsername: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
