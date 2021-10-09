const nodeMailer=require('../config/nodemailer');

exports.login=(user)=>{
    console.log(user)
    let Htmlstring= nodeMailer.renderTemplate({
        user:user,
        date:Date()
    }, '/loginmail.ejs');
    nodeMailer.transporter.sendMail({
        from:'sapra.taj@gmail.com',
        to:user.email,
        subject:"Log in alert",
        html:Htmlstring
    },function(err,info){
        if(err){
            console.log(err)
        }
        console.log(info)
    });
}