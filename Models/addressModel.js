const mongoose=require('mongoose');
const {Schema}=mongoose;


const addressSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        reference:'User',
        required:true 
    },
    address:[{
        addressType:{
            type:String,
            required:true,
        },
        name:{
            type:String,
            required:true,
        },
        city:{
            type:String,
            required:true,
        },
        landMark:{
            type:String,
            required:true,

        },
        district:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        phone:{
            type:String,
            required:true,
        },
        alterPhone:{
            type:String,
            required:true
        }
    }]
})

const Address = mongoose.model('Address',addressSchema);

module.exports = Address;