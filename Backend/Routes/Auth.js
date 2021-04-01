const express = require('express');
const User = require('../Models/User');
const bcryptJs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Router = express.Router();
const defaultResponse = {isSuccessfull : true};

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const SALT = 12;
const ACCESS_TOKEN_EXPIRY_LIMIT = 1; // 1 Day
const LIMIT_TIME_IN = 'd' // 's' for Second, 'm' for Minute, 'h' for Hour, 'd' for Day

Router.post('/register', async (req,res,next)=>{
    const {name, email, password, street, appartment, city, zipCode, country,  mobileNo, role} = req.body;
    try{
        const existingUser = await User.findOne({email : email});
        if(!existingUser){

            const hashedPassword = await bcryptJs.hash(password, SALT); //Convert password to hashedPasword and then save it to database.

            const createdUser = new User({
                name : name,
                email : email,
                password : hashedPassword, //HashedPassword for safety purpose.
                street : street,
                appartment : appartment,
                city : city,
                zipCode : zipCode,
                country : country,
                mobileNo : mobileNo,
                role : role // Uncomment this to Register ADMIN user First time, If this line is commented then by default newly created user will be of 'CUSTOMER' type. Only a admin can create new 'admin' or 'customer'
            });

            await createdUser.save();

            const newUserExcludingPassword = await User.findById(createdUser.id).select("-password");
    
            res.status(200);
            res.send({...defaultResponse, user : newUserExcludingPassword});
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'User with this E-mail is already registered.'})
        }
    } catch(err){
        res.status(200);
        res.send({isSuccessfull : false, errorMessage : 'Something went wrong, Unable to add user.',  error : err})
    }
});

Router.post('/login', async (req, res, next)=>{
    try{
        const {email, password} = req.body;
        const existingUser = await User.findOne({email : email}).exec();
        if(existingUser){
            const isValidPassword = await bcryptJs.compare(password, existingUser.password);
            if(isValidPassword){
                const access_token = jwt.sign({email : existingUser.email, userId : existingUser.id, role : existingUser.role}, JWT_SECRET_KEY, {expiresIn : `${ACCESS_TOKEN_EXPIRY_LIMIT}${LIMIT_TIME_IN}`});
                res.status(200);
                res.send({...defaultResponse, role : existingUser.role, name : existingUser.name, email : existingUser.email, userId : existingUser.id, access_token : access_token})
            } else {
                res.status(200);
                res.send({isSuccessfull : false, errorMessage : 'Invalid password.'})
            }

        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'User not found.'})
        }

    }catch(err){
        res.status(200);
        res.send({isSuccessfull : false, errorMessage : 'Something went wrong, Unable to login.',  error : err})
    }
})

module.exports = Router;