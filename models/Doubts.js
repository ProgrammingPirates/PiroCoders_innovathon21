const mongoose = require('mongoose');
const DoubtSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    messages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Message'
    }],
    status:{
        type:Number,
        required:true,
        default:1
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    TA:{ 
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{
    timestamps:true
})

const Doubt=mongoose.model('Doubt',DoubtSchema)
module.exports=Doubt;