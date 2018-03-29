var Models = require('../models/indexModel');
var request = require('request');
var async = require('async');
var bodyParser = require('body-parser');
var passport = require('passport');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
    
    // Function for checking if the object is empty or not (empty = true)
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    // Get the list of all device with no restrict or condition
    module.exports.getAllDevice = function(req, res) {
        console.log('TRACE | Request api getAllDevice in apiBackEndController from ' + req.headers.host);
        Models.sanodes.find(
            {}, 
            function(err, devices){
                if (err) { 
                    res.json({ status: 'fail', onErr: { reason: "Database error", message: err }});
                } else {
                    res.json({ status: 'success', devices: devices });
                }
            }
        )
    }
    // Creating a new device if DevEUI haven't existed in database
    module.exports.createDevice = [
    	sanitizeBody('DevEUI').trim().escape(),
        sanitizeBody('brandname').trim().escape(),
        sanitizeBody('model').trim().escape(),
        sanitizeBody('AppEUI').trim().escape(),
        sanitizeBody('AppKey').trim().escape(),
        sanitizeBody('address').trim().escape(),
        sanitizeBody('phone').trim().escape(),
        sanitizeBody('user').trim().escape(),

        body('DevEUI').isLength({ min: 1 }).withMessage('DevEUI không được để trống'),
        body('brandname').isLength({ min: 1 }).withMessage("brandname không được để trống"),
        body('model').isLength({ min: 1 }).withMessage('Tên model không được để trống'),
        body('AppEUI').isLength({ min: 1 }).withMessage("AppEUI không được để trống"),
        body('AppKey').isLength({ min: 1 }).withMessage('AppKey không được để trống'),
        body('address').isLength({ min: 1 }).withMessage("address không được để trống"),
        body('phone').isLength({ min: 10 }).withMessage('Số điện thoại tối thiểu là 10 chữ số'),
        body('user').isLength({ min: 1 }).withMessage("User không được để trống"),
        body('user').isNumeric().withMessage("User chỉ được điền số"),
        
        function(req, res, next) {
			console.log('TRACE | Request api createDevice in apiBackEndController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            var status;
            if (!errors.isEmpty()) {
                status = 'fail';
                res.json({ status: status, onErr: { errType: 1, reason: "Fail to pass filter string", message: errorLog }});
            } else {
                Models.sanodes.find(
                    {
                        DevEUI: req.body.DevEUI
                    },
                    function(err, device) {
                        if (err) {
                            status = 'fail';
                            res.json({ status: status, onErr: { errType: 2, reason: "Database error", message: err }});
                        } else {
                            if (!isEmpty(device)) {
                                status = 'fail';
                                res.json({ status: status, onErr: { errType: 3, reason: "Item existed", message: "DevEUI have already existed" }});
                            } else {
                                var Sanode = new Models.sanodes({ 
                                    DevEUI: req.body.DevEUI,
                                    brandname: req.body.brandname,
                                    model: req.body.model,
                                    AppEUI: req.body.AppEUI,
                                    AppKey: req.body.AppKey,
                                    address: req.body.address,
                                    phone: req.body.phone,
                                    user: req.body.user
                                    });
                                Sanode.save(function(err, raw) {
                                    if (err) {
                                        status = 'fail'
                                        res.json({ status: status, onErr: { errType: 2, reason: "Database error", message: err }});
                                    } else {
                                        status = 'success';
                                        res.json({ status: status, dbRespone: raw});
                                    }
                                });
                            }
                        }
                    }
                );
            }
        }
    ]
    // Get information of device which is being edited
    module.exports.getDeviceByDevEUIForEdit = function(req, res) {
		console.log('TRACE | Request api getDeviceByDevEUIForEdit in apiBackEndController from ' + req.headers.host);
		var status;
        Models.sanodes.find(
			{DevEUI: req.params.DevEUI}, 
			function(err, device){
				if (err) { 
                    status = 'fail';
                    res.json({ status: status, onErr: { reason: "Database error", message: err }});
				} else {
                    status = 'success';
					res.json({ status: status, device: device });
				}
			}
		)
    }
    // Update device information if DevEUI is not repeat
    module.exports.updateDeviceById = [ 
        sanitizeBody('newDevEUI').trim().escape(),
        sanitizeBody('oldDevEUI').trim().escape(),
        sanitizeBody('brandname').trim().escape(),
        sanitizeBody('model').trim().escape(),
        sanitizeBody('AppEUI').trim().escape(),
        sanitizeBody('AppKey').trim().escape(),
        sanitizeBody('address').trim().escape(),
        sanitizeBody('phone').trim().escape(),
        sanitizeBody('user').trim().escape(),

        body('newDevEUI').trim().isLength({ min: 1 }).withMessage('DevEUI không được để trống'),
        body('oldDevEUI').trim().isLength({ min: 1 }).withMessage('DevEUI không được để trống'),
        body('brandname').trim().isLength({ min: 1 }).withMessage("brandname không được để trống"),
        body('model').trim().isLength({ min: 1 }).withMessage('Tên model không được để trống'),
        body('AppEUI').trim().isLength({ min: 1 }).withMessage("AppEUI không được để trống"),
        body('AppKey').trim().isLength({ min: 1 }).withMessage('AppKey không được để trống'),
        body('address').trim().isLength({ min: 1 }).withMessage("address không được để trống"),
        body('phone').trim().isLength({ min: 10 }).withMessage('Số điện thoại tối thiểu là 10 chữ số'),
        body('user').trim().isLength({ min: 1 }).withMessage("User không được để trống"),
        body('user').trim().isNumeric().withMessage("User chỉ được điền số"),

        function(req, res, next) {
			console.log('TRACE | Request api updateDeviceById in apiBackEndController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            var jsonString = JSON.stringify(errorLog);
            var onErr = {reason: "none", message: "none"};
            var status;
            if (!errors.isEmpty()) {
            	status = 'fail';
            	res.send({ status: status, onErr: { reason: "Fail to pass filter string", message: errorLog }});
            } else {
                if (req.body.newDevEUI != req.body.oldDevEUI) {
                    Models.sanodes.find(
                        {
                            DevEUI: req.body.newDevEUI
                        },
                        function(err, device) {
                            if (err) {
                                status = 'fail';
                                res.json({ status: status, onErr: { reason: "Database error", message: err }});
                            } else {
                                if (!isEmpty(device)) {
                                    res.json({ status: status, onErr: { reason: "Item existed", message: "DevEUI have already existed" }});
                                } else {
                                    Models.sanodes.update(
                                        {
                                            DevEUI: req.body.oldDevEUI,
                                        }, 
                                        {
                                            DevEUI: req.body.newDevEUI, 
                                            brandname: req.body.brandname,
                                            model: req.body.model,
                                            AppEUI: req.body.AppEUI,
                                            AppKey: req.body.AppKey,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            user: req.body.user
                                        }, 
                                        function(err, raw) {
                                            if (err) {
                                                status = 'fail'
                                                res.json({ status: status, onErr: { reason: "Database error", message: err }});
                                            } else {
                                                status = 'success';
                                                res.json({ status: status, dbRespone: raw});
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                } else {
                    Models.sanodes.update(
                        {
                            DevEUI: req.body.oldDevEUI,
                        }, 
                        { 
                            brandname: req.body.brandname,
                            model: req.body.model,
                            AppEUI: req.body.AppEUI,
                            AppKey: req.body.AppKey,
                            address: req.body.address,
                            phone: req.body.phone,
                            user: req.body.user
                        }, 
                        function(err, raw) {
                            if (err) {
                                status = 'fail'
                                res.json({ status: status, onErr: { reason: "Database error", message: err }});
                            } else {
                                status = 'success';
                                res.json({ status: status, dbRespone: raw});
                            }
                        }
                    );
                }
            }
        }
    ]
    // delete device from database
    module.exports.deleteDeviceByDevEUI = function(req, res, next) {
        console.log('TRACE | Request api deleteDeviceByDevEUI in apiBackEndController from ' + req.headers.host);
        var status;
        Models.sanodes.remove({DevEUI: req.params.DevEUI}, function (err, raw) {
            if (err) {
                status = 'fail';
                res.json({ status: status, onErr: { reason: "Database error", message: err }});
            } else {
                status = 'success';
                res.json({ status: status, dbRespone: raw});
            } 
        })
    }
    // Creating a new account if username haven't existed in database
    module.exports.createAccount = [
        sanitizeBody('username').trim().escape(),
        sanitizeBody('password').trim().escape(),
        sanitizeBody('role').trim().escape(),

        body('username').isLength({ min: 1 }).withMessage('username không được để trống'),
        body('password').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('role').isLength({ min: 1 }).withMessage('role không được để trống'),
        
        function(req, res, next) {
            console.log('TRACE | Request api createAccount in apiBackEndController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            var status;
            if (!errors.isEmpty()) {
                status = 'fail';
                res.json({ status: status, onErr: { reason: "Fail to pass filter string", message: errorLog }});
            } else {
                Models.accounts.find(
                    {
                        username: req.body.username
                    },
                    function(err, account) {
                        if (err) {
                            status = 'fail';
                            res.json({ status: status, onErr: { reason: "Database error", message: err }});
                        } else {
                            if (!isEmpty(account)) {
                                res.json({ status: status, onErr: { reason: "Item existed", message: "username have already existed" }});
                            } else {
                                var Account = new Models.accounts({ 
                                    username: req.body.username,
                                    password: req.body.password,
                                    role: req.body.role
                                    });
                                Account.save(function(err, raw) {
                                    if (err) {
                                        status = 'fail';
                                        res.json({ status: status, onErr: { reason: "Database error", message: err }});
                                    } else {
                                        status = 'success';
                                        res.json({ status: status, dbRespone: raw});
                                    }
                                });
                            }
                        }
                    }
                );
            }
        }
    ]
    // Get the list of all account with no restrict or condition
    module.exports.getAllAccount = function(req, res) {
        console.log('TRACE | Request api getAllAccount in apiBackEndController from ' + req.headers.host);
        var status;
        Models.accounts.find(
            { username: { $ne: 'Root'} }, 
            function(err, accounts){
                if (err) { 
                    status = 'fail';
                    console.log(err);
                    res.json({ status: status, onErr: { reason: "Database error", message: err }});
                } else {
                    status = 'success';
                    res.json({ status: status, accounts: accounts });
                }
            }
        )
    }
    // Get information of account which is being edited
    module.exports.getAccountByUsernameForEdit = function(req, res) {
        console.log('TRACE | Request api getAccountByUsernameForEdit in apiBackEndController from ' + req.headers.host);
        var status;
        Models.accounts.find(
            {username: req.params.username}, 
            function(err, account){
                if (err) { 
                    status = 'fail';
                    res.json({ status: status, onErr: { reason: "Database error", message: err }});
                } else {
                    status = 'success';
                    res.json({ status: status, account: account });
                }
            }
        )
    }
    // Update account information if DevEUI is not repeat
    module.exports.updateAccountById = [ 
        sanitizeBody('newDevEUI').trim().escape(),
        sanitizeBody('oldDevEUI').trim().escape(),
        sanitizeBody('brandname').trim().escape(),
        sanitizeBody('model').trim().escape(),
        sanitizeBody('AppEUI').trim().escape(),
        sanitizeBody('AppKey').trim().escape(),
        sanitizeBody('address').trim().escape(),
        sanitizeBody('phone').trim().escape(),
        sanitizeBody('user').trim().escape(),

        body('newDevEUI').trim().isLength({ min: 1 }).withMessage('DevEUI không được để trống'),
        body('oldDevEUI').trim().isLength({ min: 1 }).withMessage('DevEUI không được để trống'),
        body('brandname').trim().isLength({ min: 1 }).withMessage("brandname không được để trống"),
        body('model').trim().isLength({ min: 1 }).withMessage('Tên model không được để trống'),
        body('AppEUI').trim().isLength({ min: 1 }).withMessage("AppEUI không được để trống"),
        body('AppKey').trim().isLength({ min: 1 }).withMessage('AppKey không được để trống'),
        body('address').trim().isLength({ min: 1 }).withMessage("address không được để trống"),
        body('phone').trim().isLength({ min: 10 }).withMessage('Số điện thoại tối thiểu là 10 chữ số'),
        body('user').trim().isLength({ min: 1 }).withMessage("User không được để trống"),
        body('user').trim().isNumeric().withMessage("User chỉ được điền số"),

        function(req, res, next) {
            console.log('TRACE | Request api updateDeviceById in apiBackEndController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            var jsonString = JSON.stringify(errorLog);
            var onErr = {reason: "none", message: "none"};
            var status;
            if (!errors.isEmpty()) {
                status = 'fail';
                res.send({ status: status, onErr: { reason: "Fail to pass filter string", message: errorLog }});
            } else {
                if (req.body.newDevEUI != req.body.oldDevEUI) {
                    Models.sanodes.find(
                        {
                            DevEUI: req.body.newDevEUI
                        },
                        function(err, device) {
                            if (err) {
                                status = 'fail';
                                res.json({ status: status, onErr: { reason: "Database error", message: err }});
                            } else {
                                if (!isEmpty(device)) {
                                    res.json({ status: status, onErr: { reason: "Item existed", message: "DevEUI have already existed" }});
                                } else {
                                    Models.sanodes.update(
                                        {
                                            DevEUI: req.body.oldDevEUI,
                                        }, 
                                        {
                                            DevEUI: req.body.newDevEUI, 
                                            brandname: req.body.brandname,
                                            model: req.body.model,
                                            AppEUI: req.body.AppEUI,
                                            AppKey: req.body.AppKey,
                                            address: req.body.address,
                                            phone: req.body.phone,
                                            user: req.body.user
                                        }, 
                                        function(err, raw) {
                                            if (err) {
                                                status = 'fail'
                                                res.json({ status: status, onErr: { reason: "Database error", message: err }});
                                            } else {
                                                status = 'success';
                                                res.json({ status: status, dbRespone: raw});
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                } else {
                    Models.sanodes.update(
                        {
                            DevEUI: req.body.oldDevEUI,
                        }, 
                        { 
                            brandname: req.body.brandname,
                            model: req.body.model,
                            AppEUI: req.body.AppEUI,
                            AppKey: req.body.AppKey,
                            address: req.body.address,
                            phone: req.body.phone,
                            user: req.body.user
                        }, 
                        function(err, raw) {
                            if (err) {
                                status = 'fail'
                                res.json({ status: status, onErr: { reason: "Database error", message: err }});
                            } else {
                                status = 'success';
                                res.json({ status: status, dbRespone: raw});
                            }
                        }
                    );
                }
            }
        }
    ]
    // delete account from database
    module.exports.deleteAccountByDevEUI = function(req, res, next) {
        console.log('TRACE | Request api deleteAccountByDevEUI in apiBackEndController from ' + req.headers.host);
        var status;
        Models.accounts.remove({username: req.params.username}, function (err, raw) {
            if (err) {
                status = 'fail';
                res.json({ status: status, onErr: { reason: "Database error", message: err }});
            } else {
                status = 'success';
                res.json({ status: status, dbRespone: raw});
            } 
        })
    }
