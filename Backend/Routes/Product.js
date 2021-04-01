const express = require('express');
const AuthenticateRolesMiddleware = require('../MiddleWares/AuthenticateRolesMiddleware');
const FileUploadMiddleware = require('../MiddleWares/FileUploadMiddleware');
const Category = require('../Models/Category');
const Product = require('../Models/Product');

const Router = express.Router();
const defaultResponse = {isSuccessfull : true};


// This will return all the products list.
Router.get('/', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{ 
    try {
        const products = await Product.find({}).populate('category').exec();
        res.status(200);
        res.send({...defaultResponse, products : products});
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/count', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    try {
        const productsCount = await Product.countDocuments();
        res.status(200);
        res.send({...defaultResponse, count : productsCount});
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/getFeaturedProducts', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    const {numbetOfProductsToGet} = req.body;
    try {
        const featuredProducts = await Product.find({isFeatured : true}).limit(numbetOfProductsToGet || 3).exec();
        res.status(200);
        res.send({...defaultResponse, products : featuredProducts, count : featuredProducts.length});
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/getSingleProduct', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    const {productId} = req.body;
    try {
        const product = await Product.findById(productId).populate('category').exec();
        if(product){
            res.status(200);
            res.send({...defaultResponse, product : product});
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : "Product not found."});
        }
        
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/getProductOfCategories', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    const {categoryIds} = req.body;
    try {
        const products = await Product.find({category : categoryIds}).populate('category').exec();
        if(products){
            res.status(200);
            res.send({...defaultResponse, products : products});
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : "Product not found."});
        }
        
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.post('/add', AuthenticateRolesMiddleware(['ADMIN']), FileUploadMiddleware.single('image'), async (req,res,next)=>{
    const {name, description, richDescription, imageUrl, imageGalery, brand, price, category,  countInStock, rating, totalReviews, isFeatured} = req.body;
    try{
        if(req.file){
            const existingCategory = await Category.findById(category);
            if(existingCategory){
                const createdProduct = new Product({
                    name : name,
                    description : description,
                    richDescription : richDescription,
                    imageUrl : `Public/images/${req.file.filename}`,
                    brand : brand,
                    price : price,
                    category : category,
                    countInStock : countInStock,
                    rating : rating,
                    totalReviews : totalReviews,
                    isFeatured : isFeatured,
                });
                await createdProduct.save(); // ToDo : need to uncomment when multer is implemented properly.
        
                res.status(200);
                res.send({...defaultResponse, product : createdProduct});
            } else {
                res.status(200);
                res.send({isSuccessfull : false, errorMessage : 'Specified category does not exist.'})
            }
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'File is invalid or it have unsupportrd extension. Make sure you have provided valid file.'})
        }
        
    } catch(err){
        res.status(200);
        res.send({isSuccessfull : false, errorMessage : 'Something went wrong, Unable to add product.',  error : err})
    }
});

Router.put('/update', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    const {productId, name, description, richDescription, imageUrl, brand, price, category,  countInStock, rating, totalReviews, isFeatured} = req.body;
    try{
        const existingCategory = await Category.findById(category);
        if(existingCategory){
            const updatedProduct = await Product.findByIdAndUpdate(productId, {
                name : name,
                description : description,
                richDescription : richDescription,
                imageUrl : imageUrl,
                brand : brand,
                price : price,
                category : category,
                countInStock : countInStock,
                rating : rating,
                totalReviews : totalReviews,
                isFeatured : isFeatured,
            }, {new : true}); // Here "new : true" is used to return the updated data, otherwise it will return old data.
    
            if(updatedProduct){
                res.status(200);
                res.send({...defaultResponse, product : updatedProduct});
            } else {
                res.status(200);
                res.send({isSuccessfull : false, errorMessage : "Product not exist."})
            }
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : "Associated categoyy doesnot exist."})
        }
    } catch(err){
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.put('/updateImageGalery', AuthenticateRolesMiddleware(['ADMIN']), FileUploadMiddleware.array('images', 5), async (req, res, next)=>{
    const {productId} = req.body;
    try{
        if(req.files){

            const existingProduct = await Product.findById(productId);
            if(existingProduct){
                let imageURLs = [];

                for(let file of req.files){
                    imageURLs.push(`Public/images/${file.filename}`);
                }
    
                const updatedProduct = await Product.findByIdAndUpdate(productId, {
                    imageGalery : imageURLs
                }, {new : true}); // Here "new : true" is used to return the updated data, otherwise it will return old data.
    
                res.status(200);
                res.send({...defaultResponse, product : updatedProduct});
            } else {
                res.status(200);
                res.send({isSuccessfull : false, errorMessage : "Product not exist."})
            }
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'Files are invalid or they have unsupportrd extension. Make sure you have provided valid files.'})
        }
    } catch(err){
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.delete('/delete', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    const {productId} = req.body;
    try{
        const product = await Product.findByIdAndDelete(productId);
        if(product){
            res.status(200);
            res.send({...defaultResponse});
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'No product found.'})
        }
    }catch(err){
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});




module.exports = Router;