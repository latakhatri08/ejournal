const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  journal: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true },
  note: { type: String, default: '' }
}, { timestamps: true });

BookmarkSchema.index({ user: 1, journal: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);
