var mongoose = require('mongoose');
//mongoose.set('debug', true);
var dbConfig = require('./config.js');

var db = function() {

    return {
        connect: function() {
            console.log(Date());
            console.log('Tryng connect to database');
            var connectUrl = 'mongodb://' 
                                // + (dbConfig.mongodb.username) + ':' + (dbConfig.mongodb.password) + '@'
                                + dbConfig.mongodb.host + '/' + dbConfig.mongodb.database
                                // + '?authSource=' + dbConfig.mongodb.options.authSource;
            mongoose.connect(connectUrl, dbConfig.mongodb.options);
            var db = mongoose.connection;
            db.on('error', function(err) {
                console.log('Cannot connect to Database');
                console.log(err);
            });
            db.once('open', function() {
                console.log('Your app is connected to database now');
            });
        }
    };
};
module.exports = db();