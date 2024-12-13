const express = require('express');
const router = express.Router();
const userController = require('../Controllers/users/userController');
const profileController = require('../Controllers/users/profileController')
const userProductController = require('../Controllers/users/userProductController')
const passport = require('passport');
const {isLogAuth, checkBlockedStatus, checkUserStatus} = require('../Middleware/auth');


router.use(checkBlockedStatus);
router.get('/', userController.loadHome);

// Authentication routes
router.get('/auth', isLogAuth, userController.loadAuth);  
router.post('/signup', isLogAuth, userController.signup);  
router.post('/signin', checkUserStatus, userController.signin);  
router.get('/logout', userController.logout);

// OTP  routes
router.get('/check-session', (req, res) => {
    if (!req.session.userOtp || !req.session.userData || !req.session.otpExpiry) {
        return res.status(401).json({ message: 'Session expired' });
    }
    if (Date.now() > req.session.otpExpiry) {
        return res.status(401).json({ message: 'Session expired' });
    }
    res.status(200).json({ message: 'Session valid' });
});

router.post('/verify-otp', userController.verifyOtp);
router.post('/resend-otp', userController.resendOtp);

router.get('/forgotPassword',profileController.forgotPassword)


router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/auth' }),
    (req, res) => {
        // Set user session after successfull authenticate
        req.session.user = req.user;
        res.redirect('/');
    }
);

// product routes
// router.get('/productDetails/:productId', userProductController.productDetails);
router.get('/productDetails/:id', userProductController.productDetails);



// Profile route
router.get('/profile', isLogAuth, userController.loadProfile);
router.get('/PageNotFound', userController.PageNotFound);



module.exports = router;