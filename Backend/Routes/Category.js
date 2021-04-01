const express = require('express');
const Category = require('../Models/Category');
const AuthenticateRolesMiddleware = require('../MiddleWares/AuthenticateRolesMiddleware');

const Router = express.Router();
const defaultResponse = {isSuccessfull : true};


// This will return all the Categories list.
Router.get('/', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    try {
        const categories = await Category.find({}).exec();
        res.status(200);
        res.send({...defaultResponse, categories : categories});
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/count', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    try {
        const categoryCount = await Category.countDocuments();
        res.status(200);
        res.send({...defaultResponse, count : categoryCount});
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/getSingleCategory', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    const {categoryId} = req.body;
    try {
        const category = await Category.findById(categoryId).exec();
        if(category){
            res.send({...defaultResponse, category : category});
        } else {
            res.send({isSuccessfull : false, errorMessage : "Category not found."});
        }
        
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.post('/add', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    const {name, color, icon} = req.body;
    try{
        const createdCategory = new Category({
            name : name,
            color : color,
            icon : icon
        })
        await createdCategory.save();
        res.status(200);
        res.send({...defaultResponse, category : createdCategory});
    }catch(err){
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.put('/update', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    const {categoryId, name, color, icon} = req.body;
    try{
        const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
            name : name,
            color : color,
            icon : icon
        }, {new : true}); // Here "new : true" is used to return the updated data, otherwise it will return old data.
        if(updatedCategory){
            res.send({...defaultResponse, category : updatedCategory});
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : "Category not exist."})
        }
        
    } catch(err){
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.delete('/delete', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    const {categoryId} = req.body;
    console.log('categoryId', categoryId)
    try{
        await Category.findByIdAndDelete(categoryId);
        res.status(200);
        res.send({...defaultResponse});
    }catch(err){
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

module.exports = Router;