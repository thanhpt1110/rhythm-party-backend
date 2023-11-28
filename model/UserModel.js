const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username:{
        type: String,
        required: false,
        default: null
    },
    password: {
        type: String,
        required: false,
        default: null
    },
    displayName: {
        type: String,
        required: [true, "Please add your password"],
    },
    googleID: {
        type: String,
        required: false,
        default: null
    },
    facebookID: {
        type: String, 
        required: false, 
        default: null,
    },
    email: {
        type: String,
        required: [true, "Please add your email"]
    },
    gender: {
        type: String,
        required: false,
    },
    birthday: {
        type: Date,
        required: false
    },
    avatar:{
        type: String,
        required: false,
        default: true
    },
    accountType:{
        type: String,
        required: [true, "Please add you type"]
    },
    role: {
        type: String,
        required: [true, "Please add your role"]
    },
    isAvailable:{
        type: Boolean,
        default: true
    }
    
},  
{
    timestamps: true,
}
)
module.exports = mongoose.model("User", userSchema );