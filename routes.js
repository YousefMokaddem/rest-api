'use strict'

const express = require('express');
const router = express.Router();
const User = require('./models').User;
const Course = require('./models').Course;
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

const authenticateUser = async (req,res,next) => {

    let message = null;

    //parse user credentials from auth header
    const credentials = auth(req);

    //if the credentials are available
    if(credentials){
        //find the user by their email address (the 'key' from the auth header)
        
        let user = (await User.find({emailAddress: credentials.name}))[0];
        //if the user was retrieved...
        if(user){
            //check the password
            const authenticated = bcryptjs
                .compareSync(credentials.pass, user.password);
            //if the passwords match...
            if(authenticated){
                req.currentUser = user;
            }else{
                message = `Authentication failure for username: ${user.emailAddress}`;
            }
        }else{
            message = `User not found: ${credentials.name}`;
        }
    }else{
        message = `Authentication header not found`
    }

    //if authentication failed
    if(message){
        console.warn(message);

        //return 401 unauthorized
        res.status(401).json({message: 'Access Denied'});
    }else{
        //successful authentication passes control to the route handler
        next();
    }
}

// route to return currently authenticated user
router.get('/users', authenticateUser, (req,res) => {
    const user = req.currentUser;
    res.json({
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress
    });
});

// route to create user
router.post('/users', (req,res,next) => {
    const user = new User(req.body);

    // Hash the new user's password.
    user.password = bcryptjs.hashSync(user.password);
    //validate email
    if(!/^[^@]+@[^@.]+\.[a-z]+$/i.test(user.emailAddress)){
        let err = new Error("Bad Request - invalid email");
        err.status = 400;
        return next(err)
    }
    //check email against database to ensure it is unique
    User.find({emailAddress: user.emailAddress})
        .exec((err, userfound) => {
            if(err) return next(err);
            if (userfound[0] !== undefined){
                //email is already in use
                err = new Error("Conflict - email in use");
                err.status = 409;
                return next(err);
            }else{
                user.save((err, user) => {
                    if(err) return next(err);
                    res.status(201);
                    res.location('/');
                    res.end();
                });
            }
        });
});

// route to get list of courses
router.get('/courses', (req,res,next) => {
    Course.find({})
        .populate('user', 'firstName lastName')
        .exec((err, courses) => {
            if (err) return next(err);
            res.json(courses);
        });
});

// route to return course by id
router.get('/courses/:id', (req,res,next) => {
    Course.findById(req.params.id)
        .populate('user', 'firstName lastName')
        .exec((err, course) => {
            if (err) return next(err);
            res.json(course);
        });
});

// route to create a course
router.post('/courses', authenticateUser, (req,res,next) => {
    const course = new Course(req.body);

    course.save((err, course) => {
        if(err) return next(err);
        res.status(201);
        res.location(`/api/courses/${course.id}`)
        res.end();
    });
});

// route to update a course
router.put('/courses/:id', authenticateUser, (req,res,next) => {
    Course.findById(req.params.id)
        .exec((err, course) => {
            //need == here because we have different types.
            if(req.currentUser.id == course.user){
                if(err) return next(err);
                Object.assign(course, req.body);
                course.save((err) => {
                    if(err) return next(err);
                    res.status(204);
                    res.end()
                });
            }else{
                err = new Error("Access Denied");
                err.status = 401;
                return next(err);
            }
        });
});

// route to delete a course
router.delete('/courses/:id', authenticateUser, (req,res,next) => {
    Course.findById(req.params.id)
        .exec((err,course) => {
            if(req.currentUser.id == course.user){
                if (err) return next(err);
                course.remove(err => {
                    if(err) return next(err);
                    res.status(204);
                    res.end();
                });
            }else{
                err = new Error("Access Denied");
                err.status = 401;
                return next(err);
            }
        });
});

module.exports = router;