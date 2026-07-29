const Category = require('../models/Category');
const Journal = require('../models/Journal');

exports.createCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    const category = await Category.create({ user: req.user.id, name, color, icon });
    res.status(201).json({ success: true, category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category name already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort('name');
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Journal.countDocuments({ user: req.user.id, category: cat._id });
        return { ...cat.toObject(), journalCount: count };
      })
    );
    res.json({ success: true, categories: categoriesWithCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    await Journal.updateMany({ category: category._id }, { category: null });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
