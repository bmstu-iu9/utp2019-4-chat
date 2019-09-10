"use strict";
if (!localStorage.getItem("notifications.sound")) {
	localStorage.setItem("notifications.sound", "true");
}
notificationsCheckbox.checked = localStorage.getItem("notifications.sound") === "true";

let userData = {}, currentRoom = searchChatChoiceSandbox, loadingRoom;

const socket = io();

const addRoom = room => {
	let rooms = searchChatChoiceButtons.getElementsByTagName("button");
	for (let r = 0; r < rooms.length; r++) {
		if (rooms[r].dataset.room === room.email) {
			return rooms[r];
		}
	}
	let button = document.createElement("button");
	button.setAttribute("class", "another");
	button.setAttribute("data-nick", room.nick);
	button.setAttribute("data-room", room.email);
	button.setAttribute("onclick", "selectRoom(this)");
	button.setAttribute("title", room.email);
	button.textContent = "# " + room.nick;
	searchChatChoiceButtons.appendChild(button);
	return button;
};
const selectRoom = room => {
	if (currentRoom !== room) {
		currentRoom.setAttribute("class", "another");
		currentRoom = room;
		room.setAttribute("class", "current");
		chatArea.innerHTML = "";
		socket.emit("loadRoom", {
			room: room.dataset.room
		});
	}
};
const addMessage = (isMyMessage, nick, avatar, text, time) => {
	let newMessage = document.createElement("div");
	newMessage.setAttribute("class", isMyMessage ? "my-message-box" : "someone-message-box");
	let picture = document.createElement("img");
	picture.setAttribute("alt", "Ошибка");
	picture.setAttribute("class", "avatar");
	picture.setAttribute("src", avatar);
	newMessage.appendChild(picture);
	let messageText = document.createElement("p");
	messageText.setAttribute("class", "text");
	messageText.innerText = text;
	newMessage.appendChild(messageText);
	let blockUsernameMessage = document.createElement("footer");
	let usernameMessage = document.createElement("p");
	usernameMessage.setAttribute("class", "nick");
	time = new Date(time).toUTCString();
	usernameMessage.innerHTML = isMyMessage ? "<i>(" + time + ")</i> " + nick : nick + " <i>(" + time + ")</i>";
	blockUsernameMessage.appendChild(usernameMessage);
	newMessage.appendChild(blockUsernameMessage);
	chatArea.appendChild(newMessage);
	chatArea.scrollTop = chatArea.scrollHeight;
};
const newMessageNotification = () => {
	if (localStorage.getItem("notifications.sound")) {
		new Audio("sounds/newMessage.mp3").play();
	}
	document.title = "+1 New Message";
	setTimeout(() => document.title = "Chat", 1000);
};

socket.on("handshake", message => {
	userData.email = message.email;
	editProfileNick.value = nick.textContent = userData.nick = message.nick;
	avatar.src = userData.avatar = message.avatar;
	message.rooms.forEach(room => addRoom(room));
});
socket.on("message", message => {
	if (message.room || message.email !== userData.email) {
		if (currentRoom.dataset.room === message.room) {
			addMessage(message.nick === userData.nick, message.nick, message.avatar, message.text, message.time);
			newMessageNotification();
		} else {
			addRoom({
				email: message.room,
				nick: message.nick
			});
			newMessageNotification();
		}
	}
});
socket.on("loadRoom", messages => {
	if (loadingRoom) {
		loadingRoom.nick = messages.nick;
		selectRoom(addRoom(loadingRoom));
		loadingRoom = undefined;
	} else {
		messages.forEach(message => {
			if (message.email === userData.email) {
				addMessage(true, userData.nick, userData.avatar, message.text, message.time);
			} else {
				addMessage(false, message.nick, message.avatar, message.text, message.time);
			}
		});
	}
});
socket.on("serverMessage", message => {
	loadingRoom = undefined;
	alert(message);
});
socket.emit("handshake");

searchChatForm.onsubmit = () => {
	if (searchChatForm["email"].checkValidity()) {
		loadingRoom = {
			email: searchChatForm["email"].value
		};
		socket.emit("loadRoom", {
			room: loadingRoom.email,
			search: true
		});
	}
	return false;
};
messageForm.onsubmit = () => {
	if (messageForm["message"].checkValidity()) {
		addMessage(true, userData.nick, userData.avatar, messageForm["message"].value, Date.now());
		socket.emit("message", {
			to: currentRoom.dataset.room,
			text: messageForm["message"].value
		});
		messageForm["message"].value = "";
	}
	return false;
};
let searchingMessages = {
	lastIndex: 0
};
searchMessagesForm.onsubmit = () => {
	if (searchMessagesForm["text"].checkValidity()) {
		let messages = chatArea.getElementsByTagName("div");
		let cycle = searchingMessages.lastSearch !== searchMessagesForm["text"].value;
		if (cycle) {
			searchingMessages.lastIndex = messages.length;
			searchingMessages.lastSearch = searchMessagesForm["text"].value;
		}
		try {
			while (true) {
				if (--searchingMessages.lastIndex < 0) {
					if (cycle) {
						alert("Сообщений не найдено.");
						break;
					} else {
						searchingMessages.lastIndex = messages.length;
						cycle = true;
					}
				} else {
					if (messages[searchingMessages.lastIndex].id !== "scrol-space" && messages[searchingMessages.lastIndex].getElementsByTagName("p")[0].textContent
						.includes(searchMessagesForm["text"].value)) {
						messages[searchingMessages.lastIndex].scrollIntoView();
						messages[searchingMessages.lastIndex].style.backgroundColor = "var(--c-green-2)";
						setTimeout(message => message.style.backgroundColor = "var(--c-green-3)", 1000, messages[searchingMessages.lastIndex]);
						break;
					}
				}
			}
		} catch (e) {
			console.log(e);
		}
		searchingMessages.lastSearch = searchMessagesForm["text"].value;
	}
	return false;
};
editProfileNickForm.onsubmit = () => {
	if (editProfileNickForm["nick"].checkValidity()) {
		socket.emit("editProfile", {
			nick: editProfileNickForm["nick"].value
		});
		let messages = chatArea.getElementsByClassName("my-message-box");
		for (let i = 0; i < messages.length; i++) {
			let nick = messages[i].getElementsByClassName("nick")[0];
			nick.innerHTML = nick.innerHTML.substr(0, nick.innerHTML.length - userData.nick.length) + editProfileNickForm["nick"].value;
		}
		nick.textContent = userData.nick = editProfileNickForm["nick"].value;
	}
	return false;
};
editProfileAvatar.onchange = () => {
	if (editProfileAvatar.checkValidity()) {
		socket.emit("editProfile", {
			avatar: editProfileAvatar.files[0]
		});
		avatar.src = userData.avatar = window.URL.createObjectURL(editProfileAvatar.files[0]);
		let messages = chatArea.getElementsByClassName("my-message-box");
		for (let i = 0; i < messages.length; i++) {
			messages[i].getElementsByClassName("avatar")[0].src = avatar.src;
		}
	}
	return false;
};
editProfilePasswordForm.onsubmit = () => {
	if (oldPassword.checkValidity() && newPassword1.checkValidity() && newPassword2.checkValidity()) {
		if (newPassword1.value === newPassword2.value) {
			socket.emit("editProfile", {
				oldPassword: oldPassword.value,
				newPassword1: newPassword1.value,
				newPassword2: newPassword2.value
			});
		} else {
			alert("Passwords doesn't match.");
		}
	}
	return false;
};
notificationsCheckbox.onchange = () => localStorage.setItem("notifications.sound", notificationsCheckbox.checked ? "true" : "false");
clearTheStory.onclick = () => {
	socket.emit("clearRoom", currentRoom.dataset.room);
	let room = currentRoom;
	currentRoom = searchChatChoiceSandbox;
	selectRoom(room);
};
logout.onclick = () => window.location.href = "logout";