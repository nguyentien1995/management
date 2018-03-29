var express = require('express'),
   router = express.Router(),
   accountController = require('../controllers/accountController');

	router.get('/create', accountController.accountCreateGet);
	router.post('/create', accountController.accountCreatePost);
	router.get('/active/:username', accountController.accountActiveGet);
	router.get('/list', accountController.accountList);
   	router.get('/edit/:username', accountController.accountEditGet);
   	router.post('/edit/', accountController.accountEditPost);
   	router.get('/delete/:username', accountController.accountDeleteGet);

module.exports = router;








   
