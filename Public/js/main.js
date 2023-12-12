const chatform = document.getElementById("chat-form");
const chatmessages = document.querySelector(".chat-messages");
const roomname = document.getElementById("room-name");
const userlist = document.getElementById("users");
//Get user name and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log(username, room);
//message from server
const socket = io();
//join chat room
socket.emit("joinroom", { username, room });
//get room and users
socket.on("roomusers", ({ room, users }) => {
  outputRoomname(room);
  outputUsers(users);
});

//message reom servrr

socket.on("message", (message) => {
  console.log(message);
  outputmessage(message);
  //scroll down
  chatmessages.scrollTop = chatmessages.scrollHeight;
});
//message submit
chatform.addEventListener("submit", (e) => {
  e.preventDefault();
  //get message text
  const msg = e.target.elements.msg.value;
  //emit message to the server
  socket.emit("chatmessage", msg);
  //clear input
  e.target.elements.msg.value = " ";
  e.target.elements.msg.focus();
});
//output message to the dom
function outputmessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
   ${message.text}
  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}
//Add room name to dom
function outputRoomname(room) {
  roomname.innerText = room;
}
// add users to dom
function outputUsers(users) {
  userlist.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join(" ")}
  `;
}
