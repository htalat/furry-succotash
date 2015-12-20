'use strict'

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');


var users = mongoose.Schema({
    
    local : {
        email : String,
        password : String
    },
    twitter : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    
});


users.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
users.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('users',users);