const Attachment = require('../models/Attachment');
const ActivityLog = require('../models/ActivityLog');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const attachment = await Attachment.create({
      user: req.user.id,
      journal: req.body.journalId || null,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    });
    await ActivityLog.create({ user: req.user.id, action: 'upload', resource: 'attachment', resourceId: attachment._id, details: req.file.originalname });
    res.status(201).json({ success: true, attachment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttachments = async (req, res) => {
  try {
    const { journalId } = req.query;
    const query = { user: req.user.id };
    if (journalId) query.journal = journalId;
    const attachments = await Attachment.find(query).sort('-createdAt');
    res.json({ success: true, attachments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Attachment not found' });
    }
    const fs = require('fs');
    const filePath = `uploads/${attachment.fileName}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, message: 'Attachment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
