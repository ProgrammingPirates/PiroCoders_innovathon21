const mongoose = require('mongoose');
const submission = new mongoose.Schema({
    code:{
        type:String,
        required:true
    },
    input:{
        type:String
    },
    lang:{
        type:String,
        required:true
    },
    writer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    result:{
        type:String,
    },
    status:{
        type:String,
    },
    quetion:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Questions'
    }
},{
    timestamps:true
})
const Submission=mongoose.model('Submission',submission)
module.exports=Submission;