const mongoose = require('mongoose');
const conceptSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    message:{
        type: String,
        required: true
    },
    image:{
        type:String,
        required:true
    },
    link:{
        type:String,
        required:true
    }
},{
    timestamps:true
})

const concept=mongoose.model('concept',conceptSchema)
module.exports=concept;