// ==========================================
// ⚠️ CORE SYSTEM OVERLOAD PROTOCOL (GitHub Pages OS)
// 호환성 극대화 및 웹 오디오 보안 우회 버전
// ==========================================

var score = 0;
var time = 60;
var combo = 0;
var correctAnswer;
var timer = null;
var maxNumber = 10;

var totalSolved = 0;
var correctCount = 0;
var isClickable = true;

// 깃허브 서버 호환을 위한 오디오 컨텍스트 지연 생성 방식
var audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type, customFreq) {
  try {
    initAudio();
    if (!audioCtx) return;

    var osc = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    var now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(550, now);
      gainNode.gain.setValueAtTime(0.15, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } 
    else if (type === 'warning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(customFreq || 800, now);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } 
    else if (type === 'boom') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(10, now + 0.8);
      gainNode.gain.setValueAtTime(0.6, now);
      gainNode.gain.linearRampToValueAtTime(0.01, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  } catch (e) {
    console.log("Audio Error 무시함:", e);
  }
}

function startGame(levelMax) {
  // 첫 클릭 시 오디오 엔진 강제 깨우기 (브라우저 차단 우회)
  initAudio();
  
  maxNumber = levelMax;
  document.getElementById('startScreen').classList.add('hidden');
  document.getElementById('playScreen').classList.remove('hidden');
  
  nextQuestion();
  
  if (timer) clearInterval(timer);
  
  timer = setInterval(function() {
    time--;
    document.getElementById('time').textContent = time;
    
    if (time <= 10 && time > 0) {
      document.getElementById('gameWindow').classList.add('panic');
      document.getElementById('timerBox').classList.add('emergency');
      
      var emergencyFreq = 800 + ((10 - time) * 80); 
      playSound('warning', emergencyFreq);
    }
    
    if (time <= 0) {
      clearInterval(timer);
      handleExplosion();
    }
  }, 1000);
}

function nextQuestion() {
  isClickable = true;
  var a = Math.floor(Math.random() * (maxNumber + 1));
  var b = Math.floor(Math.random() * (maxNumber + 1));
  var ops = ['+', '-', '*'];
  var op = ops[Math.floor(Math.random() * ops.length)];

  if (op === '-' && a < b) { var temp = a; a = b; b = temp; }

  if (op === '+') correctAnswer = a + b;
  if (op === '-') correctAnswer = a - b;
  if (op === '*') correctAnswer = a * b;

  document.getElementById('question').textContent = a + " " + op + " " + b;

  var answers = [correctAnswer];
  while (answers.length < 4) {
    var range = maxNumber > 10 ? 15 : 5;
    var wrong = correctAnswer + Math.floor(Math.random() * (range * 2) - range);
    if (answers.indexOf(wrong) === -1 && wrong >= 0) {
      answers.push(wrong);
    }
  }

  answers.sort(function() { return Math.random() - 0.5; });

  var choicesDiv = document.getElementById('choices');
  choicesDiv.innerHTML = '';

  answers.forEach(function(ans) {
    var btn = document.createElement('button');
    btn.textContent = ans;
    btn.onclick = function() { checkAnswer(btn, ans); };
    choicesDiv.appendChild(btn);
  });
}

function checkAnswer(button, answer) {
  if (!isClickable) return;
  isClickable = false;
  
  playSound('click');
  totalSolved++;
  var feedback = document.getElementById('feedback');

  if (answer === correctAnswer) {
    correctCount++;
    score += 10 + combo * 2;
    combo++;
    
    button.classList.add('correct');
    feedback.textContent = '⚡ SECURE';
    feedback.style.color = '#00ff66';
  } else {
    combo = 0;
    time = Math.max(0, time - 4); 
    document.getElementById('time').textContent = time;
    
    button.classList.add('wrong');
    document.body.classList.add('screen-shake');
    feedback.textContent = '🚨 OVERLOAD -4s';
    feedback.style.color = '#ff0055';
    
    if (time <= 0) {
      clearInterval(timer);
      handleExplosion();
      return;
    }
  }

  document.getElementById('score').textContent = score;
  document.getElementById('combo').textContent = combo;

  setTimeout(function() {
    document.body.classList.remove('screen-shake');
    feedback.textContent = '';
    if (time > 0) nextQuestion();
  }, 350);
}

function handleExplosion() {
  document.body.classList.remove('screen-shake');
  document.body.classList.add('detonated'); 
  playSound('boom');

  setTimeout(function() {
    document.getElementById('gameWindow').classList.remove('panic');
    document.getElementById('playScreen').classList.add('hidden');
    document.getElementById('endScreen').classList.remove('hidden');
    
    var accuracyPercent = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;
    
    document.getElementById('finalScore').textContent = score;
    document.getElementById('totalQuestions').textContent = totalSolved;
    document.getElementById('accuracy').textContent = accuracyPercent + '%';
  }, 600);
}

function resetGame() {
  score = 0;
  time = 60;
  combo = 0;
  totalSolved = 0;
  correctCount = 0;
  isClickable = true;
  
  document.getElementById('score').textContent = score;
  document.getElementById('combo').textContent = combo;
  document.getElementById('time').textContent = time;
  document.getElementById('feedback').textContent = '';
  
  document.body.classList.remove('detonated', 'screen-shake');
  document.getElementById('gameWindow').classList.remove('panic');
  document.getElementById('timerBox').classList.remove('emergency');
  
  document.getElementById('endScreen').classList.add('hidden');
  document.getElementById('startScreen').classList.remove('hidden');
}
