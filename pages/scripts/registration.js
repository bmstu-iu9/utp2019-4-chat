"use strict";
password2.onblur = () => {
	if (password1.value !== password2.value) {
		password2.title = "Пароли не совпадают";
		password2.value = "";
	} else {
		password2.title = "Пароли совпадают";
	}
};
buttonLogin.onclick = () => window.location.href = "/";