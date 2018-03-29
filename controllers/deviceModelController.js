var sanodesModelDetail = require('../models/sanodesModelDetailModel');
var async = require('async');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
    // Function for checking if the object is empty or not (empty = true)
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    module.exports.deviceModelList = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request deviceList in deviceController from ' + req.headers.host);
        sanodesModelDetail.find(
            {}, 
            function(err, deviceModels){
                if (err) { 
                    res.render('template/deviceModel/deviceModel_list', { status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                } else {
                    res.render('template/deviceModel/deviceModel_list', { status: 'success', deviceModels: deviceModels });
                }
            }
        )
    }

    module.exports.deviceModelCreateGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request deviceModelCreateGet in deviceModelController from ' + req.headers.host);
        res.render('template/deviceModel/deviceModel_create');
    }
    module.exports.deviceModelCreatePost = [

        // drop extra space on left, right of params and escape some html entities
        sanitizeBody('brandname').trim().escape(),
        sanitizeBody('model').trim().escape(),
        sanitizeBody('firmwareVersion').trim().escape(),
        sanitizeBody('description').trim().escape(),
        // requirement for params
        body('brandname').isLength({ min: 1 }).withMessage("brandname không được để trống"),
        body('model').isLength({ min: 1 }).withMessage('Tên model không được để trống'),
        body('firmwareVersion').isLength({ min: 1 }).withMessage("Phiên bản của phần mềm không được để trống"),
        // doing things we supposed to do
        function(req, res, next) {
        	console.log(Date());
            console.log('TRACE | Request deviceModelCreatePost in deviceModelController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            // Params is not meet requirement
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, reason: "Dữ liệu đầu vào không hợp lệ", message: errorLog }});
            // Params meet requirement
            } else {
                sanodesModelDetail.find(
                    {
                        model: req.body.model
                    },
                    function(err, deviceModel) {
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                        } else {
                            if (!isEmpty(deviceModel)) {
                                res.json({ status: 'fail', onErr: { errType: 3, reason: "Dữ liệu bị trùng", message: "Mẫu này đã tồn tại" }});
                            } else {
                                var SanodeModel = new sanodesModelDetail({
                                    brandname: req.body.brandname,
                                    model: req.body.model,
                                    firmwareVersion: req.body.firmwareVersion,
                                    description: req.body.description
                                });
                                SanodeModel.save(function(err) {
                                    if (err) {
                                        res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                                    } else {
                                        res.json({ status: 'success' });
                                    }
                                });
                            }
                        }
                    }
                );
            }
        }
    ]
    module.exports.deviceModelEditGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request deviceModelEditGet in deviceModelController from ' + req.headers.host);
        sanodesModelDetail.find(
            { model: req.params.model }, 
            function(err, deviceModel){
                if (err) { 
                    res.render('template/deviceModel/deviceModel_edit', { status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                } else {
                    res.render('template/deviceModel/deviceModel_edit', { status: 'success', deviceModel: deviceModel });
                }
            }
        )
    }
    module.exports.deviceModelEditPost = [
        // drop extra space on left, right of params and escape some html entities
        sanitizeBody('brandname').trim().escape(),
        sanitizeBody('oldModel').trim().escape(),
        sanitizeBody('newModel').trim().escape(),
        sanitizeBody('firmwareVersion').trim().escape(),
        sanitizeBody('description').trim().escape(),

        // requirement for params
        body('newModel').trim().isLength({ min: 1 }).withMessage('newModel không được để trống'),
        body('oldModel').trim().isLength({ min: 1 }).withMessage('oldModel không được để trống'),
        body('brandname').trim().isLength({ min: 1 }).withMessage("brandname không được để trống"),
        body('firmwareVersion').trim().isLength({ min: 1 }).withMessage('Phiên bản của phần mềm không được để trống'),
        body('description').trim().isLength({ min: 1 }).withMessage("description không được để trống"),
        
        // doing things we supposed to do
        function(req, res, next) {
        	console.log(Date());
            console.log('TRACE | Request deviceModelEditPost in deviceModelController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            // Params is not meet requirement 
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, reason: "Dữ liệu đầu vào không hợp lệ", message: errorLog }});
            // Params meet requirement 
            } else {
                // User want to change DevEUI
                if (req.body.newModel != req.body.oldModel) {
                    sanodesModelDetail.find(
                        {
                            model: req.body.newModel
                        },
                        function(err, device) {
                            if (err) {
                                res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                            } else {
                                if (!isEmpty(device)) {
                                    res.json({ status: 'fail', onErr: { errType: 3, reason: "Dữ liệu bị trùng", message: "Tên mẫu này đã tồn tại" }});
                                } else {
                                    sanodesModelDetail.update(
                                        {
                                            model: req.body.oldModel,
                                        }, 
                                        {
                                            brandname: req.body.brandname,
                                            model: req.body.newModel,
                                            firmwareVersion: req.body.firmwareVersion,
                                            description: req.body.description,
                                        }, 
                                        function(err) {
                                            if (err) {
                                                res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                                            } else {
                                                res.json({ status: 'success' });
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                // User don't want to change DevEUI
                } else {
                    sanodesModelDetail.update(
                        {
                            model: req.body.oldModel,
                        }, 
                        { 
                            brandname: req.body.brandname,
                            firmwareVersion: req.body.firmwareVersion,
                            description: req.body.description,
                        }, 
                        function(err, raw) {
                            if (err) {
                                res.json({ status: 'fail', onErr: { reason: "Database error", message: err }});
                            } else {
                                res.json({ status: 'success' });
                            }
                        }
                    );
                }
            }
        }
    ]
    module.exports.deviceModelDeleteGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request deviceModelDeleteGet in deviceModelController from ' + req.headers.host);
        sanodesModelDetail.update(
            { model: req.params.model },
            { isDelete: true },
            function (err, raw) {
            if (err) {
                res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
            } else {
                res.json({ status: 'success' });
            } 
        })
    }
    