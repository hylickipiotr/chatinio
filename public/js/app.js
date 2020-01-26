/* eslint-env browser */
/* global io dateFns */
const socket = io();

const sectionUserHeaderElement = document.querySelector('.section-users h2');
const usersListElement = document.querySelector('.users-list');
const messagesListElement = document.querySelector('.messages-list');
const newMessageFormElement = document.querySelector('.message-form');
const newMessageTextElement = newMessageFormElement.querySelector('.content');
const userCounterElement = document.querySelector('.users-counter');

const messages = [];

function distanceToNow(timestamp) {
  return dateFns.distanceInWordsToNow(new Date(Number(timestamp)), {
    includeSeconds: true,
    addSuffix: true,
  });
}

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

function renderMessage({ user, timestamp, content }) {
  const messageElement = document.createElement('li');
  messageElement.dataset.timestamp = timestamp;
  messageElement.className = 'message';
  messageElement.title = dateFns.format(new Date(timestamp), 'DD.MM.YYYY hh:mm:ss');
  if (user.id === socket.id) {
    messageElement.classList.add('curent-user');
  }
  messageElement.dataset.userId = user.id;
  messageElement.innerHTML = `<div class="header">
      <span class="username">${user.name}</span>
      <span class="date">${distanceToNow(timestamp)}</span>
    </div>
    <div class="content">${content}</div>`;
  console.log(messageElement.innerHTML);
  const shouldScroll = shouldScrollMessagesToBottom();
  messages.push(messageElement);
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

function updateMessageDateContent() {
  messages.forEach((message, i) => {
    const { timestamp } = message.dataset;
    messages[i].querySelector('.date').textContent = distanceToNow(Number(timestamp));
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

setInterval(updateMessageDateContent, 1000);
