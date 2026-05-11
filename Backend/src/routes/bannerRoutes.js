const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { addBanner, getBanners, deleteBanner } = require('../controllers/bannerController');

const upload = multer({ storage });

router.post('/', upload.single('banner'), addBanner);
router.get('/', getBanners);
router.delete('/:id', deleteBanner);

module.exports = router;
