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
const test_cases=mongoose.model('Test_cases',Test_cases)
module.exports=test_cases;