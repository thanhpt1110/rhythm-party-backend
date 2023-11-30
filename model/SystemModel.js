const mongoose = require('mongoose')

const systemSchema = mongoose.Schema({
    dateSystem:{
        type: Date,
        default: Date.now
    },
    userQuantity:{
        type: Number,
        default: 1
    }
},
{
    timestamps: true,
})