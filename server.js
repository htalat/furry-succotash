var express = require('express'),
    routes = require('./app/routes/index.js'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    session = require('express-session'),
    flash = require('connect-flash');
    
var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect(process.env.MONGO_URI);

app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/public', express.static(process.cwd() + '/public'));



app.use(session({
    secret: 'ArsenalWinsTheChampionsLeague',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

routes(app, passport);

var port = process.env.PORT || 8080;
app.listen(port, function () {
    console.log('Node.js listening on port ' + port + '...');
});
