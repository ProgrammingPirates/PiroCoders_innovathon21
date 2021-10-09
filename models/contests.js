const mongoose = require('mongoose');
const Contests = new mongoose.Schema({
    Round_name:{
        type:String,
        required:true
    },
    Submissions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'submission'
    }],
    Contestants:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    questions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Questions'
    }],
},{
    timestamps:true
})
const contests=mongoose.model('Contests',Contests)
module.exports=contests;