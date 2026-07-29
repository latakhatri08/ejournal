const Tag = require('../models/Tag');
const Journal = require('../models/Journal');

exports.createTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    const tag = await Tag.create({ user: req.user.id, name, color });
    res.status(201).json({ success: true, tag });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Tag name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.user.id }).sort('name');
    const tagsWithCount = await Promise.all(
      tags.map(async (tag) => {
        const count = await Journal.countDocuments({ user: req.user.id, tags: tag._id });
        return { ...tag.toObject(), journalCount: count };
      })
    );
    res.json({ success: true, tags: tagsWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const tag = await Tag.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }
    res.json({ success: true, tag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found' });
    }
    await Journal.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });
    res.json({ success: true, message: 'Tag deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
