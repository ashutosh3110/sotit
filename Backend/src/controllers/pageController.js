const Page = require('../models/Page');

// @desc    Get all pages (Public)
// @route   GET /api/pages
// @access  Public
exports.getPages = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.target) {
            filter.target = req.query.target;
        }
        const pages = await Page.find(filter).select('title slug target').sort({ createdAt: 1 });
        res.status(200).json({ success: true, pages });
    } catch (err) {
        next(err);
    }
};

// @desc    Get specific page by slug (Public)
// @route   GET /api/pages/:slug
// @access  Public
exports.getPageBySlug = async (req, res, next) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug });
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        res.status(200).json({ success: true, page });
    } catch (err) {
        next(err);
    }
};

// @desc    Upsert (Create/Update) page (Admin only)
// @route   PUT /api/pages/:slug
// @access  Private (Admin)
exports.upsertPage = async (req, res, next) => {
    try {
        const { title, content, target } = req.body;
        const slug = req.params.slug;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required' });
        }

        const updateData = { title, content };
        if (target) {
            updateData.target = target;
        }

        const page = await Page.findOneAndUpdate(
            { slug },
            updateData,
            { upsert: true, new: true, runValidators: true }
        );

        res.status(200).json({ success: true, message: 'Page saved successfully', page });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete page (Admin only)
// @route   DELETE /api/pages/:slug
// @access  Private (Admin)
exports.deletePage = async (req, res, next) => {
    try {
        const result = await Page.deleteOne({ slug: req.params.slug });
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        res.status(200).json({ success: true, message: 'Page deleted successfully' });
    } catch (err) {
        next(err);
    }
};
