'use strict';

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'Please include first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please include last name']
    },
    emailAddress: {
        type: String,
        required: [true, 'Please include email address']
    },
    password: {
        type: String,
        required: [true, 'Please include password']
    }
});

const CourseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    title: {
        type: String,
        required: [true, 'Please include title']
    },
    description: {
        type: String,
        required: [true, 'Please include description']
    },
    estimatedTime: String,
    materialsNeeded: String
});

const User = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);

module.exports.User = User;
module.exports.Course = Course;