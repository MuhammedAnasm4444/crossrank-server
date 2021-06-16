const objectId = require('mongodb').ObjectID
const jwt = require('jsonwebtoken');
const userHelpers = require("../helpers/user-helper");

module.exports = {
checkUser : (req, res, next) => {
    console.log(req.cookies)
    const token = req.cookies.jwt
    if (token) {
        jwt.verify(token,'mysecret', async(err, decodedToken)=>{
                if(err){
                    console.log(err.message)
                    res.locals.user = null;
                    res.redirect('/login')
                    next();
                }
                else{
                    console.log(decodedToken)
                    let user = await userHelpers.login({_id:decodedToken.id})
                    console.log(user)
                    next();
                }
            })
        }
        else{
            res.locals.user = null;
            next()
        }

    },

 requireAuth :(req, res, next) => {
    
    const token = req.cookies.jwt
    // check json web token
    if(token) {
     jwt.verify(token,'mysecret', (err, decodedToken)=>{
         if(err) {
             console.log(err.message)
             res.redirect('/login')
         }
         else next();
     })
    }
    else res.redirect('/login');
},
checkdmin : (req, res, next) => {
    const token = req.cookies.jwt;
    if(token) {
        res.redirect('/')
    }
    else next();
},
}