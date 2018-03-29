var express = require('express');
var router = express.Router();

// Require our controllers
var deviceController = require('../controllers/deviceController');

router.get('/list', deviceController.deviceList);
router.get('/create', deviceController.deviceCreateGet);
router.post('/create', deviceController.deviceCreatePost);
router.get('/edit/:devEUI', deviceController.deviceEditGet);
router.post('/edit', deviceController.deviceEditPost);
router.get('/restore', deviceController.deviceRestoreList);
router.get('/restore/:devEUI', deviceController.deviceRestoreGet);
router.get('/delete/:devEUI', deviceController.deviceDeleteGet);
module.exports = router;

