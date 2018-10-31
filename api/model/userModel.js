'use strict';

// Adding Packages
var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;

/*
User Schema
*/
var UserSchema = new Schema({
  fullname:{
    type: String,
    trim: true,
    required: [true, 'Fullname is required!']
  },
  email:{
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: [true, 'Email is required!']
  },
  password:{
    type: String,
    required: [true, 'Password is required!']
  },
  created_at:{
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

/*
Method to compare password with hash password
*/
UserSchema.methods.comparePassword = function(password){
  return bcrypt.compareSync(password, this.password);
};

mongoose.model('User', UserSchema); // Defining Model
