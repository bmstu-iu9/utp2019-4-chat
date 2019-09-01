"use strict";
let profileDataRequest = new XMLHttpRequest();
profileDataRequest.open("GET", "/users/profileData");
profileDataRequest.onload = () => {
	if (profileDataRequest.status === 200) {
		console.log(profileDataRequest.responseText);
		let jsonProfileData = JSON.parse(profileDataRequest.responseText);
		document.getElementById("user-name").textContent = jsonProfileData.name;
		document.getElementById("user-img").src = jsonProfileData.avatar;
	} else {
		console.log(profileDataRequest.status + ": " + profileDataRequest.statusText);
	}
};
profileDataRequest.send();

//Здесь ошибка. Должно быть не id, а style или class
const addMessage = (authorUsername, authorImage, text, time) => {
	time = new Date(time).toUTCString();
	const my = authorUsername === document.getElementById("user-name").textContent;
	let newMessage = document.createElement("div");
	newMessage.setAttribute("id", my ? "my-message-box" : "someone-message-box");
	let picture = document.createElement("img");
	picture.setAttribute("id", my ? "m-img" : "s-img");
	picture.setAttribute("src", authorImage);
	picture.setAttribute("alt", "Беда!");
	newMessage.appendChild(picture);
	let messageText = document.createElement("p");
	messageText.setAttribute("id", my ? "m-text" : "s-text");
	messageText.innerText = text;
	newMessage.appendChild(messageText);
	let blockUsernameMessage = document.createElement("footer"), usernameMessage = document.createElement("p");
	usernameMessage.setAttribute("id", my ? "m-name" : "s-name");
	usernameMessage.innerHTML = my ? "<i>(" + time + ")</i> " + authorUsername : authorUsername + " <i>(" + time + ")</i>";
	blockUsernameMessage.appendChild(usernameMessage);
	newMessage.appendChild(blockUsernameMessage);
	main.appendChild(newMessage);
};

const receiveMessage = (read) => {
	let messagesReceiveRequest = new XMLHttpRequest();
	messagesReceiveRequest.open("GET", "/users/messagesReceive" + read);
	messagesReceiveRequest.onload = () => {
		if (messagesReceiveRequest.status === 200) {
			console.log("messagesReceiveRequest = " + messagesReceiveRequest.responseText);
			JSON.parse(messagesReceiveRequest.responseText).forEach(newMessage => {
				addMessage(newMessage.name, newMessage.avatar, newMessage.text, newMessage.time);
			});
		} else {
			console.log(messagesReceiveRequest.status + ": " + messagesReceiveRequest.statusText);
		}
	};
	messagesReceiveRequest.send();
};
receiveMessage("?read");
setInterval(() => receiveMessage(""), 5000);

bttn.onclick = () => {
	const text = message.value.trim();
	if (text) {
		let newMessage = addMessage(document.getElementById("user-name").textContent, document.getElementById("user-img").src, text, Date.now()),
			messageSendRequest = new XMLHttpRequest();
		messageSendRequest.open("GET", "/users/messageSend?text=" + text);
		messageSendRequest.onload = () => {
			if (messageSendRequest.status === 200) {
				message.value = "";
			} else {
				alert("Ошибка отправки сообщения. Попробуйте снова.");
				main.removeChild(newMessage);
				console.log(messageSendRequest.status + ": " + messageSendRequest.statusText);
			}
		};
		messageSendRequest.send();
	}
};