"use strict";

bttn.onclick = () => {
    const login = userName.value;
    const pass = password.value;
    const mail = email.value;
    window.location.href = "http://localhost:3000/chat.html";
}


logBttn.onclick = () => {
    window.location.href = "http://localhost:3000/";
}