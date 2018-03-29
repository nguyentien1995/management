var customerModel = require('../models/customerModel');
var sanodesModel = require('../models/sanodesModel');
var genAutoNumber = require('../helper/genAutoNumber');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var async = require('async');
    // function get next autoIncrement number
    var nextId;

    // Function for checking if the object is empty or not (empty = true)
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    module.exports.customerList = function(req, res, next) {
        console.log('TRACE | Request customerList in customerController from ' + req.headers.host);
        // nextId = genAutoNumber.getNextSequenceValue;
        // myId = nextId('customers');
        // console.log(myId);
        console.log(req.id); 
        customerModel.find({ isDelete: false }, 
            function(err, customers) {
                if (err) {
                    res.render('template/customer/customer_list', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    res.render('template/customer/customer_list', { status: 'success', customers: customers });
            }
        });

    };
    module.exports.customerDetail = function(req, res, next) {
        console.log('TRACE | Request customerDetail in customerController from ' + req.headers.host);
        customerModel.find({ username: req.params.username}, function(err, customer) {
            if (err) {
                res.render('template/customer/customer_detail', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
            } else {

                res.render('template/customer/customer_detail', { status: 'success', customer: customer });
            }
        });
    };
    module.exports.customerCreateGet = function(req, res, next) {
        console.log('TRACE | Request customerCreateGet in customerController from ' + req.headers.host);
        res.render('template/customer/customer_create', {});
    };
    module.exports.customerCreatePost = [
        // drop extra space on left, right and escape some html entities
        sanitizeBody('firstName').trim().escape(),
        sanitizeBody('lastName').trim().escape(),
        sanitizeBody('password').trim().escape(),
        sanitizeBody('email').trim().escape(),
        sanitizeBody('phone').trim().escape(),
        // check params requirement
        body('firstName').isLength({ min: 1 }).withMessage('firstName không được để trống'),
        body('lastName').isLength({ min: 1 }).withMessage("lastName không được để trống"),
        body('password').isLength({ min: 1 }).withMessage('password không được để trống'),
        body('email').custom((val , { req }) => {
            // nếu kh không điền phone -> email sẽ k được rỗng
            if (req.body.phone == '') {
                if (val.length < 1 ) { 
                    return false; 
                } else {
                    return true;
                }  
            } else {
                return true;
            }
        }).withMessage('DevEUI không được để trống'),
        body('phone').custom((val , { req }) => {
            // nếu kh k điền email -> phone k được rỗng
            if (req.body.email != '') {
                if (val.length < 1 ) { 
                    return false; 
                } else {
                    return true;
                }  
            } else {
                return true;
            }
        }).withMessage('DevEUI không được để trống'),
        // doing things we supposed to do
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request customerCreatePost in customerController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            // get a random number of 6 digit without leading by zero
            var activeCode = (Math.floor(100000 + Math.random() * 900000)).toString();
            // Params is not meet requirement 
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, reason: "Dữ liệu không hợp lệ", message: errorLog }});
            // Params meet requirement 
            } else {
                customerModel.find(
                    {
                        $or: [
                            { email: req.body.email },
                            { phone: req.body.phone }
                        ]
                    },
                    function(err, customer) {
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gpặ lỗi", message: err }});
                        } else {
                            if (!isEmpty(customer)) {
                                res.json({ status: 'fail', onErr: { errType: 3, reason: "Dữ liệu bị trùng", message: "Email/phone này đã tồn tại" }});
                            } else {
                                // nên xử lý dữ liệu trước khi đưa vào model
                                // Có thể có trường hợp kh chỉ cung cấp sđt hoặc email.
                                // tạm thời mặc định là tài khoản đã kích hoạt, cần gửi mail hoặc tin nhắn về cho kh để nhập mã kích hoạt
                                var Customer = new customerModel({ 
                                        _id: req.id,
                                        firstName: req.body.firstName,
                                        lastName: req.body.lastName,
                                        password: req.body.password,
                                        phone: req.body.phone,
                                        email: req.body.email,
                                        isActive: true,
                                        createBy: req.user.username,
                                        createTime: Date.now(),
                                        activeCode: activeCode
                                    });
                                Customer.save(function(err, raw) {
                                    if (err) {
                                        res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
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
    ];

    module.exports.customerActiveGet = function(req, res, next) {
        console.log('TRACE | Request customerActiveGet in customerController from ' + req.headers.host);
        customerModel.find({ username: req.params.username, activeCode: req.params.code},
            'username',
            function(err, customer) {
                if (err) {
                    res.render('template/customer/customer_active', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    var Customer = new customerModel({ 
                            status: 'Enable',
                            updateBy: req.user.username,
                            updateTime: Date.now()
                        });
                    Customer.save(function(err, raw) {
                        if (err) {
                            res.render('template/customer/customer_active', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                        } else {
                            res.render('template/customer/customer_active', { status: 'success', customer: customer});
                        }
                    });
                }
            }
        );
    };

    module.exports.customerEditGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request customerEditGet in customerController from ' + req.headers.host);
        customerModel.find(
            { $or: [
                    { email: req.params.customer },
                    { phone: req.params.customer }
                ]
            }, 
            function(err, customer){
                if (err) { 
                    res.render('template/customer/customer_edit', { status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                } else {
                    res.render('template/customer/customer_edit', { status: 'success', customer: customer });
                }
            }
        )
    };
    module.exports.customerEditPost = [
        // drop extra space on left, right and escape some html entities
        sanitizeBody('firstName').trim().escape(),
        sanitizeBody('lastName').trim().escape(),
        sanitizeBody('email').trim().escape(),
        sanitizeBody('phone').trim().escape(),
        // check params requirement
        body('firstName').isLength({ min: 1 }).withMessage('firstName không được để trống'),
        body('lastName').isLength({ min: 1 }).withMessage("lastName không được để trống"),
        body('email').custom((val , { req }) => {
            // nếu kh không điền phone -> email sẽ k được rỗng
            if (req.body.phone == '') {
                if (val.length < 1 ) { 
                    return false; 
                } else {
                    return true;
                }  
            } else {
                return true;
            }
        }).withMessage('email không được để trống'),
        body('phone').custom((val , { req }) => {
            // nếu kh k điền email -> phone k được rỗng
            if (req.body.email != '') {
                if (val.length < 1 ) { 
                    return false; 
                } else {
                    return true;
                }  
            } else {
                return true;
            }
        }).withMessage('phone không được để trống'),
        // doing things we supposed to do
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request customerEditPost in customerController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            // Params is not meet requirement 
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, reason: "Dữ liệu không hợp lệ", message: errorLog }});
            // Params meet requirement 
            } else {
                customerModel.find(
                    {
                        $or: [
                            { email: req.body.email },
                            { phone: req.body.phone }
                        ]
                    },
                    function(err, customer) {
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                        } else {
                            if (!isEmpty(customer)) {
                                customerModel.update(
                                    {
                                        $or: [
                                            { email: req.body.email },
                                            { phone: req.body.phone }
                                        ]
                                    }, 
                                    { 
                                        firstName: req.body.firstName, 
                                        lastName: req.body.lastName,
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
                            } else {
                                res.json({ status: 'fail', onErr: { errType: 4, reason: "Dữ liệu không hợp lệ", message: "Email/phone này không tồn tại" }});
                            }
                        }
                    }
                );
            }
        }
    ];
    module.exports.customerLocationGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request customerLocationGet in customerController from ' + req.headers.host);
        customerModel.find(
            { $or: [
                    { email: req.params.customer },
                    { phone: req.params.customer }
                ]
            }, 
            function(err, customer){
                if (err) { 
                    res.render('template/customer/customer_location_create', { status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                } else {
                    res.render('template/customer/customer_location_create', { status: 'success', customer: customer });
                }
            }
        )
    };
    module.exports.customerLocationPost = [
        // drop extra space on left, right and escape some html entities
        // sanitizeBody('email').trim().escape(),
        // sanitizeBody('phone').trim().escape(),
        // check params requirement
        // body('firstName').isLength({ min: 1 }).withMessage('firstName không được để trống'),
        // body('lastName').isLength({ min: 1 }).withMessage("lastName không được để trống"),
        // body('password').isLength({ min: 1 }).withMessage('password không được để trống'),
        // doing things we supposed to do
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request customerLocationPost in customerController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            // get a random number of 6 digit without leading by zero
            var activeCode = (Math.floor(100000 + Math.random() * 900000)).toString();
            // Params is not meet requirement 
            // if (!errors.isEmpty()) {
            //     res.json({ status: 'fail', onErr: { errType: 1, reason: "Dữ liệu không hợp lệ", message: errorLog }});
            // // Params meet requirement 
            // } else {
                customerModel.find(
                    {
                        $or: [
                            { email: req.body.customer },
                            { phone: req.body.customer }
                        ]
                    },
                    function(err, customer) {
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                        } else {
                            if (!isEmpty(customer)) {
                                // nên xử lý dữ liệu trước khi đưa vào model
                                // Có thể có trường hợp kh chỉ cung cấp sđt hoặc email.
                                // tạm thời mặc định là tài khoản đã kích hoạt, cần gửi mail hoặc tin nhắn về cho kh để nhập mã kích hoạt
                                var Customer = new customerModel({ 
                                        _id: req.id,
                                        firstName: req.body.firstName,
                                        lastName: req.body.lastName,
                                        password: req.body.password,
                                        phone: req.body.phone,
                                        email: req.body.email,
                                        isActive: true,
                                        createBy: req.user.username,
                                        createTime: Date.now(),
                                        activeCode: activeCode
                                    });
                                Customer.save(function(err, raw) {
                                    if (err) {
                                        res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                                    } else {
                                        res.json({ status: 'success', dbRespone: raw});
                                    }
                                });
                            } else {
                                res.json({ status: 'fail', onErr: { errType: 4, reason: "customer không tồn tại", message: "Email/phone này đã tồn tại" }});

                            }
                        }
                    }
                );
            // }
        }
    ];
    module.exports.customerDeleteGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request customerDeleteGet in customerController from ' + req.headers.host);
        customerModel.update(
            {
                $or: [
                    { email: req.params.customer },
                    { phone: req.params.customer }
                ]
            }, 
            { 
                isDelete: true,
                updateBy: req.user.username,
                updateTime: Date.now()
            }, 
            function(err, raw) {
                if (err) {
                    res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                } else {
                    res.json({ status: 'success', dbRespone: raw});
                }
            }
        );
    };
    module.exports.customerAttachList = function(req, res, next) {
        console.log('TRACE | Request customerAttachList in customerController from ' + req.headers.host);
        customerModel.find({ username: req.params.username },
            'username attachDevice',
            function(err, customer) {
                if (err) {
                    res.render('template/customer/customer_attach_list', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    console.log(customer);
                    res.render('template/customer/customer_attach_list', { status: 'success', customer: customer});
                }
            }
        ); 
    };
    module.exports.customerAttachGet = function(req, res, next) {
        console.log('TRACE | Request customerAttachGet in customerController from ' + req.headers.host);
        customerModel.find({ username: req.params.username },
            'username',
            function(err, customer) {
                if (err) {
                    res.render('template/customer/customer_attach', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    res.render('template/customer/customer_attach', { status: 'success', customer: customer });
                }
            }
        ); 
    };
    module.exports.customerAttachPost = [
        // drop extra space on left, right and escape some html entities
        sanitizeBody('username').trim().escape(),
        sanitizeBody('DevEUI').trim().escape(),
        // check params requirement
        body('username').isLength({ min: 1 }).withMessage('username không được để trống'),
        body('DevEUI').isLength({ min: 1 }).withMessage('DevEUI không được để trống'),
        // doing things we supposed to do
        function(req, res, next) {                  
            console.log('TRACE | Request customerAttachPost in customerController from ' + req.headers.host);
            var time = Date.now();
            customerModel.update(
                {
                    username: req.body.username,
                }, 
                {
                    $push: { 
                        attachDevice: { 
                            DevEUI: req.body.DevEUI,
                            attachTime: time 
                        }
                    },
                    updateBy: req.user.username,
                    updateTime: time
                }, 
                function(err, raw) {
                    if (err) {
                        console.log(err);
                        res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                    } else {
                        res.json({ status: 'success', dbRespone: raw});
                    }
                }
            );
        }
    ];
    module.exports.customerDetach = function(req, res, next) {
        console.log('TRACE | Request customerDetach in customerController from ' + req.headers.host);
        customerModel.update(
            {
                username: req.params.username
            }, 
            {
                $pull: {
                    attachDevice: {
                        DevEUI: req.params.DevEUI,
                    },
                },
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
    module.exports.customerRestoreList = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request customerRestoreList in customerController from ' + req.headers.host);
        customerModel.find(
            { isDelete: true }, 
            function(err, customers) {
                if (err) {
                    res.render('template/customer/customer_restore', { status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                } else {
                    res.render('template/customer/customer_restore', { status: 'success', customers: customers });
            }
        });
    };
    module.exports.customerRestoreGet = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request customerRestoreGet in customerController from ' + req.headers.host);
        customerModel.update(
            {
                $or: [
                    { email: req.params.customer },
                    { phone: req.params.customer }
                ]
            }, 
            { 
                isDelete: false,
                updateBy: req.user.username,
                updateTime: Date.now()
            }, 
            function(err, raw) {
                if (err) {
                    res.json({ status: 'fail', onErr: { errType: 2, reason: "Database gặp lỗi", message: err }});
                } else {
                    res.json({ status: 'success', dbRespone: raw});
                }
            }
        );
    };
    // callback long, neu can ca data tu nhieu model khac
    //
    // module.exports.customer_attach_get = function(req, res, next) {
    //     Customer.find({_id: req.params.id}, function(err, customer) {
    //         if (err) return done(err);
    //         Device.find({}, function(err, device) {
    //             if (err) return done(err);
    //             res.render('template/customer/customer_attach', {customer: customer, device: device});
    //         }); 
    //     }); 
    // };