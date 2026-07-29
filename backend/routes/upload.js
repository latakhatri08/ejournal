const express = require('express');
const router = express.Router();
const { uploadFile, getAttachments, deleteAttachment } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.post('/', upload.single('file'), uploadFile);
router.get('/', getAttachments);
router.delete('/:id', deleteAttachment);

module.exports = router;
