const express = require('express');
const all_routes = require('express-list-endpoints'); // Library to get the list of all registered routes in application.

const Router = express.Router();


Router.get('/', (req,res,next)=>{
    
    const routes = all_routes(req.app).map((route)=>{
        return {
            path : route.path,
            method : route.methods[0]
        }
    });

    res.send({
        appName : "E-Commerce Application",
        message : "Hey there, We are online. Server is up and running....!!!", 
        developedBy : 'Rahul Singh', 
        emailId : 'rkant225@gmail.com', 
        gitHub : 'https://github.com/rkant225',
        total_routes : routes.length,
        all_routes : routes
    })
});

module.exports = Router;