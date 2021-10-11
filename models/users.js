const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    pass2:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    institute:{
        type:String
    },
    langcount:{
        type:Array,
        default: [0,0,0,0,0,0,0,0]
    },
    submissions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Submission'
    }],
    contribution:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Contribution'
    }],
    Doubts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doubt'
    }]
},{
    timestamps:true
})

const User=mongoose.model('User',UserSchema)
module.exports=User;