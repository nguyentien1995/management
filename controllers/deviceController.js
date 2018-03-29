var sanodesModel = require('../models/sanodesModel');
var sanodesModelDetail = require('../models/sanodesModelDetailModel');
var bodyParser = require('body-parser');
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

    module.exports.deviceList = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request deviceList in deviceController from ' + req.headers.host);
        sanodesModel.find(
            { isDelete: 'false' },
            { modelId: 1, devEUI: 1, activeStatus: 1, createBy: 1, createTime: 1, updateBy: 1, updateTime: 1 }, 
            function(err, devices){
                if (err) { 
                    res.render('template/device/device_list', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    res.render('template/device/device_list', { status: 'success', devices: devices });
                }
            }
        )
    }

    module.exports.deviceCreateGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request deviceCreateGet in deviceController from ' + req.headers.host);
        sanodesModelDetail.find(
            {},
            { model: 1 },  
            function(err, deviceModels) {
                if (err) {
                    res.render('template/device/device_create', { status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                } else {
                    res.render('template/device/device_create', { status: 'success', deviceModels: deviceModels });
                }
            }
        )
    }

    module.exports.deviceCreatePost = [
        // drop extra space on left, right of params and escape some html entities
        sanitizeBody('devEUI').trim().escape(),
        sanitizeBody('authenMethod').trim().escape(),
        sanitizeBody('model').trim().escape(),
        sanitizeBody('appEUI').trim().escape(),
        sanitizeBody('appKey').trim().escape(),
        sanitizeBody('appSKey').trim().escape(),
        sanitizeBody('netSKey').trim().escape(),
        sanitizeBody('devAddr').trim().escape(),
        sanitizeBody('keepAliveTimeout').trim().escape(),
        sanitizeBody('alarmRepeatTimeout').trim().escape(),
        // requirement for params
        
        /*
         *  Dùng sau
         *  ví dụ: Khi chọn phương thức xác nhận là OTTA thì yêu cầu netSkey k được bỏ trống,
         *  còn nếu chọn ABP thì netSKey có thể được bỏ trống
         *  Ví dụ phía dưới là khi appKey được điền thì devEUI k được bỏ trống, nếu k điền
         *  thì có thể bỏ trống.
         *  Có thể trả về promise nếu muốn, hoặc trả về lỗi của js.
         *
         *       // body('devEUI').custom((val , { req }) => {
         *       //     if (req.body.appKey != '') {
         *       //         if (val.length < 1 ) { 
         *       //             return false; 
         *       //         } else {
         *       //             return true;
         *       //         }  
         *       //     } else {
         *       //         return true;
         *       //     }
         *       // }).withMessage('DevEUI không được để trống'),
         */

        body('devEUI').isLength({ min: 1 }).withMessage("Dev EUI không được để trống"),
        body('authenMethod').isLength({ min: 1 }).withMessage("Authenticate Method không được để trống"),
        body('model').isLength({ min: 1 }).withMessage('Model không được để trống'),
        body('appEUI').isLength({ min: 1 }).withMessage("App EUI không được để trống"),
        body('appKey').isLength({ min: 1 }).withMessage('App Key không được để trống'),
        body('appSKey').isLength({ min: 1 }).withMessage('App Secret Key không được để trống'),
        body('netSKey').isLength({ min: 1 }).withMessage('Network Secret Key không được để trống'),
        body('devAddr').isLength({ min: 1 }).withMessage('Dev Mac Address không được để trống'),
        body('keepAliveTimeout').isLength({ min: 1 }).withMessage('Keep Alive Time không được để trống'),
        body('alarmRepeatTimeout').isLength({ min: 1 }).withMessage('alarmRepeatTimeout không được để trống'),
        // doing things we supposed to do
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request deviceCreatePost in deviceController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            // Params is not meet requirement
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, reason: "Dữ liệu không hợp lệ", message: errorLog }});
            // Params meet requirement
            } else {
                sanodesModel.find(
                    {
                        devEUI: req.body.devEUI
                    },
                    function(err, device) {
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                        } else {
                            if (!isEmpty(device)) {
                                res.json({ status: 'fail', onErr: { errType: 3, reason: "Dữ liệu bị trùng", message: "Dev EUI này đã tồn tại" }});
                            } else {                                
                                var Sanode = new sanodesModel({
                                    devEUI: req.body.devEUI,
                                    modelId: req.body.model,
                                    network: {
                                        authenMethod: req.body.authenMethod,
                                        appEUI: req.body.appEUI,
                                        appKey: req.body.appKey,
                                        netSKey: req.body.netSKey,
                                        devAddr: req.body.devAddr,
                                    },
                                    configuration: {
                                        keepAliveTimeout: req.body.keepAliveTimeout,
                                        alarmRepeatTimeout: req.body.alarmRepeatTimeout,
                                    },
                                    activeStatus: 0,
                                    createBy: req.user.username,
                                    createTime: Date.now(),
                                    });
                                Sanode.save(function(err, raw) {
                                    if (err) {
                                        res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                                    } else {
                                        res.json({ status: 'success', dbRespone: raw});
                                    }
                                });
                            }
                        }
                    }
                );
            }
        }
    ]

    module.exports.deviceEditGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request deviceEditGet in deviceController from ' + req.headers.host);
        sanodesModel.find(
            { devEUI: req.params.devEUI, isDelete: 'false' }, 
            function(err, device){
                if (err) { 
                    res.render('template/device/device_edit', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    sanodesModelDetail.find(
                        {},
                        { model: 1 },  
                        function(err, deviceModels) {
                            if (err) {
                                res.render('template/device/device_edit', { status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                            } else {
                                res.render('template/device/device_edit', { status: 'success', deviceModels: deviceModels, device: device });
                            }
                        }
                    )
                }
            }
        )
    }

    module.exports.deviceEditPost = [
        // drop extra space on left, right of params and escape some html entities
        sanitizeBody('newDevEUI').trim().escape(),
        sanitizeBody('oldDevEUI').trim().escape(),
        sanitizeBody('modelId').trim().escape(),
        sanitizeBody('authenMethod').trim().escape(),
        sanitizeBody('appEUI').trim().escape(),
        sanitizeBody('appKey').trim().escape(),
        sanitizeBody('appSKey').trim().escape(),
        sanitizeBody('netSKey').trim().escape(),
        sanitizeBody('devAddr').trim().escape(),
        sanitizeBody('keepAliveTimeout').trim().escape(),
        sanitizeBody('alarmRepeatTimeout').trim().escape(),
        sanitizeBody('expDate').trim().escape(),

        // requirement for params
        body('newDevEUI').trim().isLength({ min: 1 }).withMessage('DevEUI không được để trống'),
        body('oldDevEUI').trim().isLength({ min: 1 }).withMessage('DevEUI không được để trống'),
        body('modelId').trim().isLength({ min: 1 }).withMessage("Model không được để trống"),
        body('authenMethod').trim().isLength({ min: 1 }).withMessage('Authenticate Method không được để trống'),
        body('appEUI').trim().isLength({ min: 1 }).withMessage("App EUI không được để trống"),
        body('appKey').trim().isLength({ min: 1 }).withMessage('App Key không được để trống'),
        body('appSKey').trim().isLength({ min: 1 }).withMessage("App Secret Key không được để trống"),
        body('netSKey').trim().isLength({ min: 1 }).withMessage('Network Secret Key không được để trống'),
        body('devAddr').trim().isLength({ min: 1 }).withMessage("Device Mac Address không được để trống"),
        body('keepAliveTimeout').trim().isLength({ min: 1 }).withMessage("Keep Alive Time không được để trống"),
        body('alarmRepeatTimeout').trim().isLength({ min: 1 }).withMessage("Alarm Repeat Time không được để trống"),
        body('expDate').trim().isLength({ min: 1 }).withMessage("expDate không được để trống"),

        // doing things we supposed to do
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request deviceEditPost in deviceController from ' + req.headers.host);
            var date = req.body.expDate;
            console.log(date);

            // &#x2F; tương đương với '/'. Nếu định dạng gửi lên là kiểu khác thì cần thay đổi
            var day = date.split('&#x2F;')[0];
            var month = date.split('&#x2F;')[1] - 1;
            var year = date.split('&#x2F;')[2];
            console.log(day)
            console.log(month)
            console.log(year)
            
            var date = new Date(year, month, day);
            console.log(date);
            const errors = validationResult(req);
            var errorLog = errors.array();
            // Params is not meet requirement 
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, reason: "Dữ Liệu không hợp lệ", message: errorLog }});
            // Params meet requirement 
            } else {
                // User want to change DevEUI
                if (req.body.newDevEUI != req.body.oldDevEUI) {
                    sanodesModel.find(
                        {
                            devEUI: req.body.newDevEUI
                        },
                        function(err, device) {
                            if (err) {
                                res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                            } else {
                                if (!isEmpty(device)) {
                                    res.json({ status: 'fail', onErr: { errType: 3, reason: "Dữ liệu bị trùng", message: "DevEUI này đã tồn tại" }});
                                } else {
                                    sanodesModel.update(
                                        {
                                            devEUI: req.body.oldDevEUI,
                                        }, 
                                        {
                                            devEUI: req.body.newDevEUI, 
                                            modelId: req.body.modelId,
                                            network: {
                                                authenMethod: req.body.authenMethod,
                                                appEUI: req.body.appEUI,
                                                appKey: req.body.appKey,
                                                appSKey: req.body.appSKey,
                                                netSKey: req.body.netSKey,
                                                devAddr: req.body.devAddr
                                            },
                                            configuration: {
                                                keepAliveTimeout: req.body.keepAliveTimeout,
                                                alarmRepeatTimeout: req.body.alarmRepeatTimeout
                                            },
                                            expDate: date,
                                            updateTime: Date.now(),
                                            updateBy: req.user.username
                                        }, 
                                        function(err, raw) {
                                            if (err) {
                                                res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                                            } else {
                                                res.json({ status: 'success', dbRespone: raw});
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                // User don't want to change DevEUI
                } else {
                    sanodesModel.update(
                        {
                            devEUI: req.body.oldDevEUI,
                        }, 
                        { 
                            devEUI: req.body.oldDevEUI, 
                            modelId: req.body.modelId,
                            network: {
                                authenMethod: req.body.authenMethod,
                                appEUI: req.body.appEUI,
                                appKey: req.body.appKey,
                                appSKey: req.body.appSKey,
                                netSKey: req.body.netSKey,
                                devAddr: req.body.devAddr
                            },
                            configuration: {
                                keepAliveTimeout: req.body.keepAliveTimeout,
                                alarmRepeatTimeout: req.body.alarmRepeatTimeout
                            },
                            expDate: date,
                            updateTime: Date.now(),
                            updateBy: req.user.username
                        }, 
                        function(err, raw) {
                            if (err) {
                                res.json({ status: 'fail', onErr: { reason: "Database gặp lỗi", message: err }});
                            } else {
                                res.json({ status: 'success', dbRespone: raw});
                            }
                        }
                    );
                }
            }
        }
    ]

    module.exports.deviceDeleteGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request deviceDeleteGet in deviceController from ' + req.headers.host);
        sanodesModel.update(
            { 
                devEUI: req.params.devEUI 
            }, 
            {
                isDelete: 'true',
                updateBy: req.user.username,
                updateTime: Date.now()
            },
            function (err, raw) {
            if (err) {
                res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
            } else {
                res.json({ status: 'success', dbRespone: raw });
            } 
        })
    }
    
    module.exports.deviceRestoreList = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request deviceRestoreList in deviceController from ' + req.headers.host);
        sanodesModel.find(
            { isDelete: true },
            { modelId: 1, devEUI: 1, activeStatus: 1, createBy: 1, createTime: 1, updateBy: 1, updateTime: 1 }, 
            function(err, devices){
                if (err) { 
                    res.render('template/device/device_restore', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    res.render('template/device/device_restore', { status: 'success', devices: devices });
                }
            }
        )
    }
    module.exports.deviceRestoreGet = function(req, res, next) {
        console.log('TRACE | Request deviceRestoreGet in customerController from ' + req.headers.host);
        sanodesModel.update(
            {
                devEUI: req.params.devEUI,
            }, 
            { 
                isDelete: false,
                updateBy: req.user.username,
                updateTime: Date.now()
            }, 
            function(err, raw) {
                if (err) {
                    res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    res.json({ status: 'success', dbRespone: raw});
                }
            }
        );
    };