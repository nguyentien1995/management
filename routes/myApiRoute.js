var express = require('express');
var router = express.Router();
var myApiController = require('../controllers/myApiController');
var genAutoNumber = require('../helper/genAutoNumber');

var jwt = require('jsonwebtoken');
var chkToken = function(req, res, next) {
 	// verifies secret and checks exp
	if(req.headers.authorization == undefined) {
		var msg = "Không tìm thấy token trong header";
		return res.json({ success: 'fail', onErr: { errType: 5, message: msg }})
	} else {
	 	var token = req.headers.authorization.split('Bearer ')[1];
		jwt.verify(token, 'mySecret', function(err, decoded) {      
			if (err) {
			    return res.json({ success: 'fail', onErr:{ errType: 6, message: err }});    
			} else {
			 	if (decoded.isAuthenticate == true) {
			   		req.payload = decoded;    
			   		next();
			    } else {
			       	var msg = "Không thể xác thực user";
			      	return res.json({ success: 'fail', onErr: { errType: 7, message: msg }});
		    	}
		  	}
		});
	}
}
   	router.post('/login', myApiController.loginPost); //done
   	// router.post('logout', myApiController.logoutPost);
   	// device
 	router.get('/device/list', chkToken, myApiController.getAllDevice);
 	router.get('/device/list/:DevEUI', myApiController.GetDeviceInfo);
 	router.post('/device/edit', myApiController.updateDeviceInfo); 
 	// customer
   	router.post('/customer/register', genAutoNumber.getNextSequenceValueForCustomer, myApiController.register); // done
   	router.get('/customer/active/:customer/:code', myApiController.activeCustomer); // done
 	router.get('/customer/profile', chkToken, myApiController.getCustomerProfile); // done
 	router.post('/customer/profile/edit', chkToken, myApiController.updateCustomerProfile); // done
 	router.get('/customer/location/list', chkToken, myApiController.listCustomerLocation); // done
 	router.post('/customer/location/create', chkToken, myApiController.createCustomerLocation); // done
 	router.post('/customer/location/phone/add', chkToken, myApiController.addPhoneToLocation) // do

 	// router.post('/customer/attach/', myApiController.attachDevice); // attach device vao kh
 	// router.post('/customer/detach/', myApiController.detachDevice); // attach device vao kh

module.exports = router;