// ───────────────────────── Footer year ─────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ───────────────────────── Nav scroll state ─────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 12);
}, { passive: true });

// ───────────────────────── Scroll reveal ─────────────────────────
const revealTargets = document.querySelectorAll('section, .work-card, .axder-card, .edu-cert-card');
revealTargets.forEach(el => { el.style.opacity = 0; el.style.transform = 'translateY(18px)'; el.style.transition = 'opacity .7s ease, transform .7s ease'; });
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = 1;
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealTargets.forEach(el => io.observe(el));

// ───────────────────────── Chat widget ─────────────────────────
const chatFab    = document.getElementById('chatFab');
const chatPanel  = document.getElementById('chatPanel');
const chatClose  = document.getElementById('chatClose');
const chatForm   = document.getElementById('chatForm');
const chatInput  = document.getElementById('chatInput');
const chatMsgs   = document.getElementById('chatMessages');
const openFromAxder = document.getElementById('openChatFromAxder');

let history = []; // { role: 'user'|'assistant', content: string }

function openChat(){ chatPanel.classList.add('open'); chatInput.focus(); }
function closeChat(){ chatPanel.classList.remove('open'); }

chatFab.addEventListener('click', () => chatPanel.classList.contains('open') ? closeChat() : openChat());
chatClose.addEventListener('click', closeChat);
openFromAxder?.addEventListener('click', openChat);

function addMessage(text, who){
  const div = document.createElement('div');
  div.className = 'msg ' + (who === 'user' ? 'msg-user' : 'msg-bot');
  div.textContent = text;
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return div;
}

function showTyping(){
  const div = document.createElement('div');
  div.className = 'msg msg-bot msg-typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return div;
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = '';
  addMessage(text, 'user');
  history.push({ role: 'user', content: text });

  const typingEl = showTyping();

  try {
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    });
    const data = await res.json();
    typingEl.remove();

    if (data.reply) {
      addMessage(data.reply, 'bot');
      history.push({ role: 'assistant', content: data.reply });
    } else {
      addMessage("Sorry, I'm having trouble connecting right now — please reach Prince directly at princealexesumei@gmail.com.", 'bot');
    }
  } catch (err) {
    typingEl.remove();
    addMessage("Sorry, I'm having trouble connecting right now — please reach Prince directly at princealexesumei@gmail.com.", 'bot');
  }
});
