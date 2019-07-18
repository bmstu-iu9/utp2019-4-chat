"use strict";

const express = require("express");

const app = express();

app.use(express.static(__dirname + "/Pages"));

app.get("/", (req, res) => {
    res.redirect("/login.html");
});

app.listen(3000);