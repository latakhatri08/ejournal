const Journal = require('../models/Journal');
const MoodLog = require('../models/MoodLog');
const Category = require('../models/Category');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const totalJournals = await Journal.countDocuments({ user: userId, isDraft: false });
    const totalDrafts = await Journal.countDocuments({ user: userId, isDraft: true });
    const totalBookmarks = await Journal.countDocuments({ user: userId, isBookmarked: true });
    const totalWords = await Journal.aggregate([
      { $match: { user: userId, isDraft: false } },
      { $group: { _id: null, total: { $sum: '$wordCount' } } }
    ]);
    const recentJournals = await Journal.find({ user: userId }).populate('category', 'name color').sort('-createdAt').limit(5);
    const moodDistribution = await Journal.aggregate([
      { $match: { user: userId, isDraft: false, mood: { $exists: true, $ne: '' } } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const categoryDistribution = await Journal.aggregate([
      { $match: { user: userId, isDraft: false, category: { $exists: true, $ne: null } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const thisMonth = await Journal.aggregate([
      {
        $match: {
          user: userId,
          isDraft: false,
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }
      },
      { $group: { _id: { $dayOfMonth: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const streak = await calculateStreak(userId);
    res.json({
      success: true,
      dashboard: {
        totalJournals, totalDrafts, totalBookmarks,
        totalWords: totalWords[0]?.total || 0,
        recentJournals, moodDistribution, categoryDistribution,
        monthlyActivity: thisMonth, streak
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMoodTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const moodTrend = await MoodLog.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).sort('date');
    const moodValues = { great: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
    const dailyMood = {};
    moodTrend.forEach(log => {
      const date = log.date.toISOString().split('T')[0];
      if (!dailyMood[date]) dailyMood[date] = [];
      dailyMood[date].push(moodValues[log.mood] || 3);
    });
    const trend = Object.entries(dailyMood).map(([date, values]) => ({
      date, average: values.reduce((a, b) => a + b, 0) / values.length
    }));
    res.json({ success: true, trend });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function calculateStreak(userId) {
  const journals = await Journal.find({ user: userId, isDraft: false })
    .select('createdAt')
    .sort('-createdAt')
    .limit(365);
  if (journals.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dates = [...new Set(journals.map(j => new Date(j.createdAt).toDateString()))];
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    if (dates.includes(checkDate.toDateString())) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}
