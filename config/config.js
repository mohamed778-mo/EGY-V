const mongoose =require("mongoose")
require("dotenv").config()
const URL =process.env.MONGODB_URL
const connection = ()=>{
   mongoose.connect('mongodb+srv://muhammadelmalla13:vqwTQAACDU6v0FGO@cluster0.njnkmyd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
      .then(()=>{console.log('done connection !!')})
  .catch((error)=>{console.log(error.message)})
}

module.exports = connection

 
