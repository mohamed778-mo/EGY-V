const mongoose =require("mongoose")
require("dotenv").config()
const URL =process.env.MONGODB_URL
const connection = ()=>{
   mongoose.connect('mongodb://127.0.0.1:27017/EGY-V')
      .then(()=>{console.log('done connection !!')})
  .catch((error)=>{console.log(error.message)})
}

module.exports = connection

 
