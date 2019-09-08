"use strict";
if (new URL(window.location.href).searchParams.get("authenticationError")) {
	alert("Неверный логин или пароль.");
}
buttonRegistration.onclick = () => window.location.href = "registration";