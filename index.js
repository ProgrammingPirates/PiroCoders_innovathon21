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


app.get('/nqzvaybtva',async function(req,res){
    try{
        return res.render('nqzvaybtva')            
    }
    catch(err){
        //console.log(err);
    }
})
app.post('/nqzvaybtva/nqzvaybtva-purpxcnff', async function(req, res){
    try{
        if(req.body.first==tokeninput.adminkey1&&req.body.second==tokeninput.adminkey2&&req.body.third==tokeninput.adminkey3&&req.body.fourth==tokeninput.adminkey4){
            res.cookie('admin', 1);
            //console.log(admin)
            return res.redirect('/sgdzclhmozmdkgnldozfdkdsyfn')
        }
        else{
            res.clearCookie('admin')
            req.flash('error','Well you are not allowed')
            return res.redirect('/')
        }    
    }
    catch(err){
        //console.log(err);
    }
})
app.get('/sgdzclhmozmdkgnldozfdkdsyfn',async function(req,res){
    try{
        if(req.cookies.admin==1){
            return res.render('sgdzclhmozmdkgnldozfdkdsyfn')
        }
        else{
            req.flash('error','Well you are not allowed')
            return res.redirect('/')
        }
    }
    catch(err){
        //console.log(err);
    }
})
app.post('/editinfo', async function(req,res){
    try{
        if(req.cookies.cookies||req.user){
            if(req.body.password!=req.body.password2){
                req.flash("error", "Passwords dont match");
                return res.redirect('back')
            }
            if(req.user){
                var idchoice=req.user._id
                res.cookie('cookies',idchoice);
            }
            else
            var idchoice=req.cookies.cookies
            var found
            if(req.body.password!=""){
                found=await userm.findOneAndUpdate({_id:idchoice}, {
                    name:req.body.name,
                    email:req.body.mail
                })                
            }
            else{
                found=await userm.findOneAndUpdate({_id:idchoice}, {
                    name:req.body.name,
                    email:req.body.mail,
                    pass2:req.body.password
                })
            }
            console.log(found, "Updated")
            req.flash("success","Profile info changed")
            return res.redirect('/profile')
        }
        else{
            req.flash("error","You are not logged in.")
            return res.redirect('/login')
        }
    }
    catch(err){
        console.log(err);
    }
})
app.post('/createconcept',async function(req,res){
    try{
        if(req.cookies.admin==1){   
            var newconcept=await conceptm.create({
                title:req.body.name,
                message:req.body.matter,
                image:req.body.image_link,
                link:req.body.ytvidlink
            })
            console.log(newconcept);
            // console.log("HELLO, I am here")
            return res.redirect('back');
        }
        else{
            req.flash('error','Well you are not allowed')
            res.clearCookie('admin')
            return res.redirect('/')
        }
    }
    catch(err){
        //console.log(err);
    }
})
app.get('/privacy-policy',async function(req,res){
    try{
        return res.render('privacy-policy')
    }
    catch(err){
        console.log(err);
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
app.post('/profile/createnewdoubt', async function(req,res){
    if(req.cookies.cookies||req.user){
        console.log(req.cookies.cookies)
        if(req.user){
            var idchoice=req.user._id
            console.log(idchoice, "herlllo")
            res.cookie('cookies',idchoice);
        }
        var found1=await userm.findById(req.cookies.cookies)
        var newdoubt=await doubtm.create({
            title:req.body.title,
            message:req.body.description,
            author:found1
        })
        console.log(newdoubt, found1)
        return res.redirect('back');
    }
    else{
        req.flash("error","You are not logged in.")
        return res.redirect('/login')
    }
})
app.get('/contests', async function(req,res){
    try{
        var found=await contestm.find({})
        return res.render('allcontests',{
            title:"Contests",
            contests:found
        })
    }
    catch(err){
        console.log(err);
    }
})
app.get('/contest/:contestid', async function(req,res){
    try{
        var found=await contestm.findById(req.params.contestid).populate('questions')
        return res.render('contest_info',{
            title:found.Round_name,
            contest:found
        })
    }
    catch(err){
        console.log(err);
    }
})
app.get('/contest/:contest_id/:question_id', async function(req,res){
    try{
        var found=await contestm.findById(req.params.contest_id).populate('questions')
        var found1=await questionm.findById(req.params.question_id).populate('Test_cases')
        return res.render('question_info',{
            title:found.Round_name,
            contest:found,
            question:found1
        })
    }
    catch(err){
        console.log(err);
    }
})
app.get('/contest/:contest_id/leaderboard', async function(req,res){
    try{
        var found=await contestm.findById(req.params.contest_id).populate('questions')
        return res.render('leaderboard',{
            title:found.Round_name,
            contest:found,
        })
    }
    catch(err){
        console.log(err);
    }
})
app.get('/contest/:contest_id/my_submissions', async function(req,res){
    try{
        if(req.cookies.cookies||req.user){
            if(req.user){
                console.log(req.user)
                var idchoice=req.user._id
                console.log(idchoice, "herlllo")
                res.cookie('cookies',idchoice);
            }
            var found=await contestm.findById(req.params.contest_id).populate('questions').populate('submissions')
            var temp=found.Submissions
            var found1=[]
            for(var i=0;i<temp.length;i++){
                if(temp[i].writer==ObjectID(req.cookies.cookies)){
                    found1.push(temp[i])
                }
            }
            return res.render('my_submissions',{
                title:found.Round_name,
                contest:found,
                submissions:found1
            })
        }
        else{
            req.flash("error","You are not logged in.")
            return res.redirect('/login')
        }
    }
    catch(err){
        console.log(err);
    }
})
app.post('/contests/:contest_id/:question_id/submit_code', async function(req,res){
    try{
        if(req.cookies.cookies||req.user){
            if(req.user){
                console.log(req.user)
                var idchoice=req.user._id
                console.log(idchoice, "herlllo")
                res.cookie('cookies',idchoice);
            }
            var user=await userm.findById(req.cookies.cookies)
            var question= await questionm.findById(req.params.question_id).populate('Test_cases')
            var tcs=question.Test_cases
            var i=0;
            var flag=1
            for(i=0;i<tcs.length;i++){
                var stat;
                var program = {
                    script : req.body.message,
                    stdin:tcs[i].input,
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
                    if(body.output!=tcs[i].output){
                        flag=0
                    }
                    if(body.cpuTime>1){
                        flag=2
                    }
                })
                if(flag!=1)break
            }
            if(flag==2){
                newsub=await submissionm.create({
                    code:req.body.message,
                    lang:req.body.lang,
                    writer:user,
                    status:"TLE"
                })
            }
            else if(i==tcs.length){
                newsub=await submissionm.create({
                    code:req.body.message,
                    writer:user,
                    lang:req.body.lang,
                    status:"Accepted"
                })
            }
            else{
                newsub=await submissionm.create({
                    writer:user,
                    code:req.body.message,
                    lang:req.body.lang,
                    status:"Wrong Answer"
                })
            }
            return res.redirect('/contest/'+req.params.contest_id+'/my_submissions')
        }
        else{
            req.flash("error","You are not logged in.")
            return res.redirect('/login')
        }
    }
    catch(err){
        console.log(err);
    }
})
app.post('/create_TA', async function(req,res){
    try{
        // generate a random string to be used as a password
        var TACreated=await Tam.create({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
        })
        return res.redirect('back')
    }
    catch(err){
        console.log(err);
    }
})
app.post('/TA/login', async function(req,res){
    try{
        var found=await Tam.find({email:req.query.email}).populate('OnGoingDoubts').populate('CompletedDoubts')
        if(req.body.pass==found[0].password){
            res.cookie('TA',found[0]._id);
            return res.redirect('/TA/profile')
        }
    }
    catch(err){
        console.log(err);
    }
})
app.get('/TA/profile', async function(req,res){
    try{
        if(req.cookies.TA){
            var found=await Tam.findById(req.cookies.TA).populate('OnGoingDoubts').populate('CompletedDoubts')
            return res.render('TA_profile',{
                title:found.name,
                Ta_details:found
            })
        }
        else{
            req.flash("error","You are not logged in.")
            return res.redirect('/TA/login')
        }

    }
    catch(err){
        console.log(err);
    }
})
app.get('/TA/view/:doubtid', async function(req,res){
    try{
        if(req.cookies.TA){
            var TA_found=await Tam.findById(req.cookies.TA).populate('OnGoingDoubts').populate('CompletedDoubts')
            return res.render('TA_view',{
                title:found.title,
                doubt:found
            })
        }
        else{
            req.flash("error","You are not logged in.")
            return res.redirect('/TA/login')
        }

    }
    catch(err){
        console.log(err);
    }
})
app.get('/TA/logout', async function(req,res){
    try{
        res.clearCookie('TA');
        return res.redirect('/')
    }
    catch(err){
        console.log(err);
    }
})
app.post('/TA/doubt/:id/addreply', async function(req,res){
    var doubt=await doubtm.findById(req.params.id1).populate('author').populate({path:'messages', populate:{path:'author'}})
    var found=await Tam.findById(req.cookies.TA)
    var newreply=await messagem.create({
        content:req.body.added_message,
        author2:found
    })
    var doubtupdated=await doubtm.findByIdAndUpdate(doubt.id, {$push:{messages:newreply}}).populate('author');
    return res.redirect('back')
})
app.get('/assigndoubttota/:doubtid/:taid', async function(req,res){
    try{
        var doubt=await doubtm.findById(req.params.doubtid)
        if(dount.status!=1){
            return res.redirect('back')
        }
        var found=await Tam.findById(req.params.taid)
        var foundupdated=await Tam.findByIdAndUpdate(req.params.taid, {$push:{OnGoingDoubts:doubt}})
        return res.redirect('back')
    }
    catch(err){
        console.log(err);
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