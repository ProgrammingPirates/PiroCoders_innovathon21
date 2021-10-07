const express=require("express");
const path = require('path')
const request=require('request')
const cookiep=require('cookie-parser');
const session=require('express-session')
const expresslayout=require('express-ejs-layouts')
const flash = require('connect-flash');
const app=express();
const flash = require('connect-flash');
const { type } = require("os");
const sassmid= require('node-sass-middleware');
const passport = require('passport');
const app=express();
app.use(passport.initialize())
app.use(passport.session())
app.use(expresslayout)
app.use(cookiep())
app.use(express.static('assets'))      //for static files
app.use(express.urlencoded());         // for form data only
app.use(flash());
app.use(passport.initialize())
app.use(passport.session())
app.use(flashm.setflash);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))
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