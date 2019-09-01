const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const path = require('path');
const passport = require('passport');
const Message = require('../models/message');
const User = require('../models/user');
const { forwardAuthenticated } = require(__dirname + '/../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../pages/login.html')));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, '../pages/registration.html')));

// Register
router.post("/register", (req, res) => {
	const {name, email, password, password2} = req.body;
	let errors = [];
	if (!name || !email || !password || !password2) {
		errors.push({ msg: 'Please enter all fields' });
	}
	if (password !== password2) {
		errors.push({ msg: 'Passwords do not match' });
	}
	if (password.length < 6) {
		errors.push({ msg: 'Password must be at least 6 characters' });
	}
	if (errors.length > 0) {
		res.render('register', {
			errors, name, email, password, password2
		});
	} else {
		User.findOne({
			email: email
		}).then(user => {
			if (user) {
				errors.push({
					msg: 'Email already exists'
				});
				res.render('register', {
					errors, name, email, password, password2
				});
			} else {
				const newUser = new User({
					name, email, password
				});
				//hash Password
				bcrypt.genSalt(10, (err, salt) => {
					bcrypt.hash(newUser.password, salt, (err, hash) => {
						if (err) throw err;
						newUser.password = hash;
						newUser.save().then(user => {
							req.flash('success_msg', 'You are now registered and can log in');
							res.redirect('/users/login');
						}).catch(err => console.log(err));
					});
				});
			}
		});
	}
});

// Login
router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect:'../pages/chat.html',
		// successRedirect: '/chat',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
});

const defaultAvatar = "../public/usericon2.jpg";

// Profile Information - username, photo,... (by NikitaLobaev)
router.get("/profileData", (req, res) => {
	User.findOne({
		email: req.user.email
	}).then(user => {
		if (user) {
			res.send(JSON.stringify({
				name: user.name,
				avatar: user.avatar ? user.avatar : defaultAvatar
			}));
		} else {
			res.sendStatus(404);
		}
	});
});

// Messages receiving (by NikitaLobaev)
router.get("/messagesReceive", (req, res) => {
	if (req.user) { //MAYBE CLEAR IT!
		User.find().then((users) => {
			let usersData = [];
			users.forEach(user => {
				usersData[user.email] = {
					name: user.name,
					avatar: user.avatar ? user.avatar : defaultAvatar
				};
			});
			Message.find().sort("time").then((newMessage) => {//THINK ABOUT " and ' (quotes)
				let jsonResult = [];
				newMessage.forEach(message => {
					if (req.param("read") !== undefined || (message.read === false && message.email !== req.user.email)) {
						jsonResult.push({
							name: usersData[message.email].name,
							avatar: usersData[message.email].avatar,
							text: message.text,
							time: message.time
						});
						if (message.read === false && message.email !== req.user.email) {
							Message.findOneAndUpdate({
								email: message.email,
								text: message.text,
								read: message.read,
								time: message.time
							}, {
								read: true
							}, () => {});
						}
					}
				});
				res.send(JSON.stringify(jsonResult));
			});
		});
	} else {
		res.sendStatus(403);
	}
});

// Message sending (by NikitaLobaev)
router.get("/messageSend", (req, res) => {
	new Message({
		email: req.user.email,
		text: req.param("text")
	}).save().then(() => {
		res.sendStatus(200);
	}).catch(() => {
		res.sendStatus(403);
	});
});

// Logout
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

module.exports = router;