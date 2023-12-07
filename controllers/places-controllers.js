const HttpError = require('../models/http-error')
const { v4: uuidv4 } = require('uuid');
const {validationResult} = require('express-validator')
const Place = require('../models/place')

let DUMMY_PLACES = [
    {
      id: 'p1',
      title: 'Empire State Building',
      description: 'One of the most famous sky scrapers in the world!',
      location: {
        lat: 40.7484474,
        lng: -73.9871516
      },
      address: '20 W 34th St, New York, NY 10001',
      creator: 'u1'
    }
  ];

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
    // console.log('inside the first route');
    res.json({place: place.toObject({getters: true})})
}

exports.getPlacesByUserId = async (req,res,next) =>{
    const userId = req.params.uid;
    let places;
    try{
        places = await Place.find({creator:userId})

    }
    catch(err){
        const error = new HttpError('Fetching places failed, please try again.',500)
        return next(error);
    }
    if(!places || places.length === 0) {
        return next(new HttpError('Could not find places for the provided user id.', 404))
    }
    res.json({ places:places.map(place =>place.toObject({getters:true})) })
    
}

exports.createPlace = async(req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors)
        throw new Error('invalid input passed please check your data.', 422)
    }
    const {title, description, coordinates, address, creator} = req.body;
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'asdf',
        creator
    })
    try{
        await createdPlace.save();
    }
    catch(err)
    {
        const error = new HttpError('creating place failed, please try again.',500)
        return next(error)
    }
    // DUMMY_PLACES.push(createdPlace);
    res.status(201).json({place:createdPlace})

}
exports.updatePlace = async (req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        throw new Error('invalid input passed please check your data.', 422)
    }
    const {title, description} = req.body;
    const placeId = req.params.pid;
    console.log(placeId);

    let place;
    try {
        place = await Place.findById(placeId);

    }
    catch(err) {
        const error = new HttpError('Something went wrong, could not find place.',500)
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
        place = await Place.findById(placeId);
    }
    catch(err) {
        const error = new HttpError('something went wrong, could not find a place.',500)
        return next(error);
    }

    try{
        await place.deleteOne({id:placeId});
    }
    catch(err) {
        const error= new HttpError('place could not be removed,',500);
        return next(error);
    } 
    res.status(200).json({message:'Deleted place.'})

}