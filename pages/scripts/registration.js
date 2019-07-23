"use strict";
const registration = (form) => {
	if (form.checkValidity()) {
		const userName = document.getElementById("userName").value, password = document.getElementById("password").value, email = document.getElementById("email").value;
		fetch("database/users.json").then(response => response.json()).then(data => console.log(data));
		//window.location.href = "http://localhost:3000/chat.html";
		return;
	}
	alert("Details fields are incorrect.");
};
logBttn.onclick = () => {
	window.location.href = "http://localhost:3000/";
};