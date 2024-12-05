const User=require('../../Models/userModel')
const nodeMailer=require('nodemailer')
const env=require('dotenv').config();
const bcrypt = require('bcrypt')



const loadHome = async (req,res) => {
    try {
        const user=req.session.user;
        if(user){
            const userData=await User.findOne({_id:user._id});
            res.render('users/homePage',{user:userData})
        }else{
            return res.render('users/homePage');
        }
    } catch (error) {
        console.error('An Error occured while loading home page:', error);
        res.status(500).send('An Error occured while loading home page',error.message)       

    }
}

const loadAuth = async (req, res) => {
    try {
        // Check if user is already logged in
        if (req.session.user) {
            return res.redirect('/');
        }
        // Render the auth page with both forms
        return res.render('users/authPage', { message: req.query.message || '' });
    } catch (error) {
        console.error('Error loading auth page:', error);
        res.redirect('/PageNotFound')
    }
};

function generateOtp() {
    return Math.floor(100000 + Math.random()*900000).toString()
}

async function sendVerificationEmail(email,otp) {
    try {
        
        const transporter = nodeMailer.createTransport({
            service:'gmail',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:process.env.NODEMAILER_EMAIL,
                pass:process.env.NODEMAILER_PASSWORD
            }
        })

        const info=await transporter.sendMail({
            from:process.env.NODEMAILER_EMAIL,
            to:email,
            subject:'Verify your account',
            text:`Your OTP is ${otp}`,
            html:`<b>Your OTP:${otp}</b>`,
        })
        console.log('111111',info);
        
        return info.accepted.length > 0;

    } catch (error) {
        
        console.log('Error sending email', error);
        return false;
        
    }
}

// Handle user signup
const signup = async (req, res) => {
    try {
        const { name, email, phone, password, cPassword } = req.body;

        if (password !== cPassword) {
            return res.render('users/authPage', { 
                message: 'Passwords do not match',
                activeForm: 'signup' 
            });
        }

        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.render('users/authPage', { 
                message: 'User with this email already exists',
                activeForm: 'signup'
            });
        }

        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email, otp);

        if (!emailSent) {
            return res.render('users/authPage', {
                message: 'Failed to send verification email',
                activeForm: 'signup'
            });
        }
        console.log('otp is ', otp);
        

        // Store user data and OTP in session
        req.session.userOtp = otp;
        req.session.userData = { name, email, phone, password };

        res.render('users/verifyOtp');
    } catch (error) {
        console.error('Signup error:', error);
        res.redirect('/PageNotFound');
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const findUser = await User.findOne({ email:email,isAdmin:0});

        if (!findUser) {
            return res.render('users/authPage', { 
                message: 'User not found',
                activeForm: 'signin'
            });
        }

        if (findUser.isBlocked) {
            return res.render('users/authPage', {
                message: 'Account has been blocked',
                activeForm: 'signin'
            });
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);
        if (!passwordMatch) {
            return res.render('users/authPage', {
                message: 'Invalid password',
                activeForm: 'signin'
            });
        }

        req.session.user = findUser._id;
        res.redirect('/');
    } catch (error) {
        console.error('Signin error:', error);
        res.render('users/authPage', {
            message: 'Login failed, please try again',
            activeForm: 'signin'
        });
    }
};

const securePassword = async (password) => {
    
    try {
        
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash;

    } catch (error) {
        
        console.log('error while Securing password', error);
        
    }

}

const verifyOtp = async (req, res) => {

    try {
        const {otp} = req.body;
        console.log('this is the otp', otp);
        
        if(otp === req.session.userOtp){
            const user = req.session.userData;
            const passwordHash = await securePassword(user.password);
            const saveUserData = new User({
                name: user.name,
                email: user.email,
                phone: user.phone,
                password: passwordHash
            });
            await saveUserData.save();
            
            // Clear the session data
            req.session.userOtp = null;
            req.session.userData = null;
            
            // Send success response with redirection
            res.json({
                success: true,
                message: 'Registration successful! Please sign in.',
                redirect: '/auth'
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid OTP, please try again'
            });
        }
    } catch (error) {
        
        console.log('error verifying otp', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred'
        });
    }
}

const resendOtp = async(req,res)=>{
    try {
        
        const email = req.session.userData?.email;
        if(!email){
            return res.status(400).json({success:false,message:'The previous session has expired, Try again'})
        }
        const otp = generateOtp();
        const emailSent = await sendVerificationEmail(email,otp);

        if(!emailSent){
            return res.status(500).json({success:false,message:'Failed to send OTP, Please try again later.'})
        }

        req.session.userOtp = otp;
        req.session.otpExpiry = Date.now() + 60*1000;

        console.log(`New OTP has been sent to ${email}: ${otp}`);
        res.status(200).json({success:true,message:'OTP sent successfully.'})

    } catch (error) {
        

        console.log('Error in resending otp ',error);
        res.status(500).json({success:false,message:'Internal Server error,try again'})        

    }
}

const PageNotFound = async (req, res) => {
    try {
        res.render('404-error');
    } catch (error) {
        console.error('PageNotFound error:', error);
        res.redirect('/PageNotFound')
    }
};



module.exports = {
    loadAuth,
    loadHome,
    signup,
    verifyOtp,
    resendOtp,
    signin,
    PageNotFound
}

