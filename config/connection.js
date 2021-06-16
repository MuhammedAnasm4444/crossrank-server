const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
var db;
module.exports.connect = function(done) {
    MongoClient.connect(process.env.ATLAS_URL,{useUnifiedTopology:true}, (err, data) => {
        if(err) return done(err)
        db = data.db('CrossRank')
    })
    done()

}
module.exports.get = function() {
    return db;
}

// mongodb+srv://anas:Grq1TazPimnkK7ZR@cluster0.jd4i1.mongodb.net/CrossRank?retryWrites=true&w=majorityuster0.jd4i1.mongodb.net/CrossRank?retryWrites=true&w=majority
