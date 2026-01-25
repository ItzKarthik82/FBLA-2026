// Basic interactivity for PeerLearn demo
function joinSession(name){
  alert('Joining session: ' + name + '\n(placeholder — integrate real meeting links)');
}

function proposeSession(){
  const t = document.getElementById('sessionTitle').value;
  const h = document.getElementById('sessionHost').value;
  const time = document.getElementById('sessionTime').value;
  alert('Session proposed:\n' + t + ' by ' + h + ' at ' + time);
  document.getElementById('hostForm').reset();
}

// Dashboard progress using localStorage
function loadProgress(){
  const lessons = parseInt(localStorage.getItem('lessons')||'0',10);
  const quizzes = parseInt(localStorage.getItem('quizzes')||'0',10);
  updateBar('lessonsBar', lessons);
  updateBar('quizBar', quizzes);
  const list = JSON.parse(localStorage.getItem('activities')||'[]');
  const ul = document.getElementById('activityList'); if(ul) {ul.innerHTML=''; list.forEach(it=>{const li=document.createElement('li');li.textContent=it;ul.appendChild(li)})}
}

function updateBar(id, value){
  const el = document.getElementById(id);
  if(!el) return;
  const pct = Math.min(100, value);
  el.style.width = pct + '%';
  el.textContent = pct + '%';
}

function markComplete(amount){
  const prev = parseInt(localStorage.getItem('lessons')||'0',10);
  const next = Math.min(100, prev + amount);
  localStorage.setItem('lessons', next);
  pushActivity('Completed a lesson ('+amount+'%)');
  loadProgress();
}

function markQuizPassed(){
  const prev = parseInt(localStorage.getItem('quizzes')||'0',10);
  const next = Math.min(100, prev + 20);
  localStorage.setItem('quizzes', next);
  pushActivity('Passed a quiz');
  loadProgress();
}

function pushActivity(text){
  const list = JSON.parse(localStorage.getItem('activities')||'[]');
  list.unshift(new Date().toLocaleString()+': '+text);
  if(list.length>20) list.pop();
  localStorage.setItem('activities', JSON.stringify(list));
}

function clearActivity(){
  localStorage.removeItem('activities');
  document.getElementById('activityList').innerHTML='';
}

// Simple resources quiz
function checkQuiz(){
  const radios = document.getElementsByName('q1');
  let val = null; for(const r of radios) if(r.checked) val=r.value;
  const result = document.getElementById('quizResult');
  if(!val){ result.textContent='Please select an answer.'; return }
  if(val==='#'){ result.textContent='Correct! # starts a comment in Python.'; pushActivity('Quiz: Q1 correct'); localStorage.setItem('quizzes', Math.min(100, parseInt(localStorage.getItem('quizzes')||'0',10)+20)); loadProgress()} else { result.textContent='Not quite — try again.'; pushActivity('Quiz: Q1 incorrect') }
}

window.addEventListener('load', loadProgress);

// Theme toggle & persistence
function applyTheme(theme){
  const root = document.documentElement;
  if(theme==='dark') root.classList.add('dark'); else root.classList.remove('dark');
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('themeToggle');
  if(btn) btn.textContent = theme==='dark' ? 'Light' : 'Dark';
}

function toggleTheme(){
  const current = localStorage.getItem('theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

// Initialize theme on page load
window.addEventListener('DOMContentLoaded', ()=>{
  const pref = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(pref);
  const btn = document.getElementById('themeToggle');
  if(btn) btn.addEventListener('click', toggleTheme);
  const reset = document.getElementById('resetBtn');
  if(reset) reset.addEventListener('click', ()=>{
    localStorage.removeItem('theme');
    localStorage.removeItem('activities');
    localStorage.removeItem('lessons');
    localStorage.removeItem('quizzes');
    applyTheme('light');
    location.reload();
  });
});
