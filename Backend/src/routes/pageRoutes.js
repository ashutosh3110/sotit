const express = require('express');
const { getPages, getPageBySlug, upsertPage, deletePage } = require('../controllers/pageController');
const { adminProtect } = require('../middlewares/adminAuthMiddleware');

const router = express.Router();

router.get('/', getPages);
router.get('/:slug', getPageBySlug);
router.put('/:slug', adminProtect, upsertPage);
router.delete('/:slug', adminProtect, deletePage);

module.exports = router;
