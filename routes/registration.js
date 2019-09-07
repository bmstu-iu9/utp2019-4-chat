const fs = require("fs");
const sha1 = require("sha1");
const express = require("express");
const router = express.Router();
const path = require("path");
const forwardAuthenticated = require("../auth").forwardAuthenticated;

router.get("/registration", forwardAuthenticated, (req, res) => res.sendFile(path.join(__dirname, "pages/registration.html")));

router.post("/registration", (req, res) => {
	let users = JSON.parse(fs.readFileSync("database/users.json", "utf-8"));
	if (users[req.body.email] === undefined) {
		res.send("Пользователь с указанным email уже зарегистрирован.");
	} else if (!/^[a-zA-Z]\w*[a-zA-Z]\w*[a-zA-Z]\w*$/.test(req.body.nick)) {
		res.send("Некорректный никнейм.");
	} else if (!/(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*]{7,64}$/.test(req.body.password)) {
		res.send("Некорректный пароль.");
	} else if (req.body.password !== req.body.password2) {
		res.send("Пароли не совпадают.");
	} else {
		users[req.body.email] = {
			"password": sha1(req.body.password),
			"nick": req.body.nick
		};
		fs.writeFileSync("database/users.json", JSON.stringify(users)); //CHECK FOR EXCEPTION LATER!
		res.send("OK");
	}
});

module.exports = router;