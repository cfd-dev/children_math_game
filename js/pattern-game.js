// 找规律游戏模块
var patternState = {
    totalQuestions: 20,
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    startTime: null,
    timerInterval: null,
    currentAnswer: null,
    answerLength: 0,
    isProcessing: false
};

// 按年级的题目配置
var patternGradeConfig = {
    'k-small': { types: ['arith'], seqLength: 4, maxNum: 10, maxStep: 2, description: '简单递增数列' },
    'k-medium': { types: ['arith'], seqLength: 4, maxNum: 15, maxStep: 3, description: '递增递减数列' },
    'k-large': { types: ['arith'], seqLength: 5, maxNum: 20, maxStep: 5, description: '加减规律数列' },
    'grade-1': { types: ['arith', 'oddEven'], seqLength: 5, maxNum: 30, maxStep: 5, description: '等差与奇偶数列' },
    'grade-2': { types: ['arith', 'oddEven'], seqLength: 6, maxNum: 50, maxStep: 10, description: '多种等差数列' },
    'grade-3': { types: ['arith', 'geometric', 'alternating'], seqLength: 6, maxNum: 100, maxStep: 15, description: '等差等比与交替' },
    'grade-4': { types: ['arith', 'geometric', 'fibonacci', 'alternating'], seqLength: 6, maxNum: 100, maxStep: 20, description: '斐波那契与交替数列' },
    'grade-5': { types: ['arith', 'geometric', 'fibonacci', 'square', 'alternating'], seqLength: 7, maxNum: 150, maxStep: 25, description: '综合数列推理' },
    'grade-6': { types: ['arith', 'geometric', 'fibonacci', 'square', 'alternating'], seqLength: 8, maxNum: 200, maxStep: 30, description: '高难度数列推理' }
};

// 获取当前年级的题目配置
function getPatternConfig() {
    return patternGradeConfig[currentGrade] || patternGradeConfig['grade-1'];
}

// 数列生成器
var patternGenerators = {
    // 等差数列
    arith: function(config) {
        var length = config.seqLength;
        var step = Math.floor(Math.random() * config.maxStep) + 1;
        if (Math.random() < 0.3) step = -step; // 30%概率递减
        var maxStart = config.maxNum - step * (length - 1);
        if (maxStart < 1) maxStart = config.maxNum;
        var start = Math.floor(Math.random() * maxStart) + 1;
        // 确保所有数为正
        var seq = [];
        for (var i = 0; i < length; i++) {
            var val = start + step * i;
            if (val <= 0) {
                // 重新生成
                start = Math.abs(step) * length + 1;
                i = -1;
                seq = [];
                continue;
            }
            seq.push(val);
        }
        return seq;
    },

    // 奇偶数列
    oddEven: function(config) {
        var length = config.seqLength;
        var isOdd = Math.random() < 0.5;
        var start = isOdd ? (Math.floor(Math.random() * 5) * 2 + 1) : (Math.floor(Math.random() * 5) * 2 + 2);
        var step = 2;
        var seq = [];
        for (var i = 0; i < length; i++) {
            seq.push(start + step * i);
        }
        return seq;
    },

    // 等比数列
    geometric: function(config) {
        var length = config.seqLength;
        var ratio = Math.random() < 0.5 ? 2 : 3;
        var maxStart = Math.floor(config.maxNum / Math.pow(ratio, length - 1));
        if (maxStart < 1) maxStart = 1;
        var start = Math.floor(Math.random() * maxStart) + 1;
        var seq = [];
        for (var i = 0; i < length; i++) {
            seq.push(start * Math.pow(ratio, i));
        }
        return seq;
    },

    // 类斐波那契（前两个数之和等于下一个）
    fibonacci: function(config) {
        var length = config.seqLength;
        var a = Math.floor(Math.random() * 5) + 1;
        var b = Math.floor(Math.random() * 5) + 1;
        var seq = [a, b];
        for (var i = 2; i < length; i++) {
            seq.push(seq[i - 1] + seq[i - 2]);
            if (seq[i] > config.maxNum) {
                // 超出范围，用简单等差代替
                return patternGenerators.arith(config);
            }
        }
        return seq;
    },

    // 平方数列 (1,4,9,16,25...)
    square: function(config) {
        var length = config.seqLength;
        var startN = Math.floor(Math.random() * 3) + 1;
        var seq = [];
        for (var i = 0; i < length; i++) {
            var val = (startN + i) * (startN + i);
            if (val > config.maxNum) {
                return patternGenerators.arith(config);
            }
            seq.push(val);
        }
        return seq;
    },

    // 交替数列（两个子规律交替出现）
    alternating: function(config) {
        var length = config.seqLength;
        var step1 = Math.floor(Math.random() * 5) + 1;
        var step2 = Math.floor(Math.random() * 5) + 1;
        var start = Math.floor(Math.random() * 10) + 1;
        var seq = [];
        for (var i = 0; i < length; i++) {
            if (i % 2 === 0) {
                seq.push(start + step1 * Math.floor(i / 2));
            } else {
                seq.push(start + 10 + step2 * Math.floor(i / 2));
            }
            if (seq[i] > config.maxNum) {
                return patternGenerators.arith(config);
            }
        }
        return seq;
    }
};

// 生成找规律题目
function generatePatternQuestion() {
    var config = getPatternConfig();
    var typeIndex = Math.floor(Math.random() * config.types.length);
    var type = config.types[typeIndex];
    var seq = patternGenerators[type](config);

    // 随机选择一个位置作为答案（不选第一个和最后一个，避免太简单）
    var blankIndex = Math.floor(Math.random() * (seq.length - 2)) + 1;
    var answer = seq[blankIndex];

    return {
        sequence: seq,
        blankIndex: blankIndex,
        answer: answer
    };
}

// 开始找规律游戏
function startPatternGame() {
    // 重置状态
    patternState.totalQuestions = parseInt(document.getElementById('pattern-question-count').value);
    patternState.currentQuestion = 0;
    patternState.score = 0;
    patternState.correctCount = 0;
    patternState.startTime = Date.now();
    patternState.isProcessing = false;

    // 切换显示
    document.getElementById('pattern-setup').style.display = 'none';
    document.getElementById('pattern-result').style.display = 'none';
    document.getElementById('pattern-quiz').style.display = 'block';

    // 清除之前的定时器
    if (patternState.timerInterval) {
        clearInterval(patternState.timerInterval);
    }

    // 开始计时
    patternState.timerInterval = setInterval(updatePatternTimer, 1000);

    // 播放开始音效
    playStartSound();

    // 显示第一题
    showNextPatternQuestion();
}

// 显示下一题
function showNextPatternQuestion() {
    patternState.currentQuestion++;

    if (patternState.currentQuestion > patternState.totalQuestions) {
        finishPatternGame();
        return;
    }

    // 生成题目
    var q = generatePatternQuestion();
    patternState.currentAnswer = q.answer;
    patternState.answerLength = q.answer.toString().length;
    patternState.isProcessing = false;

    // 更新显示
    var displayContainer = document.getElementById('pattern-display');
    displayContainer.innerHTML = '';
    for (var i = 0; i < q.sequence.length; i++) {
        var numBox = document.createElement('span');
        numBox.className = 'pattern-num-box';
        if (i === q.blankIndex) {
            numBox.textContent = '?';
            numBox.classList.add('pattern-blank');
        } else {
            numBox.textContent = q.sequence[i];
        }
        displayContainer.appendChild(numBox);
    }

    document.getElementById('pattern-progress').textContent =
        patternState.currentQuestion + '/' + patternState.totalQuestions;
    document.getElementById('pattern-score-text').textContent = '得分：' + patternState.score;
    document.getElementById('pattern-feedback').textContent = '';
    document.getElementById('pattern-feedback').className = 'feedback';
    document.getElementById('pattern-next-btn').style.display = 'none';

    // 创建答案输入框
    createPatternAnswerBoxes(patternState.answerLength);
}

// 创建答案输入框
function createPatternAnswerBoxes(length) {
    var container = document.getElementById('pattern-answer-boxes');
    container.innerHTML = '';

    for (var i = 0; i < length; i++) {
        var input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'none';
        input.className = 'answer-box';
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('spellcheck', 'false');
        input.maxLength = 1;
        input.dataset.index = i;

        input.addEventListener('input', handlePatternBoxInput);
        input.addEventListener('keydown', handlePatternBoxKeydown);
        input.addEventListener('focus', function() {
            this.select();
            if (typeof numpad !== 'undefined') numpad.show(this);
        });
        input.addEventListener('touchstart', function() {
            if (typeof numpad !== 'undefined') numpad.show(this);
        }, { passive: true });

        container.appendChild(input);
    }

    // 聚焦第一个输入框
    if (container.children.length > 0) {
        container.children[0].focus();
    }
}

// 处理输入框输入
function handlePatternBoxInput(e) {
    if (patternState.isProcessing) return;

    var input = e.target;
    var index = parseInt(input.dataset.index);

    // 只允许数字
    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value.length === 1) {
        var nextInput = input.parentElement.children[index + 1];
        if (nextInput) {
            nextInput.focus();
        } else {
            checkPatternAnswer();
        }
    }
}

// 处理按键事件
function handlePatternBoxKeydown(e) {
    if (patternState.isProcessing) return;

    var input = e.target;
    var index = parseInt(input.dataset.index);

    if (e.key === 'Backspace') {
        if (input.value === '' && index > 0) {
            var prevInput = input.parentElement.children[index - 1];
            prevInput.value = '';
            prevInput.focus();
            e.preventDefault();
        }
    }
}

// 获取答案值
function getPatternAnswerValue() {
    var inputs = document.querySelectorAll('#pattern-answer-boxes .answer-box');
    var value = '';
    inputs.forEach(function(input) {
        value += input.value;
    });
    return value;
}

// 检查答案
function checkPatternAnswer() {
    if (patternState.isProcessing) return;

    var userAnswer = parseInt(getPatternAnswerValue());
    if (isNaN(userAnswer)) return;

    patternState.isProcessing = true;

    // 隐藏数字键盘
    if (typeof numpad !== 'undefined') numpad.hide();

    var feedback = document.getElementById('pattern-feedback');
    var inputs = document.querySelectorAll('#pattern-answer-boxes .answer-box');

    // 禁用输入框
    inputs.forEach(function(input) {
        input.disabled = true;
        input.classList.add('disabled');
    });

    if (userAnswer === patternState.currentAnswer) {
        // 答对了
        patternState.score += 10;
        patternState.correctCount++;
        feedback.textContent = '✓ 回答正确！';
        feedback.className = 'feedback correct';
        inputs.forEach(function(input) { input.classList.add('correct'); });
        playCorrectSound();
        speakCorrect();
        setTimeout(showNextPatternQuestion, 1000);
    } else {
        // 答错了
        feedback.textContent = '✗ 正确答案是 ' + patternState.currentAnswer;
        feedback.className = 'feedback wrong';
        inputs.forEach(function(input) { input.classList.add('wrong'); });
        playWrongSound();
        speakWrong();
        document.getElementById('pattern-next-btn').style.display = 'block';
    }
}

// 更新计时器
function updatePatternTimer() {
    var elapsed = Math.floor((Date.now() - patternState.startTime) / 1000);
    document.getElementById('pattern-timer').textContent = '用时：' + elapsed + '秒';
}

// 完成游戏
function finishPatternGame() {
    if (patternState.timerInterval) {
        clearInterval(patternState.timerInterval);
    }

    if (typeof numpad !== 'undefined') numpad.hide();

    var totalTime = Math.floor((Date.now() - patternState.startTime) / 1000);
    var accuracy = Math.round((patternState.correctCount / patternState.totalQuestions) * 100);

    // 保存记录
    savePatternRecord(accuracy, totalTime, patternState.totalQuestions, patternState.score);

    // 评估年级
    assessGrade(accuracy, totalTime, patternState.totalQuestions);

    // 显示奖励画面
    document.getElementById('pattern-reward-score').textContent = patternState.score;
    document.getElementById('pattern-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('pattern-reward-time').textContent = totalTime;

    playMemoryLevelSound();
    speakReward(accuracy);
    setRewardStars('pattern-reward-stars', accuracy);

    document.getElementById('pattern-quiz').style.display = 'none';
    document.getElementById('pattern-reward').style.display = 'block';
}

function showPatternRewardResult() {
    var totalTime = Math.floor((Date.now() - patternState.startTime) / 1000);
    var accuracy = Math.round((patternState.correctCount / patternState.totalQuestions) * 100);

    document.getElementById('pattern-result-score').textContent = patternState.score;
    document.getElementById('pattern-result-correct').textContent = accuracy + '%';
    document.getElementById('pattern-result-time').textContent = totalTime + '秒';

    document.getElementById('pattern-reward').style.display = 'none';
    document.getElementById('pattern-result').style.display = 'block';
}
