const mongoose = require('mongoose');
// const toJsonPlugin = require('@meanie/mongoose-to-json');

const productSchema = mongoose.Schema({
    name : {type : String, required : true},
    description : {type : String, required : true},
    richDescription : {type : String, default : ""},
    imageUrl : {type : String, default : "https://i.ytimg.com/vi/db1MG8uRHTM/maxresdefault.jpg"},
    imageGalery : [{type : String}],
    brand : {type : String, default : ""},
    price : {type : Number, default : 0},
    category : {type : mongoose.Schema.Types.ObjectId, ref : 'Category', required : true},
    countInStock : {type : Number, required : true, min : 0},
    rating : {type : Number, default : 0},
    totalReviews : {type : Number, default : 0},
    isFeatured : {type : Boolean, default : false},
    dateCreated : {type : Date, default : Date.now},

});

// productSchema.plugin(toJsonPlugin);

module.exports = mongoose.model('Product', productSchema); // "Product" will be the name of tabel