var sanodesModel = require('../models/sanodesModel');
var customerModel = require('../models/customerModel');
var bcrypt = require('bcrypt-nodejs');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var jwt = require('jsonwebtoken');
// temporaly use defaul cus1 on all api for testing
const tempUser = 'cus1';
    // function help check password
    var isValidPassword = function(customer, password){
      return bcrypt.compareSync(password, customer.password);
    }
    // Function for checking if the object is empty or not (empty = true)
    function isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    // done // doc
    module.exports.loginPost = [
        sanitizeBody('customer').trim().escape(),
        sanitizeBody('password').trim().escape(),

        body('customer').isLength({ min: 1 }).withMessage('Email/Phone không được để trống'),
        body('password').isLength({ min: 1 }).withMessage("password không được để trống"),
        
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request api loginPost in myApiController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, message: errorLog }});
            } else {
                customerModel.findOne(
                    {
                        isActive: true,
                        isDelete: false,
                        isBlock: false,
                        $or: [
                            { email: req.body.customer },
                            { phone: req.body.customer }
                        ]
                    },
                    function(err, customer){
                        if (err) { 
                            res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                        } else {
                            if (isEmpty(customer)) {
                                var msg = "Email/Phone không tồn tại";
                                res.json({ status: 'fail', onErr: { errType: 4, message: msg }});
                            } else {
                                if (!isValidPassword(customer, req.body.password)){
                                    var msg = "Mật khẩu bạn nhập không chính xác"
                                    res.json({ status: 'fail', onErr: { errType: 4, message: msg }});
                                } else {
                                    const payload = {
                                    };
                                    var now = Date.now();
                                    payload.isAuthenticate = true;
                                    if (customer.email != '' && customer.email != undefined) {
                                        payload.email = customer.email;
                                    } else {
                                        payload.email = '';
                                    }
                                    if (customer.phone != '' && customer.phone != undefined) {
                                        payload.phone = customer.phone;
                                    } else {
                                        payload.phone = '';
                                    }
                                    customerModel.update(
                                        {
                                            isActive: true,
                                            isDelete: false,
                                            isBlock: false,
                                            $or: [
                                                { email: req.body.customer },
                                                { phone: req.body.customer }
                                            ]
                                        },
                                        { lastLoginTime: now },
                                        function (err, raw) {
                                            if (err) {
                                                res.json({ status: 'fail', onErr: { errType: 2, message: err }})
                                            } else {
                                                var token = jwt.sign(payload, 'mySecret');
                                                res.json({ status: 'success', token: token });
                                            }
                                        }
                                    );
                                    
                                }
                            }
                        }
                    }
                )
            }
        }
    ]

    module.exports.getAllDevice = function(req, res) {
        console.log('TRACE | Request api getAllDevice in myApiController from ' + req.headers.host);
        console.log(req.decoded);
        customerModel.find(
            { 
                username: tempUser
                /*username lay tu payload cua jwt*/ 
            },
            'attachDevice',
            function(err, customer){
                if (err) { 
                    res.json({ status: 'fail', onErr: { reason: "Database error", message: err }});
                } else {
                    res.json({ status: 'success', data: customer });
                }
            }
        )
    }
    
    module.exports.GetDeviceInfo = function(req, res) {
        console.log('TRACE | Request api GetDeviceInfo in myApiController from ' + req.headers.host);
        var specificDevEUI = ( req.params.DevEUI || '' );
        customerModel.find(
            { 
                /*username lay tu payload cua jwt*/
                username: tempUser, 
                'attachDevice.DevEUI': specificDevEUI
            },
            'attachDevice',
            function(err, customer){
                if (err) { 
                    res.json({ status: 'fail', onErr: { reason: "Database error", message: err }});
                } else {
                    if (isEmpty(customer)) {
                        var msg = "You don't own this device";
                        res.json({ status: 'fail', onErr: { reason: "Ownership", message: msg }});
                    } else {
                        sanodesModel.find(
                            { DevEUI: req.params.DevEUI },
                            'brandname model address updateTime',
                            function(err, device) {
                                if (err) { 
                                    res.json({ status: 'fail', onErr: { reason: "Database error", message: err }});
                                } else {
                                    res.json({ status: 'success', data: device });
                                }
                            }
                        )
                    }
                }
            }
        )
    }

    module.exports.updateDeviceInfo = [
        sanitizeBody('DevEUI').trim().escape(),
        sanitizeBody('address').trim().escape(),

        body('DevEUI').isLength({ min: 1 }).withMessage('DevEUI không được để trống'),
        body('address').isLength({ min: 1 }).withMessage("address không được để trống"),
        
        function(req, res, next) {
            console.log('TRACE | Request api updateDeviceInfo in myApiController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { reason: "Fail to pass filter string", message: errorLog }});
            } else {
                customerModel.find(
                    { 
                        /*username lay tu payload cua jwt*/ 
                        username : tempUser,
                        'attachDevice.DevEUI': req.body.DevEUI
                    },
                    'attachDevice',
                    function(err, customer){
                        if (err) { 
                            res.json({ status: 'fail', onErr: { reason: "Database error", message: err }});
                        } else {
                            if (isEmpty(customer)) {
                                var msg = "You don't own this device";
                                res.json({ status: 'fail', onErr: { reason: "Ownership", message: msg }});
                            } else {
                                sanodesModel.update(
                                    { DevEUI: req.body.DevEUI },
                                    {
                                        address: req.body.address,
                                        updateBy: tempUser/* username lấy từ payload của jwt*/,
                                        updateTime: Date.now()
                                    },
                                    function(err, raw) {
                                        if (err) { 
                                            res.json({ status: 'fail', onErr: { reason: "Database error", message: err }});
                                        } else {
                                            res.json({ status: 'success' });
                                        }
                                    }
                                )
                            }
                        }
                    }
                )
            }
        }
    ]
    // done // doc
    module.exports.register = [
        sanitizeBody('email').trim().escape(),
        sanitizeBody('password').trim().escape(),
        sanitizeBody('phone').trim().escape(),

        body('password').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('email').custom((val , { req }) => {
            // nếu kh không điền phone
            if (req.body.phone == '' || req.body.phone == undefined) {
                // nếu email rỗng
                if (val == '') {
                    return false;
                }
                // nếu email k được gửi đi
                if (val == undefined) {
                    return false;
                }
            }
            return true;
        }).withMessage('Email không được để trống'),
        body('phone').custom((val , { req }) => {
            // nếu kh không điền email
            if (req.body.email == '' || req.body.email == undefined) {
                // nếu email rỗng
                if (val == '') {
                    return false;
                }
                // nếu email k được gửi đi
                if (val == undefined) {
                    return false;
                }
            }
            return true;
        }).withMessage('phone không được để trống'),
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request api registerWithPhone in myApiController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            var activeCode = (Math.floor(100000 + Math.random() * 900000)).toString();
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, message: errorLog }});
            } else {
                // nếu kh gửi email
                if (req.body.email != '' && req.body.email != undefined) {
                    customerModel.find(
                        { 
                            email : req.body.email,
                        },
                        function(err, customer){
                            if (err) { 
                                res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                            } else {
                                if (!isEmpty(customer)) {
                                    var msg = "Email này đã được sử dụng";
                                    res.json({ status: 'fail', onErr: { errType: 3, message: msg }});
                                } else {
                                    var Customer = new customerModel({
                                        _id: req.id, // lấy từ middel ware phía trước
                                        email: req.body.email,
                                        password: req.body.password,
                                        createBy: 'System',
                                        activeCode: activeCode,
                                    });
                                    Customer.save(function(err) {
                                        if (err) {
                                            res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                                        } else {
                                            res.json({ status: 'success', activeCode: activeCode});
                                        }
                                    });
                                }
                            }
                        }
                    )
                // nếu kh k gửi email (tưc là gửi phone)
                } else {
                    customerModel.find(
                        { 
                            phone : req.body.phone,
                        },
                        function(err, customer){
                            if (err) { 
                                res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                            } else {
                                if (!isEmpty(customer)) {
                                    var msg = "SĐT này đã được sử dụng";
                                    res.json({ status: 'fail', onErr: { errType: 3, message: msg }});
                                } else {
                                    var Customer = new customerModel({ 
                                        _id: req.id, // lấy từ middel ware phía trước
                                        phone: req.body.phone,
                                        password: req.body.password,
                                        createBy: 'System',
                                        activeCode: activeCode,
                                    });
                                    Customer.save(function(err) {
                                        if (err) {
                                            res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                                        } else {
                                            res.json({ status: 'success', activeCode: activeCode});
                                        }
                                    });
                                }
                            }
                        }
                    )
                }      
            }
        }
    ]
    // done // doc
    module.exports.activeCustomer = function(req, res) {
        console.log(Date());
        console.log('TRACE | Request api activeCustomer in myApiController from ' + req.headers.host);
        customerModel.findOne(
            { 
                activeCode: req.params.code,
                $or: [
                        { email: req.params.customer },
                        { phone: req.params.customer }
                    ]
            },
            function(err, customer){
                if (err) { 
                    res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                } else {
                    if (!isEmpty(customer)) {
                        customerModel.update(
                            {
                                activeCode: req.params.code,
                                $or: [
                                    { email: req.params.customer },
                                    { phone: req.params.customer }
                                ]
                            }, 
                            { 
                                isActive: true,
                                updateBy: 'System'
                            }, 
                            function(err) {
                                if (err) {
                                    res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                                } else {
                                    res.json({ status: 'success' });
                                }
                            }
                        );
                    } else {
                        var msg = "Email/Phone không đúng với active code"
                        res.json({ status: 'fail', onErr: { errType: 4, message: msg }});
                    }
                }
            }
        )
    }
    // done // doc
    module.exports.getCustomerProfile = function(req, res) {
        console.log(Date());
        console.log('TRACE | Request api getCustomerProfile in myApiController from ' + req.headers.host);
        // nếu trong chuỗi token có emaill
        if (req.payload.email != '' && req.payload.email != undefined) {
            customerModel.find(
                {
                    email: req.payload.email
                },
                {
                    firstName: 1,
                    lastName: 1,
                    _id: 0
                },
                function(err, customers){
                    if (err) {
                        res.json({ status: 'fail', onErr: { reason: 'Database gặp lỗi', message: err }});
                    } else {
                        if(isEmpty(customers)) {
                            var msg = "Không tìm thấy thông tin của khách hàng tương ứng";
                            res.json({ status: 'fail', onErr: { reason: 'Câu lệnh query sai', message: msg }});
                        } else {
                            res.json({ status: 'success', customers: customers });
                        }
                    }
                }
            );
        // nếu trong chuỗi token không có email
        } else {
            // nếu trong chuỗi token có phone
            if (req.payload.phone != '' && req.payload.phone != undefined) {
                customerModel.findOne(
                    {
                        phone: req.payload.phone
                    },
                    {
                        firstName: 1,
                        lastName: 1,
                        _id: 0
                    },
                    function(err, customers){
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                        } else {
                            if(isEmpty(customers)) {
                                var msg = "Không tìm thấy thông tin của khách hàng";
                                res.json({ status: 'fail', onErr: { errType: 4, message: msg }});
                            } else {
                                res.json({ status: 'success', customers: customers });
                            }
                        }
                    }
                );
            // nếu trong chuỗi token k có phone
            } else {
                var msg = "Không tìm thấy email/phone trong chuỗi token";
                res.json({ status: 'fail', onErr: { errType: 7, message: msg }})
            }
        }
    }
    // done // doc
    module.exports.updateCustomerProfile = [
        // lọc khoảng trắng thừa ở hai phía và bỏ 1 số ký tự đặc biệt (%,&,!,*,..)
        sanitizeBody('firstName').trim().escape(),
        sanitizeBody('lastName').trim().escape(),
        // handle request
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request api updateCustomerProfile in myApiController from ' + req.headers.host);
            if (req.body.firstName == undefined) {
                firstName = '';
            } else {
                firstName = req.body.firstName;
            }
            if (req.body.lastName == undefined) {
                lastName = '';
            } else {
                lastName = req.body.lastName;
            }
            // nếu trong chuỗi token có emaill
            if (req.payload.email != '' && req.payload.email != undefined) {
                customerModel.findOneAndUpdate(
                    { email: req.payload.email },
                    { 
                        firstName: firstName,
                        lastName: lastName,
                        updateBy: 'System',
                        updateTime: Date.now()
                    },
                    { 
                        new: true,
                        fields: { lastName: 1, firstName: 1, _id: 0 }
                    },
                    function(err, customer) {
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                        } else {
                            if (isEmpty(customer)) {
                                var msg = "Không tìm thấy Email/Phone trong database";
                                res.json({ status: 'fail', onErr: { errType: 4, message: msg }});
                            } else {
                                res.json({ status: 'success', customer: customer });
                            }
                        }
                    }
                );
            // nếu trong chuỗi token không có email
            } else {
                customerModel.findOneAndUpdate(
                    { phone: req.payload.phone },
                    { 
                        firstName: firstName,
                        lastName: lastName,
                        updateBy: 'System',
                        updateTime: Date.now()
                    },
                    { 
                        new: true,
                        fields: { lastName: 1, firstName: 1, _id: 0 }
                    },
                    function(err, customer) {
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                        } else {
                            if (isEmpty(customer)) {
                                var msg = "Không tìm thấy Email/Phone trong database";
                                res.json({ status: 'fail', onErr: { errType: 4, message: msg }});
                            } else {
                                res.json({ status: 'success', customer: customer });
                            }
                        }
                    }
                );
            }
        }
    ]
    // done // doc
    module.exports.createCustomerLocation = [
        // làm sạch dữ liệu
        sanitizeBody('name').trim().escape(),
        sanitizeBody('number').trim().escape(),
        sanitizeBody('street').trim().escape(),
        sanitizeBody('ward').trim().escape(),
        sanitizeBody('district').trim().escape(),
        sanitizeBody('city').trim().escape(),
        sanitizeBody('province').trim().escape(),
        sanitizeBody('country').trim().escape(),
        // check dữ liệu
        body('name').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('number').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('street').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('ward').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('district').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('city').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('country').isLength({ min: 1 }).withMessage("password không được để trống"),
        // xử lý request
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request api createCustomerLocation in myApiController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, message: errorLog }});
            } else {
                // nếu trong chuỗi token có emaill
                if (req.payload.email != '' && req.payload.email != undefined) {
                    customerModel.findOne(
                        {
                            email: req.payload.email,
                            "location.name": req.body.name
                        },
                        function(err, customer){
                            if (err) {
                                res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                            } else {
                                if(!isEmpty(customer)) {
                                    var msg = "Tên địa điểm này đã tồn tại";
                                    res.json({ status: 'fail', onErr: { errType: 3, message: msg }});
                                } else {
                                    if (req.body.province == undefined) {
                                        province = '';
                                    } else {
                                        province = req.body.province;
                                    }
                                    customerModel.update(
                                        {
                                            email: req.payload.email
                                        },
                                        {
                                            $push: { 
                                                location: { 
                                                    name: req.body.name,
                                                    address: {
                                                        number: req.body.number,
                                                        street: req.body.street,
                                                        ward: req.body.ward,
                                                        district: req.body.district,
                                                        city: req.body.city,
                                                        province: province,
                                                        country: req.body.country,
                                                    }
                                                } 
                                            },
                                            updateTime: Date.now(),
                                            updateBy: 'System'
                                        },
                                        function(err, raw) {
                                            if (err) {
                                                res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                                            } else {
                                                res.json({ status: 'success' });
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                // nếu trong chuỗi token không có email
                } else {
                    // nếu trong chuỗi token có phone
                    if (req.payload.phone != '' && req.payload.phone != undefined) {
                        customerModel.find(
                            {
                                email: req.payload.email,
                                "location.name": req.body.name
                            },
                            function(err, customer){
                                if (err) {
                                    res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                                } else {
                                    if(!isEmpty(customer)) {
                                        var msg = "Tên địa điểm này đã tồn tại";
                                        res.json({ status: 'fail', onErr: { errType: 3, message: msg }});
                                    } else {
                                        if (req.body.province == undefined) {
                                            province = '';
                                        } else {
                                            province = req.body.province;
                                        }
                                        customerModel.update(
                                            {
                                                email: req.payload.email
                                            },
                                            {
                                                $push: { 
                                                    location: { 
                                                        name: req.body.name,
                                                        address: {
                                                            number: req.body.number,
                                                            street: req.body.street,
                                                            ward: req.body.ward,
                                                            district: req.body.district,
                                                            city: req.body.city,
                                                            province: province,
                                                            country: req.body.country,
                                                        }
                                                    } 
                                                },
                                                updateTime: Date.now(),
                                                updateBy: 'System'
                                            },
                                            function(err) {
                                                if (err) {
                                                    res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                                                } else {
                                                    res.json({ status: 'success' });
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        );
                    // nếu trong chuỗi token k có phone
                    } else {
                        var msg = "Không tìm thấy email/phone trong chuỗi token";
                        res.json({ status: 'fail', onErr: { errType: 7, message: msg }})
                    }
                }    
            }
        }
    ]
    // done // doc
    module.exports.listCustomerLocation = function(req, res) {
        console.log(Date());
        console.log('TRACE | Request api listCustomerLocation in myApiController from ' + req.headers.host);
        // nếu trong chuỗi token có emaill
        if (req.payload.email != '' && req.payload.email != undefined) {
            customerModel.findOne(
                {
                    email: req.payload.email
                },
                {
                    location: 1,
                    _id: 0,
                },
                function(err, customer){
                    if (err) {
                        res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                    } else {
                        if(isEmpty(customer)) {
                            var msg = "Không tìm thấy thông tin của khách hàng";
                            res.json({ status: 'fail', onErr: { errType: 4, message: msg }});
                        } else {
                            res.json({ status: 'success', location: customer.location });
                        }
                    }
                }
            );
        // nếu trong chuỗi token không có email
        } else {
            // nếu trong chuỗi token có phone
            if (req.payload.phone != '' && req.payload.phone != undefined) {
                customerModel.findOne(
                    {
                        phone: req.payload.phone
                    },
                    {
                    location: 1,
                    _id: 0
                    },
                    function(err, customer){
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, message: err }});
                        } else {
                            if(isEmpty(customer)) {
                                var msg = "Không tìm thấy thông tin của khách hàng tương ứng";
                                res.json({ status: 'fail', onErr: { errType: 4, message: msg }});
                            } else {
                                res.json({ status: 'success', location: customer.location });
                            }
                        }
                    }
                );
            // nếu trong chuỗi token k có phone
            } else {
                var msg = "Không tìm thấy email/phone trong chuỗi token";
                res.json({ status: 'fail', onErr: { errType: 7, message: msg }})
            }
        }
    }
    //do
    module.exports.addPhoneToLocation = [
        // làm sạch dữ liệu
        sanitizeBody('name').trim().escape(),
        sanitizeBody('phone').trim().escape(),
        // check dữ liệu
        body('name').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('phone').isLength({ min: 1 }).withMessage("password không được để trống"),
        // xử lý request
        function(req, res, next) {
            console.log(Date());
            console.log('TRACE | Request api addPhoneToLocation in myApiController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { reason: "Dữ liệu không hợp lệ", message: errorLog }});
            } else {
                // nếu trong chuỗi token có emaill
                if (req.payload.email != '' && req.payload.email != undefined) {
                    customerModel.findOne(
                        {
                            email: req.payload.email,
                            "location.name": req.body.name,
                            "location.phone": req.body.phone
                        },
                        function(err, customer){
                            console.log(customer);
                            if (err) {
                                res.json({ status: 'fail', onErr: { reason: 'Database gặp lỗi', message: err }});
                            } else {
                                if(!isEmpty(customer)) {
                                    var msg = "Số điện thoại này đã được add vào địa điểm này trước đó";
                                    res.json({ status: 'fail', onErr: { reason: 'Dữ liệu bị trùng', message: msg }});
                                } else {
                                    customerModel.update(
                                        {
                                            email: req.payload.email,
                                            "location.name": req.body.name,
                                            "location.phone": req.body.phone
                                        },
                                        {
                                            // $set: { 
                                            //     "location.$.phone": req.body.phone
                                            // },
                                            updateTime: Date.now(),
                                            updateBy: 'System'
                                        },
                                        function(err, raw) {
                                            if (err) {
                                                res.json({ status: 'fail', onErr: { reason: 'Database gặp lỗi', message: err }});
                                            } else {
                                                if (raw.nModified == 1) {
                                                    res.json({ status: 'success', dbResponse: raw });
                                                } else {
                                                    var msg = "Câu lệnh query có vấn đề";
                                                    res.json({ status: 'fail', onErr: { reason: 'Câu lệnh query sai', message: msg, dbResponse: raw }})
                                                }
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                // nếu trong chuỗi token không có email
                } else {
                    // nếu trong chuỗi token có phone
                    if (req.payload.phone != '' && req.payload.phone != undefined) {
                        customerModel.find(
                            {
                                email: req.payload.email,
                                "location.name": req.body.name
                            },
                            function(err, customer){
                                if (err) {
                                    res.json({ status: 'fail', onErr: { reason: 'Database gặp lỗi', message: err }});
                                } else {
                                    if(!isEmpty(customer)) {
                                        var msg = "Tên địa điểm này đã tồn tại";
                                        res.json({ status: 'fail', onErr: { reason: 'Dữ liệu bị trùng', message: msg }});
                                    } else {
                                        if (req.body.province == undefined) {
                                            province = '';
                                        } else {
                                            province = req.body.province;
                                        }
                                        customerModel.update(
                                            {
                                                email: req.payload.email
                                            },
                                            {
                                                $push: { 
                                                    location: { 
                                                        name: req.body.name,
                                                        address: {
                                                            number: req.body.number,
                                                            street: req.body.street,
                                                            ward: req.body.ward,
                                                            district: req.body.district,
                                                            city: req.body.city,
                                                            province: province,
                                                            country: req.body.country,
                                                        }
                                                    } 
                                                },
                                                updateTime: Date.now(),
                                                updateBy: 'System'
                                            },
                                            function(err, raw) {
                                                if (err) {
                                                    res.json({ status: 'fail', onErr: { reason: 'Database gặp lỗi', message: err }});
                                                } else {
                                                    if (raw.nModified == 1) {
                                                        res.json({ status: 'success', dbResponse: raw });
                                                    } else {
                                                        var msg = "Câu lệnh query có vấn đề";
                                                        res.json({ status: 'fail', onErr: { reason: 'Câu lệnh query sai', message: msg, dbResponse: raw }})
                                                    }
                                                }
                                            }
                                        );
                                    }
                                }
                            }
                        );
                    // nếu trong chuỗi token k có phone
                    } else {
                        var msg = "Không tìm thấy email/phone trong chuỗi token";
                        res.json({ status: 'fail', onErr: { reason: 'Thiếu thông tin', message: msg }})
                    }
                }    
            }
        }
    ]