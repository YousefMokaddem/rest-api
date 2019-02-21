'use strict';

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    emailAddress: String,
    password: String
});

const CourseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    estimatedTime: String,
    materialsNeeded: String
});

const User = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);

module.exports.User = User;
module.exports.Course = Course;