const mongoose = require('mongoose');

const MoodLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { type: String, enum: ['great', 'good', 'neutral', 'bad', 'terrible'], required: true },
  note: { type: String, default: '' },
  journal: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', default: null },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

MoodLogSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('MoodLog', MoodLogSchema);
