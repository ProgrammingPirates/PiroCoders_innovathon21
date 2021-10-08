const mongoose = require('mongoose');
const messageschema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{
    timestamps:true
})

const message=mongoose.model('Message',messageschema)
module.exports=message;