const mongoose = require('mongoose')
const validator=require('validator')
const bcryptjs = require('bcryptjs')


var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
      
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        validate(valu){
            if(!validator.isEmail(valu)){
                throw new Error("Invalid email")
            }
        }
    },
    phone:{
        type:String,
        trim:true,
    },
    age:{
        type:Number,
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:8,
        validate(value){
            const StrongPassword = new RegExp("^(?=.*[a-z])(?=.*[0-9])")
            if(!StrongPassword.test(value)){
              throw new Error(" Password must contain ' ^(?=.*[a-z])(?=.*[0-9]) ' ")
            }
          }
    },
    tokens:[
        {
            type:String,
            createdAt: { 
            type: Date, 
            default: Date.now, 
            expires: 604800 // 7 أيام = 604800 ثانية
        }
        }
    ],


    role:{
        type:String,
        default:'User'
    },
    photo_id:{
        type:String,
        default:null
    },
    address:{
        type:String,
        default:null
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    verfied:{
        type:Boolean,
        default:false


    },
  
    passwordChangedAt: {
        type:Date
    },
    passwordResetToken: {
        type:String
    },
    passwordResetExpires: {
        type:Date
    },

}
,
{
 timestamps:true
}
);

userSchema.pre("save",async function(){

    try {
     const user = this 
        if(!user.isModified("password")){
        
          return
        }
            user.password = await bcryptjs.hash( user.password , 8)
      
      }
   catch (error) {
        console.log(error)
  } 
     })     
    
     userSchema.methods.toJSON = function(){
        const user = this 
        const dataToObject = user.toObject()
        delete dataToObject.password
        delete dataToObject.tokens
       
        return dataToObject
      }
      



module.exports = mongoose.model('User', userSchema);
