var express = require('express');
var path = require('path');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require("dotenv")
var cors = require("cors")
dotenv.config()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mailRouter = require("./routes/mail")

var app = express();

app.use(bodyParser.json())
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/mails', mailRouter);


module.exports = app;
