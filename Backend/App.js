const express = require('express');
const BodyParser = require('body-parser'); // Import body-parser this will extract the json object passes by client in request body.
const cors = require('cors');
const path = require('path');
require('dotenv').config(); // To access environmental variables, This import is enough No need to import in each and every file.
const {connectDB} = require('./DB/MongoDb');

const homeRoute = require('./Routes/Home');
const productRoute = require('./Routes/Product');
const categoryRoute = require('./Routes/Category');
const orderRoute = require('./Routes/Order');
const userRoute = require('./Routes/User');
const authRoute = require('./Routes/Auth');

const AuthenticateAccessTokenAndSetUserMiddleware = require('./MiddleWares/AuthenticateAccessTokenAndSetUserMiddleware');



const app = express();
const PORT = process.env.PORT;
const API_URL_Prefix = process.env.API_Prefix;

//----DataBAse Connection----
connectDB();
//----DataBAse Connection----
//----Allow CORS----
app.use(cors());
//----Allow CORS----

//----Body-Parser Middleware----
app.use(BodyParser.json()); // BodyParser middleware : This will extract JSON body passes from client and add to "body" property in request.
//----Body-Parser Middleware----

//----Static files serving middleware----
app.use('/Public/images', express.static(path.join('Public', 'images'))); // path.join() -> 'Public\\images'
//----Static files serving middleware----

//----Routes---------ORDER MATTERS(Routes ABOVE 'AuthenticateAccessTokenAndSetUserMiddleware' are freely accessible, No token is required. And Routes BELOW this middleware will not work if access_token is not provided)---------
app.use(homeRoute);
app.use(`${API_URL_Prefix}/auth`, authRoute);
app.use(AuthenticateAccessTokenAndSetUserMiddleware); // This middle ware will validate the access token, All the routes below this will requre user to login or pass access_token with request.
app.use(`${API_URL_Prefix}/users`, userRoute);
app.use(`${API_URL_Prefix}/products`, productRoute);
app.use(`${API_URL_Prefix}/orders`, orderRoute);
app.use(`${API_URL_Prefix}/categories`, categoryRoute);
//----Routes---------ORDER MATTERS(Routes ABOVE 'AuthenticateAccessTokenAndSetUserMiddleware' are freely accessible, No token is required. And Routes BELOW this middleware will not work if access_token is not provided)---------



// This will be executed only when none of the above routes sent response to the client.
app.use((req, res, next)=>{ 
    res.status(200);
    res.send({isSuccessfull : false, errorMessage : "Bad request, This path doesn't exist."})
});



// Error handling Middleware (it must get 4 paramerers)
app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError) {
        res.status(200)
        res.send({isSuccessfull : false, errorMessage : "Invalid Json passed."})
    } else {
        res.status(200)
        res.send({isSuccessfull : false, errorMessage : "Something went wrong.", error : error})
    }
});

app.listen(PORT, ()=>{
    console.log(`Server started listening at Port : ${PORT}`)
})