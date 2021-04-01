const mongoose = require('mongoose');
require('dotenv').config(); // To access environmental variables

//---------------Use this plugin to get rid of "_id" and "__v" fields created by mongoDb--------------------
const toJson = require('@meanie/mongoose-to-json');
mongoose.plugin(toJson); // This is being done globely, Other wise you need to use this plugin for each schema
//---------------Use this plugin to get rid of "_id" and "__v" fields created by mongoDb--------------------


const connectDB = async ()=>{
    // const URI_FOR_NEW_VERSION = `mongodb+srv://rkant225:<password>@cluster0.6x7ih.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`; // DB : PlaceBook
    // const URI_DEV = `mongodb://rkant225:rkant225@expresswithmongodb-shard-00-00.kfytu.mongodb.net:27017,expresswithmongodb-shard-00-01.kfytu.mongodb.net:27017,expresswithmongodb-shard-00-02.kfytu.mongodb.net:27017/PlaceBook?ssl=true&replicaSet=atlas-h29i6x-shard-0&authSource=admin&retryWrites=true&w=majority`; // DB : PlaceBook
    // const URI_PROD = `mongodb://rkant225:rkant225@expresswithmongodb-shard-00-00.kfytu.mongodb.net:27017,expresswithmongodb-shard-00-01.kfytu.mongodb.net:27017,expresswithmongodb-shard-00-02.kfytu.mongodb.net:27017/PlaceBook_PROD?ssl=true&replicaSet=atlas-h29i6x-shard-0&authSource=admin&retryWrites=true&w=majority`; // DB : PlaceBook_PROD
    const URI = process.env.MONGO_DB_CONNECTION_URL;
    console.log('Trying to connect Mondo DB Atlas Database...')
    try{
        await mongoose.connect(URI, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex : true});
        console.log('Connected to database successfully...!!!');
    }catch{
        process.exit(1);
    }
}

module.exports = { connectDB : connectDB };
