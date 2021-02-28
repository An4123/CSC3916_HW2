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
    if (msg != null){
        json.message = msg
    }
    if (req.query != null){
        json.query = req.query
    }
    if (stats != null){
        json.status = stats
    }
    if (req.body != null){
        json.body = req.body;
    }
    if(req.headers != null){
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function (req, res){
    if (!req.body.username || !req.body.password){
        res.json({success: false, msg: 'please include both username and password to sign up'})
    }   else{
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };

        db.save(newUser);           // no duplicate checking yet

        res.json({success: true, msg: 'Successfully created new user'})
    }
});


router.post('/signin', function(req, res){
    var user = db.findOne(req.body.username)
    if (!user){
        res.status(401).send({success: false, msg: "Authentication failed. User not found"});
    } else{
        if(req.body.password === user.password){
            var userToken = {
                            id: user.id,
                            username: user.username
                            };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json({success: true, token: 'JWT ' + token});
        } else{
            res.status(401).send({success: false, msg: "Authentication failed."});
        }
    }
});



router.route('/movie')
    .delete(authController.isAuthenticated, function (req,res){
        console.log(req.body);
        var status = 200;
        if (req.get("Content-Type")) {
            res = res.type(req.get('Content-Type'));
        }
        var o = getJSONObjectForMovieRequirement(req, status, "Movie Deleted");
        res.json(o);

    })
    .put(authJwtController.isAuthenticated, function (req,res){
        console.log(req.body);
        res = res.status(200);
        if (req.get("Content-Type")) {
            res = res.type(req.get('Content-Type'));
        }
        var status = 200;
        var o = getJSONObjectForMovieRequirement(req, status, "Movie Updated");
        res.json(o);
        }
    )

    .post( function (req,res){
            console.log(req.body);
            res = res.status(200);
            if (req.get("Content-Type")) {
                res = res.type(req.get('Content-Type'));
            }
            var status = 200;
            var o = getJSONObjectForMovieRequirement(req, status, "Movie Saved");
            res.json(o);
        }
    )
    .get( function (req,res){
            console.log(req.body);
            res = res.status(200);
            if (req.get("Content-Type")) {
                res = res.type(req.get('Content-Type'));
            }
            var status = 200;
            var o = getJSONObjectForMovieRequirement(req, status, "GET movie");
            res.json(o);
        }
    )


app.use('/', router);
app.listen(process.env.PORT || 8080);
module.export = app;