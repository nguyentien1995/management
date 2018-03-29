var express = require('express'),
   	router = express.Router(),
   	apiBackEndController = require('../controllers/apiBackEndController');
   	// device
 	router.get('/device/list', apiBackEndController.getAllDevice);
 	router.post('/device/create', apiBackEndController.createDevice);
 	router.get('/device/edit/:DevEUI', apiBackEndController.getDeviceByDevEUIForEdit);
 	router.post('/device/edit', apiBackEndController.updateDeviceById);
 	router.get('/device/delete/:DevEUI', apiBackEndController.deleteDeviceByDevEUI);
 	// account
 	router.get('/account/list', apiBackEndController.getAllAccount);
 	router.post('/account/create', apiBackEndController.createAccount);
 	router.get('/account/edit/:username', apiBackEndController.getAccountByUsernameForEdit);
 	router.post('/account/edit', apiBackEndController.updateAccountById);
 	router.get('/account/delete/:username', apiBackEndController.deleteAccountByDevEUI);
 	// login, logout
 	// router.post('/account/login', apiBackEndController.adminLogin);

module.exports = router;