const loginmailer=require('../mailer/login')
const passport=require('passport')
const FacebookStrategy=require('passport-facebook').Strategy;
const crypto=require('crypto')
const tokeninput=require('../tokens/tokens');
const userm=require('../models/users');
const { response } = require('express');
passport.use(new FacebookStrategy({
    clientID: tokeninput.passfaceclientID,
    clientSecret: tokeninput.passfaceclientSecret,
    callbackURL: "https://codekaksha.herokuapp.com/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name'] 
  },function(accessToken, refreshToken, profile, done) {
    userm.findOne({email:profile.emails[0].value}).exec(function(err,found){   
      if(err){
          console.log(err)
          return;
      }
      if(found){
        loginmailer.login(found)
          return done(null,found)
      }
      else{
          var namefull=profile.name.givenName.concat(profile.name.familyName)
          userm.create({
              name:namefull,
              email:profile.emails[0].value,
              pass2:crypto.randomBytes(20).toString('hex'),
              langcount:{
                0:0,
                1:0,
                2:0,
                3:0,
                4:0,
                5:0,
                6:0,
                7:0
              }
          },function(err,found){
              if(err){
                  console.log(err)
                  return;
              }
              return done(null,found);
          })
      }
  })
  }
));
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    userm.findById(id, function(err, user) {
      return done(err, user);
    });
  });
module.exports=passport
