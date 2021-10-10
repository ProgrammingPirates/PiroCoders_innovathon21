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
app.get("/accountsetup", async function(req,res){
    try{
        if(req.cookies.cookies||req.user){
            return res.redirect('/profile')
        }
        return res.render('accset_page',{
            title:"Account setup-CodeKaksha"
        })
    }
    catch(err){
        console.log(err)
    }
})
app.get('/login',async function(req,res){
    try{
        if(!(req.cookies.cookies||req.user)){
            res.clearCookie('cookie')
            res.clearCookie('cookie2')
            return res.render('login',{
                title:"Login page"
            })
        }
        else{
            req.flash("success","you are already loggedin")
            return res.redirect("/profile")
        }
    }
    catch(err){
        console.log(err)
    }
})
app.get('/signup',async function(req,res){
    try{
        if(!(req.cookies.cookies||req.user)){
            return res.render('signup',{
                title:"Signup page"
            })
        }
        else{
            req.flash("success","you are already loggedin")
            return res.redirect("/profile")
        }
    }
    catch(err){
        console.log(err)
    }
})
app.get('/loginwithus',async function(req,res){
    try{
        if(!(req.cookies.cookies||req.user)){
            res.clearCookie('cookie')
            res.clearCookie('cookie2')
            return res.render('login1',{
                title:"Login page"
            })
        }
        else{
            req.flash("success","you are already loggedin")
            return res.redirect("/profile")
        }
    }
    catch(err){
        //console.log(err)
    }
})
app.get('/signup',async function(req,res){
    try{
        if(!(req.cookies.cookies||req.user)){
            return res.render('signup',{
                title:"Signup page"
            })
        }
        else{
            req.flash("success","you are already loggedin")
            return res.redirect("/profile")
        }
    }
    catch(err){
        //console.log(err)
    }
})
app.post('/checkuser', async function(req,res){
    try{
        var founduser=await userm.findOne({email:req.body.email})
        if(founduser){
            if(req.body.password==founduser.pass2){
                req.flash('success', 'Logged In Successfully')
                res.cookie('cookies',founduser.id);
                loginmailer.login(founduser)
                return res.redirect('/profile')
            }
            else{
                req.flash('error', 'Either entered username or password is wrong')
                //console.log("wrong1")
                return res.redirect('back')
            }
        }
        else{
            req.flash('error', 'No user found with the given email')
            return res.redirect('back')
        }
    }
    catch(err){
        //console.log(err)
    }
})
app.post('/createuser', async function(req,res){
    try{
        console.log(req.body)
        if(req.body.pass1!=req.body.pass2){
            req.flash("error","The Passwords do not match")
            return res.redirect('back')
        }
        founduser=await userm.findOne({email:req.body.email})
        if(!founduser){
            newuser=await userm.create({
                email:req.body.email,
                name:req.body.name,
                pass2:req.body.pass2
            });
            req.flash("success","New Account Created")
            return res.redirect('/login')
        }
        else{
            //console.log("Already exists")
            req.flash("error","User Already Exists")
            return res.redirect('/login')    
        }
    }
    catch(err){
        //console.log(err)
    }
})
app.get('/logout', async function(req,res){
    if(req.cookies.cookies||req.user){
        res.clearCookie('cookies');
        //console.log(req.session)
        req.flash("success","Logged Out Successfully")
        req.session.destroy()
        //console.log(req.session)
    }
    else{
        req.flash("error","You are not logged out.")
    }
    return res.redirect('/login')
})
app.get("/ide", async function(req,res){
    try{
        if(req.cookies.sid!="undefined"){
            var subid=req.cookies.sid
            res.clearCookie("sid")
            return res.render('practiceide',{
                title:"Codekaksha Ide", 
                subid:subid
            })
        }
        else
        return res.render('practiceide',{
            title:"Codekaksha Ide"
        })
    }
    catch(err){
        console.log(err)
    }
})
app.post("/ide/submit", function(req,res){
    var stat;
    console.log(req.body)
    var program = {
        script : req.body.message,
        stdin:req.body.input,
        language: req.body.lang,
        versionIndex: "1",
        clientId: tokeninput.ideapiid,
        clientSecret:tokeninput.ideapikey
    };
    request({
        url: 'https://api.jdoodle.com/v1/execute',
        method: "POST",
        json: program
    },
    async function (error, response, body) {
        var newsub;
        console.log(body)
        if(req.cookies.cookies==undefined){        
            newsub=await submissionm.create({
                input:req.body.input,
                result:body.output,
                code:req.body.message,
                lang:req.body.lang
            })
        }
        else{
            var idd=req.cookies.cookies
            var found1=await userm.findById(idd);
            var newsub=await submissionm.create({
                input:req.body.input,
                result:body.output,
                code:req.body.message,
                lang:req.body.lang,
                writer:found1
            })
            found1.submissions.push(newsub)
            if(req.body.lang=="python3"){
                found1.langcount[0][0]++;
            }
            if(req.body.lang=="python2"){
                found1.langcount[0][1]++;
            }
            if(req.body.lang=="cpp14"){
                found1.langcount[0][2]++;
            }
            if(req.body.lang=="java"){
                found1.langcount[0][3]++;
            }
            if(req.body.lang=="C"){
                found1.langcount[0][4]++;
            }
            if(req.body.lang=="kotlin"){
                found1.langcount[0][5]++;
            }
            if(req.body.lang=="nodejs"){
                found1.langcount[0][6]++;
            }
            if(req.body.lang=="swift"){
                found1.langcount[0][7]++;
            }
            var found2= await userm.findByIdAndUpdate(found1.id,{langcount:found1.langcount,submissions:found1.submissions})                   
            // console.log(found2);
        }
        stat=newsub.id
        // console.log(newsub)
        await res.cookie('sid',stat)
        return res.redirect('/ide')
    });
})
app.get('/ide/submission/:id1/getdata',async function(req,res){
    try {
        var found= await submissionm.findById(req.params.id1)
        return res.status(200).json(found)        
    } catch (error) {
        console.log(error);
    }    
})


app.get("/profile", async function(req,res){
    try{
        if(req.cookies.cookies||req.user){
            if(req.user){
                console.log(req.user)
                var idchoice=req.user._id
                console.log(idchoice, "herlllo")
                res.cookie('cookies',idchoice);
            }
            else
            var idchoice=req.cookies.cookies
            if(idchoice){
                var found=await userm.findOne({_id:idchoice}).populate('submissions')
                console.log(found.langcount[0])
            }
            return res.render('profile',{
                title:"Welcome to CodeKaksha",
                user:found,
                subs:found.langcount
            })
        }
        else{
            req.flash("error","Log In first")
            return res.redirect('/login');
        }
    }
    catch(err){
        console.log(err)
    }
})
app.get('/viewsubmission/:id',async function(req,res){
    if(req.cookies.cookies||req.user){
        var found1=await userm.findById(req.cookies.cookies)
        var found2=await submissionm.findOne({_id:req.params.id})
        return res.render('view', {
            title:"View Submission",
            user:found1,
            sub:found2
        })
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
    }
})
app.get('/profile/viewdoubt/:id1',async function(req,res){
    if(req.cookies.cookies||req.user){
        var doubt=await doubtm.findById(req.params.id1).populate('author').populate({path:'messages', populate:{path:'author'}});
        var found=await userm.findById(doubt.author.id). populate('messages');
        return res.render('viewdoubt',{
            title:"View Doubt",
            user:found,
            doubt:doubt
        })
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
    }
    
})
app.post('/profile/doubt/:id1/addreply/', async function(req,res){
    if(req.cookies.cookies||req.user){
        var doubt=await doubtm.findById(req.params.id1).populate('author').populate({path:'messages', populate:{path:'author'}})
        var found=await userm.findById(req.cookies.cookies);
        var newreply=await messagem.create({
            content:req.body.added_message,
            author:found
        })
        var doubtupdated=await doubtm.findByIdAndUpdate(doubt.id, {$push:{messages:newreply}}).populate('author');
        return res.redirect('back')
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
    }

})
app.get('/Create-contribution',async function(req, res){
    if(req.cookies.cookies||req.user){
        if(req.user){
            var idchoice=req.user._id
            res.cookie('cookies',idchoice);
        }
        else
        var idchoice=req.cookies.cookies
        var found=await userm.findOne({_id:idchoice}).populate('Contribution')
        return res.render('Contributions',{
            title:"Create-contribution page",
            user:found
        })
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
    }
})
app.post('/addnewcontributions', async function(req,res){
    if(req.cookies.cookies||req.user){
        if(req.user){
            var idchoice=req.user._id
            res.cookie('cookies',idchoice);
        }
        else
        var idchoice=req.cookies.cookies
        var found1=await userm.findById(req.cookies.cookies)
        console.log(found1);
        var newcontri=await contrim.create({
            title:req.body.title,
            message:req.body.message,
            author:found1,
            typeofcontri:req.body.type
        })
        console.log(newcontri);
        return res.redirect('back');
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
    }
})
app.get('/profile/Doubts',async function(req, res){
    if(req.cookies.cookies||req.user){
        if(req.user){
            console.log(req.user)
            var idchoice=req.user._id
            console.log(idchoice, "herlllo")
            res.cookie('cookies',idchoice);
        }
        else
        var idchoice=req.cookies.cookies
        var found=await userm.findOne({_id:idchoice}).populate('submissions')
        var temp=await doubtm.find({}).populate('author')
        var found2=[];
        for(let i of temp){
            console.log(i.author.id)
            if(i.author.id==idchoice){
                found2.push(i)
            }
        }
        console.log(found2)
        return res.render('Doubts',{
            title:"Doubts page",
            user:found,
            list:found2
        })
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
    }
})
app.get('/learn',async function(req, res){
    return res.render('learn',{
        title:"Learn a new concept"
    })
})
app.get('/learn/:id1',async function(req, res){
    var temp=req.params.id1
    temp=temp.charAt(0).toUpperCase()+temp.slice(1);
    var found=await conceptm.findOne({title:temp})
    console.log(found, "hello")
    if(found==null){
        req.flash('error','No such topic found')
            return res.redirect('/learn')
    }
    return res.render('learntopic',{
        title:req.params.id1,
        concept:found
    })
})
app.get('/profile/Interests',async function(req, res){
    if(req.cookies.cookies||req.user){
        if(req.user){
        console.log(req.user)
        var idchoice=req.user._id
        console.log(idchoice, "herlllo")
        res.cookie('cookies',idchoice);
    }
    else
    var idchoice=req.cookies.cookies
        var found=await userm.findOne({_id:idchoice}).populate('submissions')
        return res.render('Interests',{
            title:"Interests page",
            user:found
        })
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
    }
})
app.get('/profile/Contributions',async function(req, res){
    if(req.cookies.cookies||req.user){
        if(req.user){
            console.log(req.user)
            var idchoice=req.user._id
            console.log(idchoice, "herlllo")
            res.cookie('cookies',idchoice);
        }
        else
        var idchoice=req.cookies.cookies
        var found2=await contrim.find({}).sort({'timestamp': -1}).populate('author')
        console.log(found2)
        var found=await userm.findOne({_id:idchoice}).populate('submissions')
        return res.render('Viewcontri',{
            title:"Contributions page",
            user:found,
            contrilist:found2
        })
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
    }
})
app.get('/profile/Edit-info',async function(req, res){
    if(req.cookies.cookies||req.user){
        if(req.user){
            console.log(req.user)
            var idchoice=req.user._id
            console.log(idchoice, "herlllo")
            res.cookie('cookies',idchoice);
        }
        else
        var idchoice=req.cookies.cookies
        var found=await userm.findOne({_id:idchoice}).populate('submissions')
        return res.render('Edit-info',{
            title:"Edit-info page",
            user:found
        })
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
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