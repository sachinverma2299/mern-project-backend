const HttpError = require('../models/http-error')
const { v4: uuidv4 } = require('uuid');

const DUMMY_PLACES = [
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

exports.getPlaceById = (req,res,next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
       return p.id === placeId;
    })
    if(!place) {
        throw new HttpError('Could not find a place for the provided id.', 404)
    }
    // console.log('inside the first route');
    res.json({place})
}

exports.getPlaceByUserId = (req,res,next) =>{
    const userId = req.params.uid;

    const place = DUMMY_PLACES.find(p => {
        return p.creator === userId;
    })
    if(!place) {
        return next(new HttpError('Could not find a place for the provided user id.', 404))
    }
    res.json({place})
    
}

exports.createPlace = (req,res,next) => {
    const {title, description, coordinates, address, creator} = req.body;
    const createdPlace = {
        id: uuidv4(),
        title,
        description,
        location:coordinates,
        address,
        creator
    }
    DUMMY_PLACES.push(createdPlace);
    res.status(201).json({place:createdPlace})

}
exports.updatePlaceById = (req,res,next) => {
    const {title, description} = req.body;
    const placeId = req.params.pid;

    const updatedPlace = DUMMY_PLACES.find(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;
}

exports.deletePlaceById = (req,res,next) => {

}