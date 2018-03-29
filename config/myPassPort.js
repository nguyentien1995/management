var LocalStrategy = require('passport-local').Strategy;
var Account = require('../models/accountModel');
var bcrypt = require('bcrypt-nodejs');

module.exports = function(passport){
	passport.use('adminLogin', 
		new LocalStrategy({ passReqToCallback : true },
		function(req, username, password, done, next) { 
	    // check in mongo if a user with username exists or not
	    Account.findOne({ 'username' :  username }, 
		    function(err, account) {
		        // In case of any error, return using the done method
		        if (err) return next(err);
			    // Username does not exist, log error & redirect back
			    if (!account){
			        console.log('User Not Found with username '+ username);
			     	return done(null, false, req.flash('message', 'Username Is Not Exist.'));                 
			    }
			    // User exists but wrong password, log the error 
			    if (!isValidPassword(account, password)){
				    console.log('Invalid Password');
				    return done(null, false, req.flash('message', 'Wrong Password.'));
			    }
			    // User and password both match, return user from 
			    // done method which will be treated like success
			    return done(null, account);
		    }
		);
	}));

	passport.serializeUser(function(user, done) {
	  	done(null, user._id);
	});
	 
	passport.deserializeUser(function(id, done) {
		Account.findById(id, function(err, user) {
	    done(err, user);
	  });
	});
	
}	

var isValidPassword = function(account, password){
  return bcrypt.compareSync(password, account.password);
}

// Generates hash using bCrypt
var createHash = function(password){
 return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}
