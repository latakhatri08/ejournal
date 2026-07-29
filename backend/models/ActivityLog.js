const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, enum: ['create', 'update', 'delete', 'login', 'logout', 'export', 'upload'] },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
  details: { type: String, default: '' },
  ip: { type: String, default: '' }
}, { timestamps: true });

ActivityLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
