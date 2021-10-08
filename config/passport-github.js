const passport=require('passport')
const port=process.env.PORT||3000;
const tokeninput=require('../tokens/tokens');
const GitHubStrategy=require('passport-github2').Strategy;
const crypto=require('crypto')
const loginmailer=require('../mailer/login')
const userm=require('../models/users')
passport.use(new GitHubStrategy({
    clientID: tokeninput.passgitclientID,
    clientSecret: tokeninput.passgitclientSecret,
    callbackURL: "https://codekaksha.herokuapp.com/login/auth/github/callback"
},function(accessToken, refreshToken, profile, done) {
    console.log(profile);
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