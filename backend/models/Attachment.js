const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  journal: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', default: null },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Attachment', AttachmentSchema);
