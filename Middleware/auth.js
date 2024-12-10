const User = require('../Models/userModel');

const isLogAuth = async (req, res, next) => {
    try {
        if (req.session.user) {
            const user = await User.findById(req.session.user);
            if (!user || user.isBlocked) {
                // If user is blocked or doesn't exist, destroy session
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                    }
                });
                return res.redirect('/auth');
            }
            return res.redirect('/');
        }
        next();
    } catch (error) {
        console.error('Error in isLogAuth Middleware:', error);
        res.status(500).send('Internal server error');
    }
};

const checkBlockedStatus = async (req, res, next) => {
    try {
        if (req.session.user) {
            const user = await User.findById(req.session.user);
            if (user && user.isBlocked) {
                // If user is blocked, destroy their session
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                    }
                });
                return res.redirect('/auth?message=Your account has been blocked. Please contact support.');
            }
        }
        next();
    } catch (error) {
        console.error('Error in checkBlockedStatus middleware:', error);
        next();
    }
};

const checkUserStatus = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next();
        }
        
        const user = await User.findOne({ email });
        if (user && user.isBlocked) {
            return res.render('users/authPage', {
                message: 'Your account has been blocked. Please contact support for assistance.',
                activeForm: 'signin'
            });
        }
        next();
    } catch (error) {
        console.error('Error in checkUserStatus middleware:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = {
    isLogAuth,
    checkBlockedStatus,
    checkUserStatus
};
