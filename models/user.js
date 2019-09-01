const mongoose = require("mongoose");
const User = mongoose.model("User", new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	},
	avatar: {
		type: String,
		default: ""
	},
	rooms: {
		type: Array,
		default: []
	}
}), "users");
module.exports = User;