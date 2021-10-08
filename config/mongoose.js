const mongoose=require("mongoose")
const tokens=require("../tokens/tokens")
mongoose.connect(tokens.mongouri,{ useNewUrlParser: true });
const db=mongoose.connection;
db.on('error', console.error.bind(console, "Error connecting to mongodb"));
db.once('open', function(){
    console.log("connected to mongodb");
})
module.exports=db;