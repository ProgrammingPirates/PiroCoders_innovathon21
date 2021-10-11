const mongoose = require('mongoose');
const messageschema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    author2:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Ta'
    }
},{
    timestamps:true
})

const message=mongoose.model('Message',messageschema)
module.exports=message;