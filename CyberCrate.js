const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');

const db = require('./Config/db');
const adminRoutes = require('./Routes/adminRoutes');
const userRoutes = require('./Routes/userRoutes');
const passport=require('./Config/passport')

dotenv.config();
const app = express();

const port = process.env.PORT || 5005
db()


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Views'));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))
app.use(express.static(path.join(__dirname, 'public')));
app.use((req,res,next)=>{
    res.set('cache-control','no-store');
    next()
})



app.use(passport.initialize());
app.use(passport.session());

        // Routes
app.use('/', userRoutes);
app.use('/admin', adminRoutes);

app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
});


module.exports = app;
