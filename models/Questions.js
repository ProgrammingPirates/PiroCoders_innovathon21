const mongoose = require('mongoose');
const Questions = new mongoose.Schema({
    Name:{
        type:String,
        required:true
    },
    Problem_Statement:{
        type:String,
        required:true
    },
    points:{
        type:Number,
        required:true
    },
    Submissions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Submission'
    }],
    Test_cases:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Test_Case'
    }]
},{
    timestamps:true
})
const questions=mongoose.model('Questions',Questions)
module.exports=questions;