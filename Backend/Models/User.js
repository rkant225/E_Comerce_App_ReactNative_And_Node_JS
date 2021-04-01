const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name : {type : String, required : true},
    email : {type : String, required : true},
    password : {type : String, required : true},
    street : {type : String, default : ''},
    appartment : {type : String, default : ''},
    city : {type : String, default : ''},
    zipCode : {type : String, default : ''},
    country : {type : String, default : ''},
    mobileNo : {type : Number, required : true},
    role : {type : String, default : 'CUSTOMER', enum : ['ADMIN', 'CUSTOMER']}
});

module.exports = mongoose.model('User', userSchema); // "User" will be the name of tabel