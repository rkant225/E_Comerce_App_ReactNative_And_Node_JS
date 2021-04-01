const multer = require('multer'); // This is a middleware, used to extract the data from request which is of type "formData" (not the JSON). Note : Form data can carry Binary data as well, but JSON can't.
// const { v4: uuid } = require('uuid'); // This will generate random unique ID
const fs = require('fs');
const path = require('path');


// Allowed file types.
const MIME_TYPE_TO_FILE_EXTENSION_MAPPER = {
    'image/jpeg' : 'jpeg',
    'image/png' : 'png',
    'image/jpg' : 'jpg',
}

const FileUploadMiddleware = multer({
    limits : 1024000, // Allowed file size in bytes. Chech your conversion here : https://convertlive.com/u/convert/megabytes/to/bytes#1
    storage : multer.diskStorage({ // This will define where file will be stored and fileName
        destination : (req, file, cb)=>{
            if(!fs.existsSync(path.join(__dirname, '../Public'))){ // Create directory if not exist.
                fs.mkdirSync(path.join(__dirname, '../Public'))
            }
            if(!fs.existsSync(path.join(__dirname, '../Public/images'))){ // Create directory if not exist.
                fs.mkdirSync(path.join(__dirname, '../Public/images'))
            }
            cb(null, 'Public/images') // At last you need to call the callBack with 2 parameters cb(error, 'destinationPath')
        },
        filename : (req, file, cb)=>{
            // FIRST way
            // const fileExtension = MIME_TYPE_TO_FILE_EXTENSION_MAPPER[file.mimetype];
            // console.log(file); // { fieldname: 'image', originalname: 'acer.jpg', encoding: '7bit', mimetype: 'image/jpeg'}
            // const fileName =  Math.random().toString(36).split('.')[1]; // You can get unique file name using this
            // cb(null, `${fileName}.${fileExtension}`) // At last you need to call the callBack with 2 parameters cb(error, 'fileName.extension')
            // cb(null, `${uuid()}.${fileExtension}`) // At last you need to call the callBack with 2 parameters cb(error, 'fileName.extension')

            // SECOND way
            const fileName = `${Date.now()}-${file.originalname.replace(/ /g, '-')}`;// This will add unix timeStamp and remove space from fileName "1617285624039-acer-laptop.jpg"
            cb(null, fileName);
        }
    }),
    fileFilter : (req, file, cb)=>{
        const isValid = !!MIME_TYPE_TO_FILE_EXTENSION_MAPPER[file.mimetype]; // !! is BANG operator, it is used to convert falsy values to boolen FALSE.  !!undefined -> false

        //FIRST way
        // cb(null, isValid); // This will make req.file as null and this can be checked in the Route using this middleware. This is easy, and you do not need to handle error, Because you are not throwing any error here.

        // SECOND way
        const error = isValid ? null : new Error('Unsupported file type.'); // Here we will throw an error and it will be handled by error handler route present in the end of App.js
        if(error){ // If error is not null then add user friendly message to it.
            error.userMessage = "Unsupported file type or it exceeds the size limit."
        }
        cb(error, isValid);
    }
});

module.exports = FileUploadMiddleware; // Export this middleware.
