const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const db  = require('../config/connection');
const collection = require('../config/collection');
const objectId = require('mongodb').ObjectID
require('dotenv').config();
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET;
module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        db.get().collection(collection.USER).findOne({_id:objectId(jwt_payload.id)}).then((user) => {
            if(user) {
                return done(null, user)
            }
            return done(null, false)
        })
        .catch(err => console.log(err))
   
    })
  );
};