import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  audio: mongoose.Schema.Types.ObjectId, // GridFS file ID
  transcript: String,
  images: [mongoose.Schema.Types.ObjectId], // Array of GridFS file IDs
  favorite: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Note || mongoose.model("Note", noteSchema);
