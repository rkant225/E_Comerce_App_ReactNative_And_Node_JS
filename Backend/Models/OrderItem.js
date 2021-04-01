const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    product : {type : mongoose.Schema.Types.ObjectId, ref : 'Product'},
    quantity : {type : Number, required : true}
});

module.exports = mongoose.model('OrderItem', orderItemSchema); // "OrderItem" will be the name of tabel