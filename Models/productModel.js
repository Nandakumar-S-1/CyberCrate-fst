const mongoose=require('mongoose');
const {Schema}=mongoose;

const productSchema = new Schema({
    productName:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    category:{
        type:Schema.Types.ObjectId,
        reference:'Category',
        required:true
    },
    realPrice:{
        type:Number,
        required:true,
    },
    salePrice:{
        type:Number,
        required:true
    },
    productOffer:{
        type:Number,
        default:0,
    },
    quantity:{
        type:Number,
        default:true
    },
    productImage:{
        type:[String],
        required:true
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:['In Stock','Out of stock','Discontinued'],
        required:true,
        default:'In Stock'
    },

},
{timestamps:true});


const Product=mongoose.model('Product',productSchema);

module.exports = Product;