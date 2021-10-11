const mongoose = require('mongoose');
const Contests = new mongoose.Schema({
    Round_name:{
        type:String,
        required:true
    },
    Submissions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Submission'
    }],
    Contestants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    questions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Questions'
    }],
    start_time:{
        type:String,
        required:true
    },
    end_time:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        required:true
    }
},{
    timestamps:true
})
const contests=mongoose.model('Contests',Contests)
module.exports=contests;