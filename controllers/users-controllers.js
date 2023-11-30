const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator')



const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'max',
        email: 'max@gmail.com',
        password: 'testers'
    }
]

exports.getUsers = (req, res, next) => {
    res.json({users: DUMMY_USERS})

}

exports.signup = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors)
        throw new Error('invalid input passed please check your data.', 422)
    }
    const {name, email, password} = req.body;

    const hasUser = DUMMY_USERS.find(u => u.email === email);
    if(hasUser) {
        throw new Error('Could not create user, email already exist', 422)
    }
    const createdUser = {
        id: uuidv4(),
        name,
        email,
        password
    }
    DUMMY_USERS.push(createdUser);
    res.status(201).json({ users: createdUser })
}

exports.login = (req, res, next) => {
    const {email, password} = req.body;

    const identifiedUser = DUMMY_USERS.find(p => p.email === email);
    if(!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('could not identify user, credentials seems to be wrong ', 401);
    }
    res.json({message: 'logged in!'})


}