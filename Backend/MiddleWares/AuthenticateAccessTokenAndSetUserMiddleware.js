const jwt = require('jsonwebtoken');
const User = require('../Models/User');
// const all_routes = require('express-list-endpoints'); // Library to get the list of all registered routes in application.

const AuthenticateAccessTokenAndSetUserMiddleware = async (req, res, next) =>{
    const token = req.headers && req.headers.authorization && req.headers.authorization.split(' ')[1] ? req.headers.authorization.split(' ')[1] : "";
    if(token){
        try{
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
            const {userId} = decodedToken;
            const loggedInUser = await User.findById(userId);
            if(loggedInUser){
                req.user = loggedInUser;
                next();
            } else {
                res.status(200); 
                res.send({isSuccessfull : false, errorMessage : "You are no longer registered with us. There is some issue with Access token."})
            }
        } catch(err){
            res.status(200); 
            res.send({isSuccessfull : false, errorMessage : "Unauthorised access to this API, Please login.", error : err})
        }
    } else {
        res.status(200);
        res.send({isSuccessfull : false, errorMessage : "Access token is not provided, Please login and get access token."})
    }
}

// const AuthenticateAccessTokenAndSetUserMiddleware = async (req, res, next) =>{

//     const ALL_AVAILABLE_PATHS = []; // List of all registered routes in application.
//      all_routes(req.app).forEach((route)=> {
//         ALL_AVAILABLE_PATHS.push(route.path)
//         ALL_AVAILABLE_PATHS.push(`${route.path}/`)
//      }); 

//     const PATHS_FOR_WHICH_AUTHENTICATION_IS_NOT_REQUIRED = ['/', '//', '/api/auth/login', '/api/auth/login/', '/api/auth/register', '/api/auth/register/'] // URLs for which Authentication is not required.
//     const PATHS_FOR_WHICH_AUTHENTICATION_IS_REQUIRED = ALL_AVAILABLE_PATHS.filter((path)=> !PATHS_FOR_WHICH_AUTHENTICATION_IS_NOT_REQUIRED.includes(path)); // URLs for which Authentication is required.
//     const request_URL = req.url; 

//     if(PATHS_FOR_WHICH_AUTHENTICATION_IS_REQUIRED.includes(request_URL)) { //Authenticate the Access_Token
//         const token = req.headers && req.headers.authorization && req.headers.authorization.split(' ')[1] ? req.headers.authorization.split(' ')[1] : "";
//         if(token){
//             try{
//                 const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
//                 const {userId} = decodedToken;
//                 const loggedInUser = await User.findById(userId);
//                 req.user = loggedInUser;
//                 next();
//             } catch(err){
//                 res.status(200); 
//                 res.send({isSuccessfull : false, errorMessage : "Unauthorised access to this API, Please login.", error : err})
//             }
//         } else {
//             res.status(200);
//             res.send({isSuccessfull : false, errorMessage : "Access token is not provided, Please login and get access token."})
//         }
//     } else if(PATHS_FOR_WHICH_AUTHENTICATION_IS_NOT_REQUIRED.includes(request_URL)) {
//         next()
//     } else {
//         res.status(200);
//         res.send({isSuccessfull : false, errorMessage : "Path not found, Please validate URL. If extra '/' is present at the end of URL please remove it. If you are passing parameter in URL then please note that this is not supportrd by server at the moment."})
//     }
// }

module.exports = AuthenticateAccessTokenAndSetUserMiddleware;