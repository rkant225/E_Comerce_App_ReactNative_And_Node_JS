const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderItems : [{type : mongoose.Schema.Types.ObjectId, ref : 'OrderItem', required : true}],
    shippingAddress : {type : String, required : true},
    city : {type : String, required : true},
    zip : {type : String, required : true},
    country : {type : String, required : true},
    mobileNo : {type : String, required : true},
    status : {type : String, default : 'PENDING', enum : ['PENDING', 'PROCESSED', 'SHIPPED', 'DELIVERED']},
    totalPrice : {type : Number},
    user : {type : mongoose.Schema.Types.ObjectId, ref : 'User', required : true},
    dateOrdered : {type : Date, default : Date.now}
});

module.exports = mongoose.model('Order', orderSchema); // "Order" will be the name of tabel