"use strict";

buttonLogin.onclick = () => {
    const login = userName.value;
    const pass = password.value;
    window.location.href = "http://localhost:3000/chat.html";
}

buttonRegistration.onclick = () => {
    window.location.href = "http://localhost:3000/registration.html";
}