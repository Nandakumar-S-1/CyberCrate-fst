const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: false,
        sparse:true,
        default:null,
    },
    googleId:{
        type:String,
        unique:true
    },
    password: {
        type: String,
        required: false,
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    cart: [{
        type: Schema.Types.ObjectId,
        ref: 'Cart'
    }],
    wallet: {
        type: Schema.Types.ObjectId,
    },
    wishList: [{
        type: Schema.Types.ObjectId,
        ref: 'Wishlist'
    }],
    orderHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    createdOn: {
        type: Date,
        default: Date.now
    },
    isVerified: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);
