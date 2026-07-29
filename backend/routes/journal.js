const express = require('express');
const router = express.Router();
const {
  createJournal, getJournals, getJournal, updateJournal, deleteJournal,
  togglePin, toggleBookmark, getCalendarJournals, autoSave, exportJournal
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createJournal);
router.get('/', getJournals);
router.get('/calendar', getCalendarJournals);
router.post('/auto-save/:id?', autoSave);
router.get('/:id', getJournal);
router.put('/:id', updateJournal);
router.delete('/:id', deleteJournal);
router.put('/:id/pin', togglePin);
router.put('/:id/bookmark', toggleBookmark);
router.get('/:id/export', exportJournal);

module.exports = router;
