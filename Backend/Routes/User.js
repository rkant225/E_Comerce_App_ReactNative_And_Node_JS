const express = require('express');
const User = require('../Models/User');
const bcryptJs = require('bcryptjs');
const Router = express.Router();

const AuthenticateRolesMiddleware = require('../MiddleWares/AuthenticateRolesMiddleware');

const defaultResponse = {isSuccessfull : true};

const SALT = 12;


// This will return all the Users list.
Router.get('/',AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    try {
        const users = await User.find({}).select('-password').exec();
        res.send({...defaultResponse, users : users, count : users.length});
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/getSingleUser', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    const {userId} = req.body;
    try {
        const user = await User.findById(userId).select('-password').exec();
        if(user){
            res.send({...defaultResponse, user : user});
        } else {
            res.send({isSuccessfull : false, errorMessage : "User not found."});
        }
        
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.post('/add', AuthenticateRolesMiddleware(['ADMIN']), async (req,res,next)=>{
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
                role : role
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

Router.delete('/delete', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    const {userId} = req.body;
    try{
        await User.findByIdAndDelete(userId);
        res.status(200);
        res.send({...defaultResponse});
    }catch(err){
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

module.exports = Router;