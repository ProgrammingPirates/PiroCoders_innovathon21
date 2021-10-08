const nodemailer = require('nodemailer')
const tokeninput=require('../tokens/tokens');
const ejs= require('ejs')
const path=require('path')

let transporter=nodemailer.createTransport({
    service: 'Gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user:tokeninput.emailid,
        pass:tokeninput.emailpass
    }
});
let renderTemplate=(data,relativePath)=>{
    let mailHTML;
    ejs.renderFile(
        path.join(__dirname, '../views/mailers',relativePath),
        data,
        function(err,template){
            if(err){
                console.log(err)
            }
            mailHTML=template;
        }
    )

    return mailHTML;
}
module.exports={
    transporter :transporter,
    renderTemplate: renderTemplate
}