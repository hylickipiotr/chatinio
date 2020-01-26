/* eslint-env browser */
/* global io */
const socket = io();

const sectionUserHeaderElement = document.querySelector('.section-users h2');
const usersListElement = document.querySelector('.users-list');
const messagesListElement = document.querySelector('.messages-list');
const newMessageFormElement = document.querySelector('.message-form');
const newMessageTextElement = newMessageFormElement.querySelector('.content');
const userCounterElement = document.querySelector('.users-counter');

function emitMessage(message) {
  socket.emit('chat-message', message);
}

function setUser(user) {
  sessionStorage.setItem('user', JSON.stringify(user));
  socket.emit('set-user', user);
}

function updateUserCount(users) {
  userCounterElement.textContent = users.length;
}

function renderUsers(users) {
  usersListElement.innerHTML = '';

  const usersArr = Object.values(users);

  usersArr.forEach((user) => {
    const userElement = document.createElement('li');
    userElement.className = 'user';
    if (user.id === socket.id) {
      userElement.classList.add('curent-user');
    }
    userElement.dataset.userId = user.id;
    userElement.textContent = user.name;

    usersListElement.appendChild(userElement);
  });

  updateUserCount(usersArr);
}

function shouldScrollMessagesToBottom() {
  const l = messagesListElement;
  return l.scrollHeight - l.clientHeight === l.scrollTop;
}

function scrollMessagesToBottom() {
  messagesListElement.scrollTop = messagesListElement.scrollHeight;
}

function renderMessage(message) {
  const messageElement = document.createElement('li');
  const date = new Date(message.timestamp).toLocaleString();
  messageElement.className = 'message';
  if (message.user.id === socket.id) {
    messageElement.classList.add('curent-user');
  }
  messageElement.dataset.userId = message.user.id;
  messageElement.innerHTML = `<div class="header">
      <span class="username">${message.user.name}</span>
      <span class="date">${date}</span>
    </div>
    <p class="content">${message.content}</p>`;

  const shouldScroll = shouldScrollMessagesToBottom();
  messagesListElement.appendChild(messageElement);
  if (shouldScroll) {
    scrollMessagesToBottom();
  }
}

function toggleUsersList() {
  sectionUserHeaderElement.addEventListener('click', () => {
    usersListElement.classList.toggle('show');
  });
}

newMessageFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = newMessageTextElement.value;
  if (!message.length) return;
  emitMessage(message);
  newMessageTextElement.value = '';
});

// newMessageTextElement.addEventListener('keydown', (event) => {
//   if ((event.ctrlKey || event.metaKey) && (event.keyCode === 13 || event.keyCode === 10)) {
//     newMessageFormElement.dispatchEvent(new Event('submit'));
//   }
// });

const widthMatch = window.matchMedia('(max-width: 762px)');
if (widthMatch.matches) {
  toggleUsersList();
}

widthMatch.addEventListener('change', (mm) => {
  if (mm.matches) {
    toggleUsersList();
  }
});

socket.on('connect', () => {
  let user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    user = {};
  }
  if (!user.name) {
    while (!user.name) {
      user.name = prompt('Enter user name').trim();
    }
  }
  setUser(user);
});

socket.on('chat-users', (users) => renderUsers(users));

socket.on('chat-message', (message) => renderMessage(message));
