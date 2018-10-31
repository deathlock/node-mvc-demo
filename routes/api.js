'use strict';

var express = require('express');
var router = express.Router();
var userHandler = require("../api/controller/userController.js");

//User Routes
router.post('/register',userHandler.register); //Register
router.post('/login',userHandler.login); //Login
router.post('/forgot_password',userHandler.forgot_password); //Forgot Password
router.get('/reset/:token',userHandler.forget_password_token); //Forgor Password Token Verify
router.post('/reset/:token',userHandler.update_password); //Forgor Password Token Verify

module.exports = router;
