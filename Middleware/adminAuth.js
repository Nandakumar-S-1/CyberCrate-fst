const User = require('../Models/userModel');

const isAdminAuthenticated = async (req, res, next) => {
    try {
        // First check if admin session exists
        if (!req.session.admin) {
            return res.redirect('/admin/login');
        }

        // Then verify the admin still exists in database
        const admin = await User.findOne({ 
            _id: req.session.admin.id,
            isAdmin: true 
        });

        if (!admin) {
            // If admin no longer exists or is no longer admin, clear session and redirect
            req.session.destroy();
            return res.redirect('/admin/login');
        }

        // Admin is authenticated, proceed
        next();
    } catch (error) {
        console.log('Error in adminAuth middleware:', error);
        res.redirect('/admin/login');
    }
};

module.exports = {
    isAdminAuthenticated
};