const tokeninput=require('../tokens/tokens');
const loginmailer=require('../mailer/login')
const passport=require('passport')
const google=require('passport-google-oauth').OAuth2Strategy;
const crypto=require('crypto')
const userm=require('../models/users')
passport.use(new google({
    clientID:tokeninput.passgooclientID,
    clientSecret:tokeninput.passgoogclientSecret,
    callbackURL:"http://codekaksha.herokuapp.com/login/outh/google/callback"
},function(access, refresh, profile, done){
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
            userm.create({
                name:profile.displayName,
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
))
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    userm.findById(id, function(err, user) {
      return done(err, user);
    });
  });
module.exports=passport