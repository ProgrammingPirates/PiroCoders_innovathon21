const mongoose = require('mongoose');
const TaSchema = new mongoose.Schema({
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
    OnGoingDoubts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doubt'
    }],
    CompletedDoubts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Doubt'
    }]
},{
    timestamps:true
})

const Ta=mongoose.model('Ta',TaSchema)
module.exports=Ta;