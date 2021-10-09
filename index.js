const express=require("express");
const path = require('path')
const messagem=require('./models/message')
const tokeninput=require('./tokens/tokens')
const request=require('request')
const cookiep=require('cookie-parser');
const session=require('express-session')
const expresslayout=require('express-ejs-layouts')
const db=require('./config/mongoose')
const flashm = require('./config/middleware');
const MongoStore=require('connect-mongo')(session);
const submissionm=require('./models/submissions')
const conceptm=require('./models/concept')
const userm=require('./models/users')
const contestm=require('./models/contests')
const questionm=require('./models/questions')
const testcasem=require('./models/testcases')
const doubtm=require('./models/Doubts')
const contrim=require('./models/Contribution')
const app=express();
const loginmailer=require('./mailer/login')
const port=process.env.PORT || 3000;
const flash = require('connect-flash');
const { type } = require("os");
const passport = require('passport');
const googlestrat =require('./config/passport-google')
const facebookstrat=require('./config/passport-facebook')
const githubstrat =require('./config/passport-github');
const { user } = require("./config/mongoose");
app.use(passport.initialize())
app.use(passport.session())
app.use(expresslayout)
app.use(cookiep())
app.use(express.static('assets'))      //for static files
app.use(express.urlencoded());         // for form data only
app.use(session({
    name:'loginsessions',
    secret:'7237279abaca1981beee2bc5ca804aae',
    cookie: { maxAge: 3600*1000*1000 }, 
    resave: false, 
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db,
        autoRemove:'disabled'
    },function(err){
    })
}));   
app.use(flash());
app.use(passport.initialize())
app.use(passport.session())
app.use(flashm.setflash);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

app.get('/auth/facebook', passport.authenticate('facebook',{ scope: 'email' }));
app.get('/auth/facebook/callback',passport.authenticate('facebook', { failureRedirect: '/login' }),function(req, res) {    
    return res.redirect('/profile')
});

app.get('/login/oauth/google/', passport.authenticate('google',{scope:['profile','email'] }))
app.get('/login/outh/google/callback', passport.authenticate('google', {failureRedirect:'/login'}), function(req,res){
    return res.redirect('/profile')
})

app.get('/login/auth/github',passport.authenticate('github', { scope: ['user','email']}));
app.get('/login/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }),function(req, res) {
    return res.redirect('/profile')
});
app.get("/", async function(req,res){
    try{
        return res.render('home',{
            title:"Welcome to CodeKaksha"
        })
    }
    catch(err){
        console.log(err)
    }
})
app.listen(port, function(err){
    if(err){
        console.error("error on loading server" ,err)
    }
    else{
        console.log(`working on port: ${port}`);
    }
})