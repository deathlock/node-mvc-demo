'use strict';

//Including required packages
var mongoose = require('mongoose'),
        jwt = require('jsonwebtoken'),
        bcrypt = require('bcrypt'),
        User = mongoose.model('User'), // Including User model
        Async = require('async'),
        Crypto = require('crypto'),
        nodemailer = require('nodemailer');

//Register Function
exports.register = function(req, res) {
    var newUser  = new User(req.body);
    newUser.password = bcrypt.hashSync(req.body.password,10);
    newUser.save(function(err, user){
      if(err){
        return res.status(400).send(
          {
            message: err
          }
        )
      }else{
        user.password = undefined;
        return res.status(200).json(user);
      }
    });
};

//Login Function
exports.login = function(req, res){
  User.findOne({
    email: req.body.email
  },function(err, user){
    if(err) throw err;
    if(!user || !user.comparePassword(req.body.password)){
      return res.status(401).json({ message:'Authentication failed. Invalid Email or Password.' });
    }
    return res.json({ token:jwt.sign({ email: user.email, fullname: user.fullname, _id: user._id }, 'RESTFULAPIs') })
  });
};

//Login Required Function
exports.login_required = function(req, res, next){
  if(req.user){
    next();
  }else{
    res.status(401).json({ message: "Unauthorized User!" });
  }
};

//Forgot Password Function
exports.forgot_password = function(req, res, next){
  Async.waterfall([
      function(done) {
        Crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
            return res.status(400).json({ error: 'No account with that email address exists.' });
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'bacancymobiletest@gmail.com',
            pass: 'bacancy123'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + 'api/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          return res.status(200).json({ success: 'An e-mail has been sent to ' + user.email + ' with further instructions.' });
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) return next(err);
      return res.status(400).json({error: "Something went wrong!"});
    });
};

//Check Forget Password Token
exports.forget_password_token = function(req, res, next){
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      return res.status(400).json({error: 'Password reset token is invalid or has expired.'});
    }else{
      return res.status(200).json({message: 'Token is valid.Please update password.'});
    }
  });
};

//Reset User Password and send email
exports.update_password = function(req, res, next){
  Async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            return res.status(200).json({error: 'Password reset token is invalid or has expired.'});
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function(err) {
              done(err, user);
          });
        });
      },
      function(user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'bacancymobiletest@gmail.com',
            pass: 'bacancy123'
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          return res.status(200).json({success: 'Success! Your password has been changed.'});
          done(err);
        });
      }
    ], function(err) {
      return res.status(400).json({error: "Something went wrong!"});
    });
};
