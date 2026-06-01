// 时钟认知游戏模块
var clockState = {
    totalQuestions: 20,
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    startTime: null,
    timerInterval: null,
    currentAnswer: null,
    hour: 0,
    minute: 0,
    choices: [],
    isProcessing: false
};

// 按年级的题目配置
var clockGradeConfig = {
    'k-small':  { mode: 'whole', description: '整点时间' },
    'k-medium': { mode: 'half', description: '半点时间' },
    'k-large':  { mode: 'quarter', description: '一刻钟时间' },
    'grade-1':  { mode: '5min', description: '5分钟间隔' },
    'grade-2':  { mode: '1min', description: '1分钟间隔' },
    'grade-3':  { mode: 'later', offsetMax: 60, description: '计算稍后时间' },
    'grade-4':  { mode: '24h', description: '24小时制' },
    'grade-5':  { mode: 'diff', description: '时间差计算' },
    'grade-6':  { mode: 'complex', description: '复杂时间计算' }
};

// 获取当前配置
function getClockConfig() {
    return clockGradeConfig[currentGrade] || clockGradeConfig['grade-1'];
}

// 格式化时间显示
function formatTime(h, m) {
    var hStr = (h < 10 ? '0' : '') + h;
    var mStr = (m < 10 ? '0' : '') + m;
    return hStr + ':' + mStr;
}

// 生成时钟题目
function generateClockQuestion() {
    var config = getClockConfig();
    var hour, minute, answerText, questionText;
    var choices = [];

    if (config.mode === 'whole') {
        hour = Math.floor(Math.random() * 12) + 1;
        minute = 0;
        answerText = hour + ':00';
        questionText = '现在是几点？';
    } else if (config.mode === 'half') {
        hour = Math.floor(Math.random() * 12) + 1;
        minute = 30;
        answerText = hour + ':30';
        questionText = '现在是几点？';
    } else if (config.mode === 'quarter') {
        hour = Math.floor(Math.random() * 12) + 1;
        var quarters = [0, 15, 30, 45];
        minute = quarters[Math.floor(Math.random() * 4)];
        answerText = hour + ':' + (minute < 10 ? '0' : '') + minute;
        questionText = '现在是几点？';
    } else if (config.mode === '5min') {
        hour = Math.floor(Math.random() * 12) + 1;
        minute = Math.floor(Math.random() * 12) * 5;
        answerText = hour + ':' + (minute < 10 ? '0' : '') + minute;
        questionText = '现在是几点？';
    } else if (config.mode === '1min') {
        hour = Math.floor(Math.random() * 12) + 1;
        minute = Math.floor(Math.random() * 60);
        answerText = hour + ':' + (minute < 10 ? '0' : '') + minute;
        questionText = '现在是几点？';
    } else if (config.mode === 'later') {
        hour = Math.floor(Math.random() * 12) + 1;
        minute = Math.floor(Math.random() * 12) * 5;
        var offset = (Math.floor(Math.random() * 12) + 1) * 5;
        var totalMin = hour * 60 + minute + offset;
        var newH = Math.floor(totalMin / 60) % 12;
        if (newH === 0) newH = 12;
        var newM = totalMin % 60;
        answerText = formatTime(newH, newM);
        questionText = formatTime(hour, minute) + ' 过 ' + offset + ' 分钟是几点？';
        // 显示的钟是当前时间
    } else if (config.mode === '24h') {
        hour = Math.floor(Math.random() * 24);
        minute = Math.floor(Math.random() * 12) * 5;
        answerText = formatTime(hour, minute);
        questionText = '现在是几点？（24小时制）';
    } else if (config.mode === 'diff') {
        var h1 = Math.floor(Math.random() * 12) + 1;
        var m1 = Math.floor(Math.random() * 12) * 5;
        var h2 = Math.floor(Math.random() * 12) + 1;
        var m2 = Math.floor(Math.random() * 12) * 5;
        // 确保 h2:m2 >= h1:m1
        if (h2 * 60 + m2 < h1 * 60 + m1) {
            var tmpH = h1; h1 = h2; h2 = tmpH;
            var tmpM = m1; m1 = m2; m2 = tmpM;
        }
        var diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        hour = h1; minute = m1;
        answerText = diff + '分钟';
        questionText = formatTime(h1, m1) + ' 到 ' + formatTime(h2, m2) + ' 经过多久？';
    } else { // complex
        hour = Math.floor(Math.random() * 12) + 1;
        minute = Math.floor(Math.random() * 12) * 5;
        var offset = (Math.floor(Math.random() * 24) + 1) * 5;
        var totalMin = hour * 60 + minute + offset;
        var newH = Math.floor(totalMin / 60) % 12;
        if (newH === 0) newH = 12;
        var newM = totalMin % 60;
        answerText = formatTime(newH, newM);
        questionText = formatTime(hour, minute) + ' 过 ' + offset + ' 分钟是几点？';
    }

    // 生成 4 个选项（1 正确 3 干扰）
    choices = [answerText];
    var maxAttempts = 200;
    while (choices.length < 4 && maxAttempts > 0) {
        maxAttempts--;
        var fake;
        if (config.mode === 'diff') {
            // 时间差干扰项
            var fakeDiff = diff + (Math.floor(Math.random() * 5) - 2) * 5;
            if (fakeDiff <= 0) fakeDiff = 5;
            fake = fakeDiff + '分钟';
        } else if (config.mode === '24h') {
            var fh = Math.floor(Math.random() * 24);
            var fm = Math.floor(Math.random() * 12) * 5;
            fake = formatTime(fh, fm);
        } else {
            var fh = Math.floor(Math.random() * 12) + 1;
            var fm = Math.floor(Math.random() * 12) * 5;
            fake = formatTime(fh, fm);
        }
        if (choices.indexOf(fake) < 0) {
            choices.push(fake);
        }
    }

    // 打乱选项
    for (var i = choices.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = choices[i]; choices[i] = choices[j]; choices[j] = tmp;
    }

    var correctIdx = choices.indexOf(answerText);

    return {
        hour: hour,
        minute: minute,
        answerText: answerText,
        questionText: questionText,
        choices: choices,
        correctIdx: correctIdx
    };
}

// 绘制时钟表盘
function drawClockFace(canvas, hour, minute) {
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    var cx = w / 2;
    var cy = h / 2;
    var radius = Math.min(cx, cy) - 15;

    ctx.clearRect(0, 0, w, h);

    // 表盘外圈
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 12 个刻度和数字
    for (var i = 1; i <= 12; i++) {
        var angle = (i * 30 - 90) * Math.PI / 180;

        // 刻度线
        var innerR = radius - 12;
        var outerR = radius - 3;
        ctx.beginPath();
        ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
        ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.stroke();

        // 数字
        var numR = radius - 28;
        ctx.fillStyle = '#333';
        ctx.font = 'bold ' + Math.round(radius * 0.15) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i.toString(), cx + numR * Math.cos(angle), cy + numR * Math.sin(angle));
    }

    // 分针（长、细）
    var minuteAngle = (minute * 6 - 90) * Math.PI / 180;
    var minuteLen = radius * 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + minuteLen * Math.cos(minuteAngle), cy + minuteLen * Math.sin(minuteAngle));
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 时针（短、粗）- 考虑分钟偏移
    var hourAngle = ((hour % 12 + minute / 60) * 30 - 90) * Math.PI / 180;
    var hourLen = radius * 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + hourLen * Math.cos(hourAngle), cy + hourLen * Math.sin(hourAngle));
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 中心点
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
}

// 开始游戏
function startClockGame() {
    clockState.totalQuestions = parseInt(document.getElementById('clock-question-count').value);
    clockState.currentQuestion = 0;
    clockState.score = 0;
    clockState.correctCount = 0;
    clockState.startTime = Date.now();
    clockState.isProcessing = false;

    document.getElementById('clock-setup').style.display = 'none';
    document.getElementById('clock-result').style.display = 'none';
    document.getElementById('clock-quiz').style.display = 'block';

    if (clockState.timerInterval) clearInterval(clockState.timerInterval);
    clockState.timerInterval = setInterval(updateClockTimer, 1000);

    playStartSound();
    showNextClockQuestion();
}

// 显示下一题
function showNextClockQuestion() {
    clockState.currentQuestion++;
    if (clockState.currentQuestion > clockState.totalQuestions) {
        finishClockGame();
        return;
    }

    var q = generateClockQuestion();
    clockState.currentAnswer = q.correctIdx;
    clockState.hour = q.hour;
    clockState.minute = q.minute;
    clockState.choices = q.choices;
    clockState.isProcessing = false;

    // 绘制时钟
    var canvas = document.getElementById('clock-canvas');
    drawClockFace(canvas, q.hour, q.minute);

    // 更新显示
    document.getElementById('clock-question-text').textContent = q.questionText;
    document.getElementById('clock-progress').textContent =
        clockState.currentQuestion + '/' + clockState.totalQuestions;
    document.getElementById('clock-score-text').textContent = '得分：' + clockState.score;
    document.getElementById('clock-feedback').textContent = '';
    document.getElementById('clock-feedback').className = 'feedback';
    document.getElementById('clock-next-btn').style.display = 'none';

    // 渲染选项
    renderClockChoices(q.choices);
}

// 渲染选项按钮
function renderClockChoices(choices) {
    var container = document.getElementById('clock-choices');
    container.innerHTML = '';

    for (var i = 0; i < choices.length; i++) {
        var btn = document.createElement('button');
        btn.className = 'clock-choice-btn';
        btn.textContent = choices[i];
        btn.dataset.index = i;

        btn.addEventListener('click', (function(idx) {
            return function() { chooseClockAnswer(idx); };
        })(i));

        container.appendChild(btn);
    }
}

// 选择答案
function chooseClockAnswer(idx) {
    if (clockState.isProcessing) return;
    clockState.isProcessing = true;

    var btns = document.querySelectorAll('.clock-choice-btn');
    btns.forEach(function(btn) { btn.disabled = true; });

    var feedback = document.getElementById('clock-feedback');

    if (idx === clockState.currentAnswer) {
        // 正确
        clockState.score += 10;
        clockState.correctCount++;
        btns[idx].classList.add('correct');
        feedback.textContent = '✓ 回答正确！';
        feedback.className = 'feedback correct';
        playCorrectSound();
        speakCorrect();
        setTimeout(showNextClockQuestion, 1000);
    } else {
        // 错误
        btns[idx].classList.add('wrong');
        btns[clockState.currentAnswer].classList.add('correct');
        feedback.textContent = '✗ 正确答案是 ' + clockState.choices[clockState.currentAnswer];
        feedback.className = 'feedback wrong';
        playWrongSound();
        speakWrong();
        document.getElementById('clock-next-btn').style.display = 'block';
    }
}

// 更新计时器
function updateClockTimer() {
    var elapsed = Math.floor((Date.now() - clockState.startTime) / 1000);
    document.getElementById('clock-timer').textContent = '用时：' + elapsed + '秒';
}

// 完成游戏
function finishClockGame() {
    if (clockState.timerInterval) clearInterval(clockState.timerInterval);

    var totalTime = Math.floor((Date.now() - clockState.startTime) / 1000);
    var accuracy = Math.round((clockState.correctCount / clockState.totalQuestions) * 100);

    saveClockRecord(accuracy, totalTime, clockState.totalQuestions, clockState.score);
    assessGrade(accuracy, totalTime, clockState.totalQuestions);

    // 显示奖励画面
    document.getElementById('clock-reward-score').textContent = clockState.score;
    document.getElementById('clock-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('clock-reward-time').textContent = totalTime;

    playMemoryLevelSound();
    speakReward(accuracy);
    setRewardStars('clock-reward-stars', accuracy);

    document.getElementById('clock-quiz').style.display = 'none';
    document.getElementById('clock-reward').style.display = 'block';
}

function showClockRewardResult() {
    var totalTime = Math.floor((Date.now() - clockState.startTime) / 1000);
    var accuracy = Math.round((clockState.correctCount / clockState.totalQuestions) * 100);

    document.getElementById('clock-result-score').textContent = clockState.score;
    document.getElementById('clock-result-correct').textContent = accuracy + '%';
    document.getElementById('clock-result-time').textContent = totalTime + '秒';

    document.getElementById('clock-reward').style.display = 'none';
    document.getElementById('clock-result').style.display = 'block';
}
