"use strict";
const express = require("express");
const http = require("http");
const passport = require("passport");
const session = require("express-session");
const fs = require("fs");
const sha1 = require("sha1");
const LocalStrategy = require("passport-local").Strategy;
(module.exports = passport => {
	passport.use(new LocalStrategy({
		usernameField: "email"
	}, (email, password, done) => {
		let user = JSON.parse(fs.readFileSync("data/users.json", "utf-8"))[email];
		if (user !== undefined && user.password === sha1(password)) {
			user.email = email;
			return done(null, user);
		} else {
			return done(null, false, {
				message: "Email или пароль введены некорректно."
			});
		}
	}));
	passport.serializeUser((user, done) => done(null, user.email));
	passport.deserializeUser((email, done) => {
		let user = JSON.parse(fs.readFileSync("data/users.json", "utf-8"))[email];
		user.email = email;
		done(null, user);
	});
})(passport);
let specialSession = session({
	secret: "secret",
	resave: true,
	saveUninitialized: true
});
const app = express()
	.use(express.urlencoded({
		extended: true
	}))
	.use(specialSession)
	.use(passport.initialize())
	.use(passport.session())
	.use("/", require("./routes"))
	.use("/css", express.static("pages/css"))
	.use("/images", express.static("pages/images"))
	.use("/scripts", express.static("pages/scripts"))
	.use("/sounds", express.static("pages/sounds"));
const server = http.createServer(app);
const io = require("socket.io").listen(server);
const port = 8080;
server.listen(port, () => console.log("Server is listening on port " + port));
io.use(require("express-socket.io-session")(specialSession, {
	autoSave: true
}));
const getRoomAddress = (email1, email2) => {
	if (email2) {
		let roomAddress = "data/rooms/" + sha1(email2 + email1) + ".json";
		if (fs.existsSync(roomAddress)) {
			return roomAddress;
		} else {
			return "data/rooms/" + sha1(email1 + email2) + ".json";
		}
	} else {
		return "data/rooms/sandbox.json";
	}
};
const loadRoom = (clientEmail, client, message) => {
	if (clientEmail) {
		let roomAddress = getRoomAddress(clientEmail, message ? message.room : undefined);
		let jsonUsersData = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
		if (fs.existsSync(roomAddress)) {
			let messages = JSON.parse(fs.readFileSync(roomAddress, "utf-8"));
			messages.forEach(message => {
				let user = jsonUsersData[message.email];
				message.nick = user.nick;
				message.avatar = user.avatar ? "data:image/jpeg;base64," + Buffer.from(fs.readFileSync("data/images/" + user.avatar + ".jpg")).toString("base64") : "images/defaultAvatar.jpg";
			});
			client.emit("loadRoom", messages);
		} else if (message.room === clientEmail || !jsonUsersData[message.room]) {
			client.emit("serverMessage", "User not found");
		} else {
			if (message.search) {
				client.emit("loadRoom", {
					nick: jsonUsersData[message.room].nick
				});
			}
			client.emit("loadRoom", []);
		}
	}
};
io.on("connection", client => {
	let clientData; //authentication check
	try {
		if (client.handshake.session.passport.user) {
			let jsonUsersData = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
			let user = jsonUsersData[client.handshake.session.passport.user];
			clientData = {
				email: client.handshake.session.passport.user,
				nick: user.nick,
				avatar: user.avatar ? "data:image/jpeg;base64," + Buffer.from(fs.readFileSync("data/images/" + user.avatar + ".jpg")).toString("base64") : "images/defaultAvatar.jpg",
				rooms: []
			};
			user.rooms.forEach(room => clientData.rooms.push({
				email: room,
				nick: jsonUsersData[room].nick
			}));
			client.join(clientData.email);
		}
	} catch (e) {
	}
	if (clientData) {
		client.on("handshake", () => {
			client.emit("handshake", clientData);
			loadRoom(clientData.email, client);
		});
		client.on("loadRoom", message => loadRoom(clientData.email, client, message));
		client.on("message", message => {
			let roomAddress = getRoomAddress(clientData.email, message.to);
			if (!fs.existsSync(roomAddress)) {
				fs.writeFileSync(roomAddress, "[]");
				let jsonUsersData = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
				jsonUsersData[clientData.email].rooms.push(message.to);
				jsonUsersData[message.to].rooms.push(clientData.email);
				fs.writeFileSync("data/users.json", JSON.stringify(jsonUsersData));
			}
			let messages = JSON.parse(fs.readFileSync(roomAddress, "utf-8"));
			let date = Date.now();
			messages.push({
				email: clientData.email,
				text: message.text,
				time: date
			});
			fs.writeFileSync(roomAddress, JSON.stringify(messages));
			if (message.to) {
				io.to(message.to).emit("message", {
					room: clientData.email,
					nick: clientData.nick,
					avatar: clientData.avatar,
					text: message.text,
					time: date
				});
			} else {
				io.emit("message", {
					room: "",
					email: clientData.email,
					nick: clientData.nick,
					avatar: clientData.avatar,
					text: message.text,
					time: date
				});
			}
		});
		client.on("editProfile", message => {
			let jsonUsersData = JSON.parse(fs.readFileSync("data/users.json", "utf-8"));
			if (message.nick) {
				jsonUsersData[clientData.email].nick = message.nick;
				fs.writeFileSync("data/users.json", JSON.stringify(jsonUsersData));
				client.emit("serverMessage", "Nick successfully changed (#" + jsonUsersData[clientData.email].nick + ").");
			} else if (message.avatar) {
				let avatarPath = sha1(clientData.email);
				jsonUsersData[clientData.email].avatar = avatarPath;
				fs.writeFileSync("data/images/" + avatarPath + ".jpg", message.avatar);
				fs.writeFileSync("data/users.json", JSON.stringify(jsonUsersData));
				client.emit("serverMessage", "Avatar successfully changed.");
			} else if (message.oldPassword) {
				if (jsonUsersData[clientData.email].password === sha1(message.oldPassword)) {
					if (message.newPassword1 === message.newPassword2) {
						if (message.oldPassword !== message.newPassword1) {
							jsonUsersData[clientData.email].password = sha1(message.newPassword1);
							fs.writeFileSync("data/users.json", JSON.stringify(jsonUsersData));
						}
						client.emit("serverMessage", "Password successfully changed.");
					} else {
						client.emit("serverMessage", "Passwords doesn't match.");
					}
				} else {
					client.emit("serverMessage", "Wrong current password.");
				}
			}
		});
		client.on("clearRoom", room => {
			if (room) {
				fs.writeFileSync(getRoomAddress(clientData.email, room), "[]");
			} else {
				client.emit("serverMessage", "Couldn't clear the sandbox.");
			}
		});
	}
});