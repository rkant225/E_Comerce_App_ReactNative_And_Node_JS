const express = require('express');
const Order = require('../Models/Order');

const AuthenticateRolesMiddleware = require('../MiddleWares/AuthenticateRolesMiddleware');
const OrderItem = require('../Models/OrderItem');
const { populate } = require('../Models/Order');
const Product = require('../Models/Product');

const Router = express.Router();
const defaultResponse = {isSuccessfull : true};


// This will return all the Orders list.
Router.get('/', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    try {
        const orders = await Order.find({})
        .populate({ // POPULATE
            path : 'orderItems user', // This will populate 'orderItems' and 'user'
            select : '-password', // This will exclude 'password' from 'user'
            populate : {
                path : 'product', // This will populate 'product' present inside 'orderItem'
                populate : {
                    path : 'category'
                }
            }
        })
        .sort('-dateOrdered') // This will sort list in new to old manner by dateOrdered
        .exec();

        res.send({...defaultResponse, orders : orders});
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/getSingleOrder', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    const {orderId} = req.body;
    try {
        const order = await Order.findById(orderId)
        .populate({ // POPULATE
            path : 'orderItems user', // This will populate 'orderItems' and 'user'
            select : '-password', // This will exclude 'password' from 'user'
            populate : {
                path : 'product', // This will populate 'product' present inside 'orderItem'
                populate : {
                    path : 'category'
                }
            }
        })
        .exec();

        if(order){
            res.status(200);
            res.send({...defaultResponse, order : order});
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'No order found.'})
        }
        
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/getOrdersOfUser', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    const {userId} = req.body;
    try {
        const orders = await Order.find({user: userId}).sort('-dateOrdered').exec();

        if(orders){
            res.status(200);
            res.send({...defaultResponse, orders : orders});
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'No orders found.'})
        }
        
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.get('/getOrdersSummary', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    try {
        const orders = await Order.find({}).exec();

        if(orders){
            let totalSales = 0;
            for(let order of orders){ // Loop through all the orders
                const price = order.totalPrice; // Get the price of order
                totalSales = totalSales + price; // Sum up to "totalSales"
            }

            res.status(200);
            res.send({...defaultResponse, totalSales : totalSales, count : orders.length, orders : orders});
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'No orders found.'})
        }
        
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.post('/add', AuthenticateRolesMiddleware(['ADMIN', 'CUSTOMER']), async (req, res, next)=>{
    const {orderItems, shippingAddress, city, zip, country, mobileNo, status, user} = req.body;
    try{
        let totalPrice = 0;
        // First save the orderItems, and get the OrderItemsIds.  
        const orderItemsIDs_PROMISE = Promise.all(orderItems.map( async (orderItem)=>{
            const product = await Product.findById(orderItem.product); // Get the product
            totalPrice = totalPrice + (orderItem.quantity * product.price); // Calculate the total price
            product.countInStock = product.countInStock - orderItem.quantity; // Subtract the quantity from countInStock
            await product.save(); // Update the product

            const newOrderItem = new OrderItem({
                product : orderItem.product,
                quantity : orderItem.quantity
            });
            await newOrderItem.save(); // Save the orderItem
            return newOrderItem.id; // As this is an async method so this will return promise, In case there are multiple orderItems then there can be multiple promises, So to overcome this issue Promise.All() is used to get single Promise.
        }));
        const orderItemsIDs = await orderItemsIDs_PROMISE; // Array of the orderItemIDs, WAIT to get resolved

        // Once orderItems are saved then try to create the Order.
        const newOrder = new Order({
            orderItems : orderItemsIDs, // Array of the orderItemIDs
            shippingAddress : shippingAddress,
            city : city,
            zip : zip,
            country : country,
            mobileNo : mobileNo,
            status : status,
            totalPrice : totalPrice,
            user : user
        });

        await newOrder.save();
        res.status(200);
        res.send({...defaultResponse, order : newOrder});
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, errorMessage : 'Unable to submit order.', error : err})
    }
});

Router.put('/updateStatus', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    const {orderId, newStatus} = req.body;
    try {
        const order = await Order.findByIdAndUpdate(orderId, {status : newStatus}, {new : true}).exec();

        if(order){
            res.status(200);
            res.send({...defaultResponse, order : order});
        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'No order found.'})
        }
        
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

Router.delete('/delete', AuthenticateRolesMiddleware(['ADMIN']), async (req, res, next)=>{
    const {orderId} = req.body;
    try {
        const order = await Order.findById(orderId);
        if(order){
            const orderItemsIDs = order.orderItems;
            for (let orderItemId of orderItemsIDs){

                const orderItem = await OrderItem.findById(orderItemId); // Get the orderItem first
                const product = await Product.findById(orderItem.product); // Then Get the product
                product.countInStock = product.countInStock + orderItem.quantity; // Add the quantity in countInStock
                await product.save(); // Update the product

                await orderItem.delete();
            }
            await Order.findByIdAndDelete(orderId).exec();

            res.status(200);
            res.send({...defaultResponse});

        } else {
            res.status(200);
            res.send({isSuccessfull : false, errorMessage : 'No order found.'})
        }        
    } catch(err) {
        res.status(200);
        res.send({isSuccessfull : false, error : err})
    }
});

module.exports = Router;