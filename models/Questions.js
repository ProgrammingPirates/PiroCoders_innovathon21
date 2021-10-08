const mongoose = require('mongoose');
const Questions = new mongoose.Schema({
    Problem_Statement:{
        type:String,
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
const Questions=mongoose.model('Questions',Questions)
module.exports=Questions;