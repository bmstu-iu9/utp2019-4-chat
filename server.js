"use strict";
const express = require("express");
const app = express();
app.use(express.static(__dirname + "/pages"));
app.get("/", (req, res) => {
	console.log(req);
	res.redirect("/login.html");
});
app.listen(3000);