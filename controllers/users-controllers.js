const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')
const User = require('../models/user');
const { use } = require('../routes/places-routes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getUsers = async (req, res, next) => {
    // res.json({users: DUMMY_USERS})
    let users;
    try{
        users= await User.find({},'-password')
    }
    catch(err)
    {
        const error = new HttpError('fetching users failed,please try again later.',500);
        return next(error);
    }
    res.json({users: users.map(user =>user.toObject({getters:true}))})

}

exports.signup = async(req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors)
        return next(new Error('invalid input passed please check your data.', 422))
    }
    const {name, email, password} = req.body;
    let existingUser;
    try{
        existingUser = await User.findOne({email: email})
    }
    catch(err){
        const error = new HttpError('signing up failed, please try again.', 500);
        return next(error);
    }
    if(existingUser) {
        const error = new HttpError('user already exist, please login instead.', 422);
        return next(error);
    }
    console.log(req.file);

    let hashedPassword;

    try {
        hashedPassword = await bcrypt.hash(password,12);
    }
    catch(err) {
        // console.log(err);
        const error = new HttpError(
            'Could not create user, Please try again.',
            500
        );
        return next(error)
    }

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password:hashedPassword,
        places:[]
    })
    try{
        await createdUser.save();
    }
    catch(err)
    {
        const error = new HttpError('signing up failed, please try again.',500)
        return next(error)
    }
    let token;
    try
    {
        token = jwt.sign(
            {userId: createdUser.id, email:createdUser.email},
            process.env.JWT_KEY,
            {expiresIn: '1h' }
            );
    }
    catch(err)
    {        
        const error = new HttpError('signing up failed, please try again.',500)
        return next(error);
    }

    res.status(201).json({ userId : createdUser.id, email: createdUser.email, token:token})
}

exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;
    try{
        existingUser = await User.findOne({email: email})
    }
    catch(err){
        const error = new HttpError('signing up failed, please try again.', 500);
        return next(error);
    }

    if(!existingUser)
    {
        const error = new HttpError('invalid credentials,could not login', 403);
        return next(error)
    }
    let isValidPassword= false;
    try {
        isValidPassword = await bcrypt.compare(password,existingUser.password);

    }
    catch(err) {
        const error = new HttpError('could not login , please check your credentials and try again,',500)
        return next(error);
    }
    if(!isValidPassword) {
        const error = new HttpError('invalid credentials,could not login', 403);
        return next(error)
    }
    let token;
    try
    {
        token = jwt.sign(
            {userId: existingUser.id, email:existingUser.email},
            process.env.JWT_KEY,
            {expiresIn: '1h' }
            );
    }
    catch(err) 
    {
        const error = new HttpError('logging in failed, please try again.',500)
        return next(error);
    }
    res.json({
        userId: existingUser.id,
        email:existingUser.email,
        token:token
    })

}