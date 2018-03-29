var express = require('express'),
   	router = express.Router(),
   	apiController = require('../controllers/apiController');

   	router.post('/sa', apiController.sa);
	router.get('/devices', apiController.getDevices);
   	router.get('/device/:device_eui/status', apiController.getDeviceStatus);
   	router.get('/device/:device_eui/alarms', apiController.getDeviceAlarms);
   	router.get('/device/:device_eui/events', apiController.getDeviceEvents);


module.exports = router;








   
