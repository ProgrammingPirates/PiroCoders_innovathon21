const mongoose = require('mongoose');
const Test_cases = new mongoose.Schema({
    Input:{
        type:String,
        required:true
    },
    Output:{
        type:String,
        required:true
    }
},{
    timestamps:true
})
const Test_cases=mongoose.model('Test_cases',Test_cases)
module.exports=Test_cases;