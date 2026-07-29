const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  plainText: { type: String, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  mood: { type: String, enum: ['great', 'good', 'neutral', 'bad', 'terrible'], default: 'neutral' },
  isPinned: { type: Boolean, default: false },
  isBookmarked: { type: Boolean, default: false },
  isDraft: { type: Boolean, default: false },
  wordCount: { type: Number, default: 0 },
  weather: { type: String, default: '' },
  location: { type: String, default: '' }
}, { timestamps: true });

JournalSchema.index({ user: 1, createdAt: -1 });
JournalSchema.index({ user: 1, title: 'text', content: 'text' });
JournalSchema.index({ user: 1, mood: 1 });
JournalSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Journal', JournalSchema);
