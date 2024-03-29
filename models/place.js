const mongoose = require('mongoose')
const {Schema} = mongoose

// const Schema =mongoose.schema

const placeSchema = new Schema({
    title: {type: String, required: true},
    description : {type: String, required:true},
    image: {type: String, required:true},
    address: {type: String, required:true},
    location:{type: Number,required:true},
    creator:{type: mongoose.Types.ObjectId, required:true, ref:'User'}
})

module.exports=mongoose.model('Place',placeSchema)