var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engine = require('ejs-locals')
var Database = require('./config/database');
var config = require('./config/config.js');
var app = express();
var passport = require('passport');
var expressSession = require('express-session');
const MongoStore = require('connect-mongo')(expressSession);
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');

app.set('superSecret', config.jwtSecret.secret);
// connect to mongoDb
Database.connect();

// define route
var accountRoute  = require('./routes/accountRoute');
var customerRoute = require('./routes/customerRoute');
var indexRoute = require('./routes/indexRoute');
var deviceRoute = require('./routes/deviceRoute');
var deviceModelRoute = require('./routes/deviceModelRoute');
var apiRoute = require("./routes/apiRoute");
var apiBackEndRoute = require('./routes/apiBackEndRoute');
var myApiRoute = require('./routes/myApiRoute');
// view engine setup
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(expressSession({
    secret: 'mySecretKey',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection }),
    cookie: { path: '/', httpOnly: true, maxAge: 36000000}
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/myPassPort')(passport);
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

// set specific url path for individual route
app.use("/", indexRoute);
app.use('/account', isAuthenticated, accountRoute);
app.use("/api", apiRoute);
app.use('/apiBackEnd', apiBackEndRoute);
app.use('/customer', isAuthenticated, customerRoute);
app.use('/device', isAuthenticated, deviceRoute);
app.use('/deviceModel', isAuthenticated, deviceModelRoute);
// uncomment when ready
// there will be a middle ware in here require for jwt string
// app.use('/myAPI', myMiddleWare, myApiRoute);
app.use('/myApi', myApiRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
