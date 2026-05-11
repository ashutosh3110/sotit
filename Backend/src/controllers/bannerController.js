const Banner = require('../models/Banner');
const { cloudinary } = require('../config/cloudinary');

exports.addBanner = async (req, res) => {
    try {
        const { type, role, title } = req.body;
        if (!req.file) return res.status(400).json({ message: 'Banner image is required' });

        const banner = await Banner.create({
            imageUrl: req.file.path,
            publicId: req.file.filename,
            type,
            role: type === 'service' ? role : 'none',
            title
        });

        res.status(201).json({ message: 'Banner added successfully', banner });
    } catch (error) {
        res.status(500).json({ message: 'Error adding banner', error: error.message });
    }
};

exports.getBanners = async (req, res) => {
    try {
        const { type, role } = req.query;
        let query = { isActive: true };
        if (type) query.type = type;
        if (role) query.role = role;

        const banners = await Banner.find(query).sort({ createdAt: -1 });
        res.status(200).json(banners);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching banners' });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(banner.publicId);
        await banner.deleteOne();

        res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting banner' });
    }
};
