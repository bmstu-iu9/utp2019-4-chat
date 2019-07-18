"use strict";

bttn.onclick = () => {
    const text = message.value;
    let newMessage = document.createElement("div");
    newMessage.innerHTML = text;
    document.getElementById("main").appendChild(newMessage);
}