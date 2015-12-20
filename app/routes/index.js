'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/server/clickHandler.js');



module.exports = function (app, passport)
{
	// MAIN PAGE
	app.get('/',function (req, res) {
			res.sendFile(path + '/public/index.html');
	});

	// LOGIN PAGE
	app.get('/login',function(req,res)
	{
		res.sendFile(path + '/public/index.html');	
	});
	app.post('/login',passport.authenticate('local-login',{
		successRedirect : '/profile',
		failureRedirect : '/login/',
		failureFlash    : true
	}));
	


	// SIGN UP PAGE
	app.get('/signup',function(req,res)
	{
		res.sendFile(path + '/public/index.html');
	});
	app.post('/signup',	passport.authenticate('local-signup',
	{
		successRedirect : '/profile',
		failureRedirect : '/signup/',
		failureFlash    : true
	}));
	

	// PROFILE or jahan votes bananay hain
	app.get('/profile',function(req,res)
	{
			res.sendFile(path + '/public/index.html');
	});
	
	
	//TWITTER ROUTES
	app.get('/auth/twitter',passport.authenticate('twitter'));
	
	app.get('/auth/twitter/callback',
		passport.authenticate('twitter',{
			successRedirect:'/profile',
			failureRedirect:'/'
		}));

	
	// Logout
	app.get('/logout',function(req,res)
	{
		req.logout();
		req.redirect('/');
	});
	
	function isLoggedIn(req,res,next)
	{
		
		if(req.isAuthenticated())
			return next();
		res.redirect('/');
	}
	
	
	
	//authorization & linking.
    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

	
	// unlinking stuff.
	    app.get('/unlink/local', function(req, res) {
        	var user            = req.user;
        	user.local.email    = undefined;
        	user.local.password = undefined;
        	user.save(function(err) {
        	    res.redirect('/profile');
    	    });
	    });
	        // twitter --------------------------------
    	app.get('/unlink/twitter', function(req, res) {
        	var user           = req.user;
        	user.twitter.token = undefined;
    	    user.save(function(err) {
    	       res.redirect('/profile');
	      });
    	});

};
