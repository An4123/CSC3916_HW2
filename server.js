/*
Name: An Vo
File: server.js
Class: CSC3916
Description: Web API scaffolding for movie API 
Homework 2
*/

var express = require('express');
var http = require('http');
var bodyParser = require("body-parser");
var passport = require('passport');
db = require('./db')();                 // hack to get the actual object back
var jwt = require('jsonwebtoken');
var cors = require('cors');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req, stats, msg ){
    var json = {
        status: "Null",
        headers: "No headers", 
        env: process.env.UNIQUE_KEY,
        body: "No body",
        message: "No message",
        query: "No query"
    };
    if (msg != null){                // set message as message that was passed in a parameter
        json.message = msg
    }
    if (req.query != null){          // set query as query that was in the req parameter     
        json.query = req.query
    }
    if (stats != null){              // set status code as status code that was passed in parameter  
        json.status = stats
    }
    if (req.body != null){           // set body as body that was in the req parameter
        json.body = req.body;
    }
    if(req.headers != null){          // set headers as headers that was in the req parameter
        json.headers = req.headers;
    }
    return json;                      // return json object
}



router.post('/signup', function (req, res){
    if (!req.body.username || !req.body.password){
        res.json({success: false, msg: 'please include both username and password to sign up'})
    }   else{
        var newUser = {                                     // set newUser.username and newUser.password 
            username: req.body.username,                    // set to req.body.username
            password: req.body.password                     // set to req.body.password
        };

        db.save(newUser);                                   // save to fake database for now

        res.json({success: true, msg: 'Successfully created new user'})         // send json response
    }
});


router.post('/signin', function(req, res){
    var user = db.findOne(req.body.username)                  // find user name in data base
    if (!user){                                               // if there is no user name then 
        res.status(401).send({success: false, msg: "Authentication failed. User not found"});     // then authentication has failed and send response with that message
    } else{
        if(req.body.password === user.password){             // else if a user has been found, then check if the password is correct
            var userToken = {   
                            id: user.id,                     // set the userToken.id to user.id
                            username: user.username          // set the userToken.username to user.username
                            };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);                // create a token
            res.json({success: true, token: 'JWT ' + token});                       // respond with that token
        } else{
            res.status(401).send({success: false, msg: "Authentication failed."});  // else if the password doesnt match then authentication failed.
        }
    }
});



router.route('/movie')
    .delete(authController.isAuthenticated, function (req,res){                 // use BasicAuth to authenticate user
        if (req.get("Content-Type")) {                                          // set the response "content-type" to the request "content type"
            res = res.type(req.get('Content-Type'));
        }
        var status = 200;                                                       // if authenticated then set status to 200
        var o = getJSONObjectForMovieRequirement(req, status, "Movie Deleted"); // set header, status and message using function getJSONObjectForMovieRequirement
        res.json(o);                                                            // respond with the json format of 'o'
        }
    )


    .put(authJwtController.isAuthenticated, function (req,res){                 // use JwtAuthorization to authenticate user
        if (req.get("Content-Type")) {                                          // set the response "content-type" to the request "content type"
            res = res.type(req.get('Content-Type'));
        }
        var status = 200;
        var o = getJSONObjectForMovieRequirement(req, status, "Movie Updated"); // set header, status and message using function getJSONObjectForMovieRequirement
        res.json(o);                                                            // respond with the json format of 'o'
        }
    )


    .post( function (req,res){
            if (req.get("Content-Type")) {                                        // set the response "content-type" to the request "content type"
                res = res.type(req.get('Content-Type'));
            }
            var status = 200;                                                     // if request is successful then set status to 200
            var o = getJSONObjectForMovieRequirement(req, status, "Movie Saved"); // set header, status and message using function getJSONObjectForMovieRequirement
            res.json(o);                                                          // respond with the json format of 'o
        }
    )


    .get( function (req,res){
        if (req.get("Content-Type")) {                                          // set the response "content-type" to the request "content type"
            res = res.type(req.get('Content-Type'));
        }
        var status = 200;                                                       // if authenticated then set status to 200
        var o = getJSONObjectForMovieRequirement(req, status, "GET movie");     // set header, status and message using function getJSONObjectForMovieRequirement
        res.json(o);                                                            // respond with the json format of 'o
    }
)


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.export = app;