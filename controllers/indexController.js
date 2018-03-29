var passport = require('passport');

	module.exports.indexHome = function(req, res, next) {
        console.log('TRACE | Request indexHome in indexController from ' + req.headers.host);
        res.redirect('/readme');
    }
    module.exports.indexLoginGet = function(req, res) {
        console.log('TRACE | Request indexLoginGet in indexController from ' + req.headers.host);
	   	res.render('template/login', { message: req.flash('message') });
    }
    // module.exports.indexLoginPost = passport.authenticate('adminLogin', {
    //     successRedirect: '/readme',
    //     failureRedirect: '/login',
    //     failureFlash : true 
    // });
    module.exports.indexLoginPost = function(req, res, next) {
        console.log('TRACE | Request indexLoginPost in indexController from ' + req.headers.host);
         passport.authenticate('adminLogin', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.json({ status:'fail'}); }
            req.logIn(user, function(err) {
              if (err) { return res.json({ status:'fail'}); }
              return res.json({ status:'success'});
            });
          })(req, res, next);
    }


    module.exports.indexLogOutGet = function(req, res) {
	   	req.logout();
  	   	res.redirect('/login');
    }
    module.exports.indexReadMeGet = function(req, res) {
        console.log(req.ip);
	   	res.render('template/readme', {});
	   	
    }
    module.exports.indexDashBoardGet = function(req, res) {
	   	res.render('template/index', {});
    }
    module.exports.indexFlotGet = function(req, res) {
	   	res.render('template/flot', {});
    }
    module.exports.indexMorrisGet = function(req, res) {
	   	res.render('template/morris', {});
    }
    module.exports.indexTablesGet = function(req, res) {
	   	res.render('template/tables', {});
    }
    module.exports.indexFormsGet = function(req, res) {
	   	res.render('template/forms', {});
    }
    module.exports.indexPanelSwellsGet = function(req, res) {
	  	res.render('template/panelswells', {});
    }
    module.exports.indexButtonsGet = function(req, res) {
		res.render('template/buttons', {});
    }
    module.exports.indexNotifyGet = function(req, res) {
	   	res.render('template/notifications', {});
    }
    module.exports.indexTypographyGet = function(req, res) {
	   	res.render('template/typography', {});
    }
    module.exports.indexIconsGet = function(req, res) {
	   	res.render('template/icons', {});
    }
    module.exports.indexGridGet = function(req, res) {
	   	res.render('template/grid', {});
    }
    module.exports.indexErrGet = function(req, res) {
        res.render('error');
    }