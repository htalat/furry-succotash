var LocalStrategy = require('passport-local').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var path = process.cwd();
var User = require(path + '/app/models/users.js');
var configAuth = require('./auth');


module.exports = function(passport){
    
     // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
        function(req, email, password, done) {
    
            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function() {
    
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({ 'local.email' :  email }, function(err, user) 
                {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);
        
                    // check to see if theres already a user with that email
                    if (user) 
                    {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } 
                    else 
                    {
        
                        // if there is no user with that email
                        // create the user
                        var newUser  = new User();
                        // set the user's local credentials
                        newUser.local.email    = email;
                        newUser.local.password = newUser.generateHash(password);
                        // save the user
                        newUser.save(function(err) 
                        {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
        
                });    
    
            });
    
        }));
    
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
    function(req, email, password, done) {
            // callback with email and password from our form
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);
    
                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
    
                // if the user is found but the password is wrong
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
    
                // all is well, return successful user
                return done(null, user);
            });

    }));
    
    
    passport.use(new TwitterStrategy({

        consumerKey     : configAuth.twitterAuth.consumerKey,
        consumerSecret  : configAuth.twitterAuth.consumerSecret,
        callbackURL     : configAuth.twitterAuth.callbackURL,
        passReqToCallback: true

    },
        function(req,token,refreshToken, profile, done) {
            
            process.nextTick(function() 
            {
                
            if(!req.user)
            {    
                User.findOne({ 'twitter.id' : profile.id }, function(err, user) {

                    if (err)
                        return done(err);
    
                    // if the user is found then log them in
                    if (user) 
                    {
                        if(!user.twitter.token)
                        {
                            user.twitter.token = token;
                            user.twitter.username = profile.username;
                            user.twitter.displayName = profile.displayName;
                        }
                        
                        return done(null, user); // user found, return that user
                    } 
                    else
                    {
                        // if there is no user, create them
                        var newUser                 = new User();
                        // set all of the user data that we need
                        newUser.twitter.id          = profile.id;
                        newUser.twitter.token       = token;
                        newUser.twitter.username    = profile.username;
                        newUser.twitter.displayName = profile.displayName;
    
                        // save our user into the database
                        newUser.save(function(err) 
                        {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            }
            else
            {
                var user = req.user;
                
                user.twitter.id = profile.id;
                user.twitter.token = token;
                user.twitter.username = profile.username;
                user.twitter.displayName = profile.displayName;
                user.sace(function(err)
                {
                    if(err)
                        throw err;
                    return done(null,user);
                });
                
            }
        });
    }));
    
}