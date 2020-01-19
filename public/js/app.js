/* eslint-env browser */
/* global io */
const socket = io();

const localState = {
  user: {
    name: '',
  },
};

const usersListElement = document.querySelector('#chat-users');
const messagesListElement = document.querySelector('#chat-messages');
const newMessageFormElement = document.querySelector('#message-form');
const newMessageTextElement = newMessageFormElement.querySelector('.__content');


function emitMessage(message) {
  socket.emit('chat-message', message);
}

function setUser(user) {
  socket.emit('set-user', user);
}

function renderUsers(users) {
  usersListElement.innerHTML = '';

  Object.values(users).forEach((user) => {
    const userElement = document.createElement('li');
    userElement.className = 'user';
    userElement.textContent = user.name;

    usersListElement.appendChild(userElement);
  });
}

function renderMessage(message) {
  const messageElement = document.createElement('div');
  const date = new Date(message.timestamp).toLocaleString();
  messageElement.innerHTML = `
    <h5 class="username">${message.user.name}</h5>
    <p class="content">${message.content}</p>
    <small class="date">${date}</small>
  `;
  messagesListElement.appendChild(messageElement);
}

newMessageFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = newMessageTextElement.value;
  if (!message.length) return;
  emitMessage(message);
});

socket.on('connect', () => {
  const { user } = localState;
  if (!user.name) {
    while (!user.name) {
      user.name = prompt('Enter user name').trim();
    }
  }
  setUser(user);
});

socket.on('chat-users', (users) => renderUsers(users));

socket.on('chat-message', (message) => renderMessage(message));
