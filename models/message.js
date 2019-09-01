const mongoose = require("mongoose");
const Message = mongoose.model("Message", new mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	text: {
		type: String,
		required: true
	},
	read: {
		type: Boolean,
		default: false
	},
	time: {
		type: Date,
		default: Date.now
	}
}), "messages");
module.exports = Message;