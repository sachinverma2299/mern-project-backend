const HttpError = require('../models/http-error')
const fs = require('fs');
const {validationResult} = require('express-validator')
const Place = require('../models/place')
const User = require('../models/user');
const mongoose = require('mongoose')

exports.getPlaceById = async (req,res,next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    }
    catch(err) {
        const error = new HttpError('Something went wrong, could not find a place.',500)
        return next(error);
    }
    if(!place) {
        const error = new HttpError('Could not find a place for the provided id.', 404)
        return next(error);
    }
    res.json({place: place.toObject({getters: true})})
}

exports.getPlacesByUserId = async (req,res,next) =>{
    const userId = req.params.uid;
    console.log('inside getplacesbyuserid');
    let userWithPlaces;
    try{
        userWithPlaces = await User.findById(userId).populate('places')

    }
    catch(err){
        const error = new HttpError('Fetching places failed, please try again.',500)
        return next(error);
    }
    if(!userWithPlaces || userWithPlaces.length === 0) {
        return next(new HttpError('Could not find places for the provided user id.', 404))
    }
    console.log('userwithplaces----------------',userWithPlaces);
    res.json({ places:userWithPlaces.places.map(place =>place.toObject({getters:true})) })
    
}

exports.createPlace = async(req,res,next) => {
    console.log('inside create place');
    console.log(req.body);
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors)
        return next( new Error('invalid input passed please check your data.', 422))
    }
    const {title, description, coordinates, address, creator} = req.body;
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator
    })
    console.log(createdPlace);
    let user;
    try{
        user = await User.findById(creator);
    }
    catch(err)
    {
        const error = new HttpError('creating place failed',500)
        return next(error);
    }
    console.log(user);
    if(!user)
    {
        const error = new HttpError('could not find user for provided id.',404);
        return next(error);
    }

    console.log(user)
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session:sess})
        await sess.commitTransaction();
    }
    catch(err)
    {
        console.log(err);
        const error = new HttpError('creating place failed, please try again.',500)
        return next(error)
    }
    // DUMMY_PLACES.push(createdPlace);
    res.status(201).json({place:createdPlace})

}
exports.updatePlace = async (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return next(new Error('invalid input passed please check your data.', 422))
    }
    const {title, description} = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);

    }
    catch(err) {
        const error = new HttpError('Something went wrong, could not find place.',500)
        return next(error);
    }
    if(place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('you are not allowed to edit this place.',
        401
    );
    return next(error);
    }

    place.title = title;
    place.description = description;
    try {
        await place.save()
    }
    catch(err) {
        const error = new HttpError('something went wrong, could not find a place',500)
        return next(error);
    }
    res.status(201).json({place: place.toObject({getters: true})})
}

exports.deletePlace = async (req,res,next) => {
    const placeId = req.params.pid;
    console.log(placeId);
    let place;
    try{
        place = await Place.findById(placeId).populate('creator');
    }
    catch(err) {
        const error = new HttpError('something went wrong, could not find a place.',500)
        return next(error);
    }
    if(!place)
    {
        const error = new HttpError('Could not find a place for this id',404)
        return next(error);
    }
    if(place.creator.id !== req.userData.userId)
    {
        const error = new HttpError('you are not allowed to delete this place.',
        401
    );
    return next(error);
    }

    const imagePath = place.image;

    try{

        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.deleteOne({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session:sess})
        await sess.commitTransaction();
    }
    catch(err) {
        const error= new HttpError('place could not be removed,',500);
        return next(error);
    }
    fs.unlink(imagePath, err=>{ console.log(err)})
    res.status(200).json({message:'Deleted place.'})

}