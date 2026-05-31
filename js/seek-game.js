// 数字捉迷藏游戏模块
var seekState = {
    totalQuestions: 10,
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    targetNumber: 0,
    guessCount: 0,
    maxGuesses: 7,
    rangeMin: 1,
    rangeMax: 100,
    startTime: null,
    timerInterval: null,
    isProcessing: false
};

// 按年级的题目配置
var seekGradeConfig = {
    'k-small':  { min: 1, max: 5,    maxGuesses: 3,  description: '1~5 猜数字' },
    'k-medium': { min: 1, max: 10,   maxGuesses: 4,  description: '1~10 猜数字' },
    'k-large':  { min: 1, max: 20,   maxGuesses: 5,  description: '1~20 猜数字' },
    'grade-1':  { min: 1, max: 50,   maxGuesses: 6,  description: '1~50 猜数字' },
    'grade-2':  { min: 1, max: 100,  maxGuesses: 7,  description: '1~100 猜数字' },
    'grade-3':  { min: 1, max: 200,  maxGuesses: 8,  description: '1~200 猜数字' },
    'grade-4':  { min: 1, max: 500,  maxGuesses: 9,  description: '1~500 猜数字' },
    'grade-5':  { min: 1, max: 1000, maxGuesses: 10, description: '1~1000 猜数字' },
    'grade-6':  { min: 1, max: 10000, maxGuesses: 12, description: '1~10000 猜数字' }
};

// 获取当前配置
function getSeekConfig() {
    return seekGradeConfig[currentGrade] || seekGradeConfig['grade-1'];
}

// 开始游戏
function startSeekGame() {
    var config = getSeekConfig();
    seekState.totalQuestions = parseInt(document.getElementById('seek-question-count').value);
    seekState.currentQuestion = 0;
    seekState.score = 0;
    seekState.correctCount = 0;
    seekState.rangeMin = config.min;
    seekState.rangeMax = config.max;
    seekState.maxGuesses = config.maxGuesses;
    seekState.startTime = Date.now();
    seekState.isProcessing = false;

    // 绑定数字键盘
    var seekInput = document.getElementById('seek-input');
    seekInput.onclick = function() {
        if (typeof numpad !== 'undefined') numpad.show(this);
    };

    document.getElementById('seek-setup').style.display = 'none';
    document.getElementById('seek-result').style.display = 'none';
    document.getElementById('seek-quiz').style.display = 'block';

    if (seekState.timerInterval) clearInterval(seekState.timerInterval);
    seekState.timerInterval = setInterval(updateSeekTimer, 1000);

    playStartSound();
    showNextSeekQuestion();
}

// 显示下一题
function showNextSeekQuestion() {
    seekState.currentQuestion++;
    if (seekState.currentQuestion > seekState.totalQuestions) {
        finishSeekGame();
        return;
    }

    var config = getSeekConfig();
    seekState.targetNumber = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    seekState.guessCount = 0;
    seekState.rangeMin = config.min;
    seekState.rangeMax = config.max;
    seekState.isProcessing = false;

    // 更新显示
    document.getElementById('seek-progress').textContent =
        seekState.currentQuestion + '/' + seekState.totalQuestions;
    document.getElementById('seek-score-text').textContent = '得分：' + seekState.score;
    document.getElementById('seek-range').textContent = config.min + ' ~ ' + config.max;
    document.getElementById('seek-guess-count').textContent =
        '已猜 ' + seekState.guessCount + ' / ' + seekState.maxGuesses + ' 次';
    document.getElementById('seek-feedback').textContent = '请输入你猜的数字';
    document.getElementById('seek-feedback').className = 'seek-feedback';
    document.getElementById('seek-input').value = '';

    // 清除反馈区域
    var feedbackEl = document.getElementById('seek-feedback');
    feedbackEl.textContent = '请输入你猜的数字';
    feedbackEl.className = 'seek-feedback';
}

// 提交猜测
function submitSeekGuess() {
    if (seekState.isProcessing) return;

    var inputEl = document.getElementById('seek-input');
    var guess = parseInt(inputEl.value);

    if (isNaN(guess) || guess < seekState.rangeMin || guess > seekState.rangeMax) {
        document.getElementById('seek-feedback').textContent =
            '请输入 ' + seekState.rangeMin + ' ~ ' + seekState.rangeMax + ' 之间的数字';
        document.getElementById('seek-feedback').className = 'seek-feedback seek-warn';
        return;
    }

    // 隐藏数字键盘
    if (typeof numpad !== 'undefined') numpad.hide();

    seekState.guessCount++;
    var feedbackEl = document.getElementById('seek-feedback');
    var countEl = document.getElementById('seek-guess-count');
    var rangeEl = document.getElementById('seek-range');

    countEl.textContent = '已猜 ' + seekState.guessCount + ' / ' + seekState.maxGuesses + ' 次';

    if (guess === seekState.targetNumber) {
        // 猜对了
        seekState.correctCount++;
        var bonus = Math.max(0, (seekState.maxGuesses - seekState.guessCount + 1)) * 2;
        seekState.score += 10 + bonus;

        feedbackEl.textContent = '🎉 猜对了！答案就是 ' + seekState.targetNumber;
        feedbackEl.className = 'seek-feedback seek-correct';
        document.getElementById('seek-score-text').textContent = '得分：' + seekState.score;

        playCorrectSound();
        seekState.isProcessing = true;

        setTimeout(function() {
            showNextSeekQuestion();
        }, 1500);

    } else if (seekState.guessCount >= seekState.maxGuesses) {
        // 超过最大猜测次数
        feedbackEl.textContent = '机会用完了！答案是 ' + seekState.targetNumber;
        feedbackEl.className = 'seek-feedback seek-timeout';

        playWrongSound();
        seekState.isProcessing = true;

        setTimeout(function() {
            showNextSeekQuestion();
        }, 2000);

    } else if (guess < seekState.targetNumber) {
        // 小了
        seekState.rangeMin = guess + 1;
        rangeEl.textContent = seekState.rangeMin + ' ~ ' + seekState.rangeMax;
        feedbackEl.textContent = guess + ' 太小了！再大一点 ↗';
        feedbackEl.className = 'seek-feedback seek-small';
        inputEl.value = '';
        playWrongSound();

    } else {
        // 大了
        seekState.rangeMax = guess - 1;
        rangeEl.textContent = seekState.rangeMin + ' ~ ' + seekState.rangeMax;
        feedbackEl.textContent = guess + ' 太大了！再小一点 ↙';
        feedbackEl.className = 'seek-feedback seek-big';
        inputEl.value = '';
        playWrongSound();
    }
}

// 更新计时器
function updateSeekTimer() {
    var elapsed = Math.floor((Date.now() - seekState.startTime) / 1000);
    document.getElementById('seek-timer').textContent = '用时：' + elapsed + '秒';
}

// 完成游戏
function finishSeekGame() {
    if (seekState.timerInterval) clearInterval(seekState.timerInterval);

    var totalTime = Math.floor((Date.now() - seekState.startTime) / 1000);
    var accuracy = Math.round((seekState.correctCount / seekState.totalQuestions) * 100);

    saveSeekRecord(accuracy, totalTime, seekState.totalQuestions, seekState.score);

    // 显示奖励画面
    document.getElementById('seek-reward-score').textContent = seekState.score;
    document.getElementById('seek-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('seek-reward-time').textContent = totalTime;

    playMemoryLevelSound();

    document.getElementById('seek-quiz').style.display = 'none';
    document.getElementById('seek-reward').style.display = 'block';
}

function showSeekRewardResult() {
    var totalTime = Math.floor((Date.now() - seekState.startTime) / 1000);
    var accuracy = Math.round((seekState.correctCount / seekState.totalQuestions) * 100);

    document.getElementById('seek-result-score').textContent = seekState.score;
    document.getElementById('seek-result-correct').textContent = accuracy + '%';
    document.getElementById('seek-result-correct-count').textContent =
        seekState.correctCount + '/' + seekState.totalQuestions;
    document.getElementById('seek-result-time').textContent = totalTime + '秒';

    document.getElementById('seek-reward').style.display = 'none';
    document.getElementById('seek-result').style.display = 'block';
}
