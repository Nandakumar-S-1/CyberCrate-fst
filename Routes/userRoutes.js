const express = require('express');
const router = express.Router();
const userController = require('../Controllers/users/userController');
const passport = require('passport');
const { isLogin, isLogout } = require('../Middleware/auth');

// Protected route - requires authentication
router.get('/', isLogin, userController.loadHome);

// Authentication routes - only accessible when logged out
router.get('/auth', isLogout, userController.loadAuth);  // This will load the page with both forms
router.post('/signup', isLogout, userController.signup);  // Handle signup form submission
router.post('/signin', isLogout, userController.signin);  // Handle signin form submission

// OTP verification routes
router.post('/verify-otp', userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth' }),
    (req, res) => {
        // Set up user session after successful authentication
        req.session.user = req.user;
        res.redirect('/');
    }
);

router.get('/PageNotFound', userController.PageNotFound);

module.exports = router;