var express = require('express');
var router = express.Router();
// Require our controllers
var deviceModelController = require('../controllers/deviceModelController');

router.get('/list', deviceModelController.deviceModelList);
router.get('/create', deviceModelController.deviceModelCreateGet);
router.post('/create',  deviceModelController.deviceModelCreatePost);
router.get('/edit/:model', deviceModelController.deviceModelEditGet);
router.post('/edit', deviceModelController.deviceModelEditPost);
router.get('/delete/:model', deviceModelController.deviceModelDeleteGet);
module.exports = router;

