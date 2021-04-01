const AuthenticateRolesMiddleware = (roles) =>{
    return (req, res, next)=>{
        const {role} = req.user;
        if(roles.includes(role)){
            next();
        } else {
            res.status(200);
            res.send({isSuccessfull : false, message : 'You role is not authorized to perform this operation.'});
        }
    }
}

module.exports = AuthenticateRolesMiddleware;