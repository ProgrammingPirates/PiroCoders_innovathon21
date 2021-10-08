const mongoose = require('mongoose');
const ContributionSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    message:{
        type: String,
        required: true
    },
    typeofcontri:{
        type:Number,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
},{
    timestamps:true
})

const Contribution=mongoose.model('Contribution',ContributionSchema)
module.exports=Contribution;