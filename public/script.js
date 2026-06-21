const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

let chatHistory = [];

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  chatHistory.push({ role: 'user', message: userMessage });
  input.value = '';

  const loadingEl = appendMessage('bot', 'Gemini is thinking...');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory }),
    });

    const data = await res.json();
    loadingEl.remove();

    if (data.error) {
      appendMessage('bot', 'Error: ' + data.error);
    } else {
      appendMessage('bot', data.reply);
      chatHistory.push({ role: 'model', message: data.reply });
    }
  } catch (err) {
    loadingEl.remove();
    appendMessage('bot', 'Gagal terhubung ke server.');
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}
