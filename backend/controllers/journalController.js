const Journal = require('../models/Journal');
const ActivityLog = require('../models/ActivityLog');
const MoodLog = require('../models/MoodLog');

exports.createJournal = async (req, res) => {
  try {
    const { title, content, plainText, category, tags, mood, weather, location, isDraft } = req.body;
    const wordCount = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    const journal = await Journal.create({
      user: req.user.id, title, content, plainText, category, tags, mood, weather, location, isDraft, wordCount
    });
    if (mood) {
      await MoodLog.create({ user: req.user.id, mood, journal: journal._id });
    }
    await ActivityLog.create({ user: req.user.id, action: 'create', resource: 'journal', resourceId: journal._id, details: title });
    const populated = await journal.populate(['category', 'tags']);
    res.status(201).json({ success: true, journal: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJournals = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, tag, mood, dateFrom, dateTo, sort = '-createdAt', pinned, bookmarked } = req.query;
    const query = { user: req.user.id };
    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }, { plainText: { $regex: search, $options: 'i' } }];
    }
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (mood) query.mood = mood;
    if (pinned === 'true') query.isPinned = true;
    if (bookmarked === 'true') query.isBookmarked = true;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    const total = await Journal.countDocuments(query);
    const journals = await Journal.find(query)
      .populate('category', 'name color')
      .populate('tags', 'name color')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, journals, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJournal = async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user.id })
      .populate('category', 'name color')
      .populate('tags', 'name color');
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal not found' });
    }
    res.json({ success: true, journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateJournal = async (req, res) => {
  try {
    const { title, content, plainText, category, tags, mood, weather, location, isDraft } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (plainText !== undefined) {
      updateData.plainText = plainText;
      updateData.wordCount = plainText.split(/\s+/).filter(Boolean).length;
    }
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (mood !== undefined) {
      updateData.mood = mood;
      await MoodLog.create({ user: req.user.id, mood, journal: req.params.id });
    }
    if (weather !== undefined) updateData.weather = weather;
    if (location !== undefined) updateData.location = location;
    if (isDraft !== undefined) updateData.isDraft = isDraft;
    const journal = await Journal.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, updateData, { new: true, runValidators: true })
      .populate('category', 'name color')
      .populate('tags', 'name color');
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal not found' });
    }
    await ActivityLog.create({ user: req.user.id, action: 'update', resource: 'journal', resourceId: journal._id, details: title || 'Updated' });
    res.json({ success: true, journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal not found' });
    }
    await ActivityLog.create({ user: req.user.id, action: 'delete', resource: 'journal', resourceId: journal._id, details: journal.title });
    res.json({ success: true, message: 'Journal deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user.id });
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal not found' });
    }
    journal.isPinned = !journal.isPinned;
    await journal.save();
    res.json({ success: true, journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleBookmark = async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user.id });
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal not found' });
    }
    journal.isBookmarked = !journal.isBookmarked;
    await journal.save();
    res.json({ success: true, journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCalendarJournals = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const journals = await Journal.find({
      user: req.user.id,
      createdAt: { $gte: startDate, $lte: endDate }
    }).select('title mood createdAt isPinned').sort('createdAt');
    res.json({ success: true, journals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.autoSave = async (req, res) => {
  try {
    const { title, content, plainText, mood, category, tags } = req.body;
    let journal;
    if (req.params.id) {
      journal = await Journal.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { title, content, plainText, mood, category, tags, isDraft: true, wordCount: plainText ? plainText.split(/\s+/).filter(Boolean).length : 0 },
        { new: true }
      );
    } else {
      journal = await Journal.create({
        user: req.user.id, title: title || 'Untitled Draft', content, plainText, mood, category, tags, isDraft: true,
        wordCount: plainText ? plainText.split(/\s+/).filter(Boolean).length : 0
      });
    }
    res.json({ success: true, journal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportJournal = async (req, res) => {
  try {
    const journal = await Journal.findOne({ _id: req.params.id, user: req.user.id })
      .populate('category', 'name')
      .populate('tags', 'name');
    if (!journal) {
      return res.status(404).json({ success: false, message: 'Journal not found' });
    }
    const { format = 'markdown' } = req.query;
    if (format === 'markdown') {
      const md = `# ${journal.title}\n\n**Date:** ${journal.createdAt.toDateString()}\n**Mood:** ${journal.mood || 'N/A'}\n**Category:** ${journal.category?.name || 'N/A'}\n**Tags:** ${journal.tags?.map(t => t.name).join(', ') || 'N/A'}\n\n---\n\n${journal.content}`;
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${journal.title.replace(/[^a-z0-9]/gi, '_')}.md"`);
      return res.send(md);
    }
    if (format === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${journal.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
      doc.pipe(res);
      doc.fontSize(24).text(journal.title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#666');
      doc.text(`Date: ${journal.createdAt.toDateString()} | Mood: ${journal.mood || 'N/A'}`);
      doc.moveDown();
      doc.fillColor('#000').fontSize(12).text(journal.plainText || journal.content.replace(/<[^>]*>/g, ''), { lineGap: 4 });
      doc.end();
    }
    await ActivityLog.create({ user: req.user.id, action: 'export', resource: 'journal', resourceId: journal._id, details: format });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
