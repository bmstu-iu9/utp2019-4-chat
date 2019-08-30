"use strict";
bttn.onclick = () => {
	const text = message.value;
	if (text) {
		let newMessage = document.createElement("div");
		newMessage.setAttribute("id", "my-message-box");
		
		let picture = document.createElement("img");
		picture.setAttribute("id", "m-img");
		picture.setAttribute("src", "../public/usericon2.jpg");
		picture.setAttribute("alt", "Беда!");
		newMessage.appendChild(picture);
		
		let messageText = document.createElement("p");
		messageText.setAttribute("id", "m-text");
		messageText.innerText = text;
		newMessage.appendChild(messageText);
		message.value = "";
		document.getElementById("main").appendChild(newMessage);
	}
};