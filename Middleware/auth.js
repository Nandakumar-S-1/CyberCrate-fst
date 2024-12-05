const isLogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            next();
        } else {
            res.redirect('/auth');
        }
    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.redirect('/auth');
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user) {
            res.redirect('/');
        } else {
            next();
        }
    } catch (error) {
        console.error('Logout middleware error:', error);
        next();
    }
};

module.exports = {
    isLogin,
    isLogout
};
