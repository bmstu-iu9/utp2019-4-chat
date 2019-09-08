"use strict";
const fs = require("fs");
const sha1 = require("sha1");
const express = require("express");
const router = express.Router();
const path = require("path");
const passport = require("passport");
const {
	ensureAuthenticated, forwardAuthenticated
} = module.exports = {
	ensureAuthenticated: (req, res, next) => {
		if (req.isAuthenticated()) {
			return next();
		}
		res.redirect("/");
	},
	forwardAuthenticated: (req, res, next) => {
		if (!req.isAuthenticated()) {
			return next();
		}
		res.redirect("/chat");
	}
};

router.get("/", forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, "pages/login.html")));

router.get("/registration", forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, "pages/registration.html")));

router.post("/registration", (req, res) => {
	let users = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
	if (users[req.body.email] !== undefined) {
		res.send("Пользователь с указанным email уже зарегистрирован.");
	} else if (!/^\w{6,20}$/.test(req.body.nick)) {
		res.send("Wrong nick.");
	} else if (!/^\w{6,20}$/.test(req.body.password1)) {
		res.send("Wrong password.");
	} else if (req.body.password1 !== req.body.password2) {
		res.send("Passwords doesn't match.");
	} else {
		users[req.body.email] = {
			"nick": req.body.nick,
			"password": sha1(req.body.password1),
			"rooms": []
		};
		fs.writeFileSync("data/users.json", JSON.stringify(users));
		res.redirect("/chat");
	}
});

router.post("/login", forwardAuthenticated, (req, res, next) => passport.authenticate("local", {
	successRedirect: "/",
	failureRedirect: "/?authenticationError=1"
})(req, res, next));

router.get("/chat", ensureAuthenticated, (req, res) => res.sendFile(path.join(__dirname, "pages/chat.html"), {
	user: req.user
}));

router.get("/logout", ensureAuthenticated, (req, res) => {
	req.logout();
	res.redirect("/");
});

module.exports = router;