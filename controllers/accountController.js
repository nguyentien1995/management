var accountModel = require('../models/accountModel');
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
    module.exports.accountList = function(req, res, next) {
        console.log(Date());
        console.log('TRACE | Request accountList in accountController from ' + req.headers.host);
        var role;
        var query;
        role = req.user.role;
        if(role == 'Root') {
            query = ['Root'];
        } else if (role == 'Super Admin') {
            query = ['Root', 'Super Admin'];
        } else if (role == 'Database Admin') {
            query = ['Root', 'Super Admin', 'Database Admin'];
        }
        accountModel.find(
            { role: { $nin: query }}, 
            function(err, accounts){
                if (err) { 
                    res.render('template/account/account_list', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    res.render('template/account/account_list', { status: 'success', accounts: accounts });
                }
            }
        )
    }
    module.exports.accountCreateGet = function(req, res, next) {
        console.log('TRACE | Request accountCreateGet in accountController from ' + req.headers.host);
        res.render('template/account/account_create');
    }
    module.exports.accountCreatePost = [
        // drop extra space on left, right and escape some html entities
        sanitizeBody('username').trim().escape(),
        sanitizeBody('password').trim().escape(),
        sanitizeBody('role').trim().escape(),
        // check params requirement
        body('username').isLength({ min: 1 }).withMessage('username không được để trống'),
        body('password').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('role').isLength({ min: 1 }).withMessage('role không được để trống'),
        // doing things we supposed to do
        function(req, res, next) {
            console.log('TRACE | Request accountCreatePost in accountController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            // Params is not meet requirement 
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, reason: "Fail to pass filter string", message: errorLog }});
            // Params meet requirement 
            } else {
                accountModel.find(
                    {
                        username: req.body.username
                    },
                    function(err, account) {
                        if (err) {
                            res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                        } else {
                            if (!isEmpty(account)) {
                                res.json({ status: 'fail', onErr: { errType: 3, reason: "Item existed", message: "username have already existed" }});
                            } else {
                                var Account = new accountModel({ 
                                    username: req.body.username,
                                    password: req.body.password,
                                    role: req.body.role,
                                    isDelete: false,
                                    createBy: req.user.username,
                                    createTime: Date.now(),
                                    });
                                Account.save(function(err, raw) {
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
    module.exports.accountEditGet = function(req, res, next) {
        console.log('TRACE | Request accountEditGet in accountController from ' + req.headers.host);
        accountModel.find(
            { username: req.params.username }, 
            function(err, account){
                if (err) { 
                    res.render('template/account/account_edit', { status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    res.render('template/account/account_edit', { status: 'success', account: account });
                }
            }
        )
    }
    module.exports.accountEditPost = [ 
        // drop extra space on left, right and escape some html entities
        sanitizeBody('newUsername').trim().escape(),
        sanitizeBody('oldUsername').trim().escape(),
        sanitizeBody('role').trim().escape(),
        // check params requirement
        body('newUsername').isLength({ min: 1 }).withMessage('username không được để trống'),
        body('oldUsername').isLength({ min: 1 }).withMessage("password không được để trống"),
        body('role').isLength({ min: 1 }).withMessage('role không được để trống'),
        // doing things we supposed to do
        function(req, res, next) {
            console.log('TRACE | Request accountEditPost in accountController from ' + req.headers.host);
            const errors = validationResult(req);
            var errorLog = errors.array();
            // Params is not meet requirement 
            if (!errors.isEmpty()) {
                res.json({ status: 'fail', onErr: { errType: 1, reason: "Fail to pass filter string", message: errorLog }});
            // Params meet requirement 
            } else {
                // User want to change username
                if (req.body.newUsername != req.body.oldUsername) {
                    accountModel.find(
                        {
                            username: req.body.newUsername
                        },
                        function(err, account) {
                            console.log("searching");
                            if (err) {
                                res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                            } else {
                                if (!isEmpty(account)) {
                                    console.log("orr here?");

                                    res.json({ status: 'fail', onErr: { errType: 3, reason: "Item existed", message: "username have already existed" }});
                                } else {
                                    console.log("go to here?");
                                    accountModel.update(
                                        {
                                            username: req.body.newUsername,
                                        }, 
                                        {
                                            username: req.body.newUsername,
                                            role: req.body.role,
                                            updateBy: req.user.username,
                                            updateTime: Date.now(),
                                        }, 
                                        function(err, raw) {
                                            if (err) {
                                                res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                                            } else {
                                                res.json({ status: 'success', dbRespone: raw});
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    );
                // User don't want to change username
                } else {
                    accountModel.update(
                        {
                            username: req.body.oldUsername
                        }, 
                        { 
                            role: req.body.role,
                            updateBy: req.user.username,
                            updateTime: Date.now(),
                        }, 
                        function(err, raw) {
                            if (err) {
                                res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                            } else {
                                res.json({ status: 'success', dbRespone: raw});
                            }
                        }
                    );
                }
            }
        }
    ]
    module.exports.accountDeleteGet = function(req, res, next) {
        console.log('TRACE | Request accountDeleteGet in accountController from ' + req.headers.host);
        accountModel.update(
            {
                username: req.params.username,
            }, 
            { 
                status: 'Disable',
                updateBy: req.user.username,
                updateTime: Date.now()
            }, 
            function(err, raw) {
                if (err) {
                    res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    console.log(raw);
                    res.json({ status: 'success', dbRespone: raw});
                }
            }
        );
    }
    module.exports.accountActiveGet = function(req, res, next) {
        console.log('TRACE | Request accountActiveGet in accountController from ' + req.headers.host);
        accountModel.update(
            {
                username: req.params.username,
            }, 
            { 
                status: 'Enable',
                updateBy: req.user.username,
                updateTime: Date.now()
            }, 
            function(err, raw) {
                if (err) {
                    res.json({ status: 'fail', onErr: { errType: 2, reason: "Database error", message: err }});
                } else {
                    console.log(raw);
                    res.json({ status: 'success', dbRespone: raw});
                }
            }
        );
    }