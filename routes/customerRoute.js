var express = require('express');
var router = express.Router();
var passport = require('passport');
var counterModel = require('../models/counterModel');
var genAutoNumber = require('../helper/genAutoNumber');
// Require our controllers
var customerController = require('../controllers/customerController');

router.get('/list', customerController.customerList);
router.get('/detail/:username', customerController.customerDetail);
router.get('/create', customerController.customerCreateGet);
router.post('/create',  genAutoNumber.getNextSequenceValueForCustomer, customerController.customerCreatePost);
router.get('/active/:username/:code', customerController.customerActiveGet);
router.get('/edit/:customer', customerController.customerEditGet);
router.post('/edit',customerController.customerEditPost);
router.get('/delete/:customer', customerController.customerDeleteGet);
router.get('/:customer/location/create/', customerController.customerLocationGet);
router.post('/location/create/', customerController.customerLocationPost);
router.get('/restore', customerController.customerRestoreList);
router.get('/restore/:customer', customerController.customerRestoreGet);
router.get('/attach/:username', customerController.customerAttachGet);
router.post('/attach',customerController.customerAttachPost);
router.get('/attach/:username/list', customerController.customerAttachList);
router.get('/detach/:username&:DevEUI', customerController.customerDetach);
module.exports = router;
