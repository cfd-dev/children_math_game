// 比大小游戏模块
var compareState = {
    totalQuestions: 20,
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    startTime: null,
    timerInterval: null,
    currentAnswer: null, // '>', '<', '='
    isProcessing: false
};

// 按年级的题目配置
var compareGradeConfig = {
    'k-small':   { mode: 'number', maxNum: 10,  description: '10以内比大小' },
    'k-medium':  { mode: 'number', maxNum: 20,  description: '20以内比大小' },
    'k-large':   { mode: 'number', maxNum: 20,  description: '20以内比大小' },
    'grade-1':   { mode: 'mixed',  maxNum: 30,  maxOp: 1, ops: ['+', '-'], description: '30以内数字与算式比大小' },
    'grade-2':   { mode: 'mixed',  maxNum: 50,  maxOp: 1, ops: ['+', '-'], description: '50以内算式比大小' },
    'grade-3':   { mode: 'expr',   maxNum: 50,  maxOp: 2, ops: ['+', '-', '×'], description: '含乘法算式比大小' },
    'grade-4':   { mode: 'expr',   maxNum: 100, maxOp: 2, ops: ['+', '-', '×'], description: '混合算式比大小' },
    'grade-5':   { mode: 'expr',   maxNum: 100, maxOp: 2, ops: ['+', '-', '×', '÷'], description: '四则运算比大小' },
    'grade-6':   { mode: 'expr',   maxNum: 200, maxOp: 2, ops: ['+', '-', '×', '÷'], description: '高难度算式比大小' }
};

// 获取当前年级配置
function getCompareConfig() {
    return compareGradeConfig[currentGrade] || compareGradeConfig['grade-1'];
}

// 生成一个随机数（确保为正整数）
function cmpRandNum(max) {
    return Math.floor(Math.random() * max) + 1;
}

// 生成一个算式 { text: '12 + 5', value: 17 }
function cmpGenerateExpr(config) {
    var ops = config.ops;
    var op = ops[Math.floor(Math.random() * ops.length)];
    var num1, num2, value;

    if (op === '+') {
        num1 = cmpRandNum(config.maxNum);
        num2 = cmpRandNum(config.maxNum - num1);
        value = num1 + num2;
    } else if (op === '-') {
        num1 = cmpRandNum(config.maxNum);
        num2 = cmpRandNum(num1);
        value = num1 - num2;
    } else if (op === '×') {
        num1 = cmpRandNum(12);
        num2 = cmpRandNum(12);
        value = num1 * num2;
    } else { // ÷
        num2 = cmpRandNum(12);
        value = cmpRandNum(12);
        num1 = num2 * value;
    }

    return { text: num1 + ' ' + op + ' ' + num2, value: value };
}

// 生成比较题目
function generateCompareQuestion() {
    var config = getCompareConfig();
    var left, right, answer;

    if (config.mode === 'number') {
        // 纯数字比较
        var a = cmpRandNum(config.maxNum);
        var b = cmpRandNum(config.maxNum);
        // 降低"="的概率，让游戏更有趣
        if (Math.random() < 0.15) b = a;
        left = { text: a.toString(), value: a };
        right = { text: b.toString(), value: b };
    } else if (config.mode === 'mixed') {
        // 混合模式：一边是数字，一边是算式
        var expr = cmpGenerateExpr(config);
        var num = cmpRandNum(config.maxNum);
        if (Math.random() < 0.5) {
            left = { text: num.toString(), value: num };
            right = expr;
        } else {
            left = expr;
            right = { text: num.toString(), value: num };
        }
        // 有时让两边相等
        if (Math.random() < 0.1) {
            var e = cmpGenerateExpr(config);
            left = e;
            right = { text: e.value.toString(), value: e.value };
        }
    } else {
        // 两边都是算式
        var l = cmpGenerateExpr(config);
        var r = cmpGenerateExpr(config);
        // 避免两边完全相同
        while (l.value === r.value) {
            r = cmpGenerateExpr(config);
        }
        left = l;
        right = r;
        // 10%概率让两边相等
        if (Math.random() < 0.1) {
            r = { text: l.value.toString(), value: l.value };
            left = l;
            right = r;
        }
    }

    if (left.value > right.value) answer = '>';
    else if (left.value < right.value) answer = '<';
    else answer = '=';

    return { left: left, right: right, answer: answer };
}

// 开始比大小游戏
function startCompareGame() {
    compareState.totalQuestions = parseInt(document.getElementById('compare-question-count').value);
    compareState.currentQuestion = 0;
    compareState.score = 0;
    compareState.correctCount = 0;
    compareState.startTime = Date.now();
    compareState.isProcessing = false;

    document.getElementById('compare-setup').style.display = 'none';
    document.getElementById('compare-result').style.display = 'none';
    document.getElementById('compare-reward').style.display = 'none';
    document.getElementById('compare-quiz').style.display = 'block';

    if (compareState.timerInterval) {
        clearInterval(compareState.timerInterval);
    }

    compareState.timerInterval = setInterval(updateCompareTimer, 1000);
    playStartSound();
    showNextCompareQuestion();
}

// 显示下一题
function showNextCompareQuestion() {
    compareState.currentQuestion++;

    if (compareState.currentQuestion > compareState.totalQuestions) {
        finishCompareGame();
        return;
    }

    var q = generateCompareQuestion();
    compareState.currentAnswer = q.answer;
    compareState.isProcessing = false;

    document.getElementById('compare-left').textContent = q.left.text;
    document.getElementById('compare-right').textContent = q.right.text;

    document.getElementById('compare-progress').textContent =
        compareState.currentQuestion + '/' + compareState.totalQuestions;
    document.getElementById('compare-score-text').textContent = '得分：' + compareState.score;
    document.getElementById('compare-feedback').textContent = '';
    document.getElementById('compare-feedback').className = 'feedback';
    document.getElementById('compare-next-btn').style.display = 'none';
    document.getElementById('compare-symbol').textContent = '？';

    // 重置按钮状态
    var btns = document.querySelectorAll('.compare-choice-btn');
    btns.forEach(function(btn) {
        btn.disabled = false;
        btn.classList.remove('selected', 'correct', 'wrong');
    });
}

// 选择答案
function chooseCompare(symbol) {
    if (compareState.isProcessing) return;
    compareState.isProcessing = true;

    var feedback = document.getElementById('compare-feedback');
    var symbolDisplay = document.getElementById('compare-symbol');
    var btns = document.querySelectorAll('.compare-choice-btn');

    // 禁用所有按钮
    btns.forEach(function(btn) {
        btn.disabled = true;
        if (btn.dataset.symbol === symbol) {
            btn.classList.add('selected');
        }
    });

    // 显示选择的符号
    symbolDisplay.textContent = symbol;

    if (symbol === compareState.currentAnswer) {
        // 答对了
        compareState.score += 10;
        compareState.correctCount++;
        feedback.textContent = '✓ 回答正确！';
        feedback.className = 'feedback correct';
        symbolDisplay.classList.add('correct');
        btns.forEach(function(btn) {
            if (btn.dataset.symbol === symbol) btn.classList.add('correct');
        });
        playCorrectSound();
        speakCorrect();
        setTimeout(showNextCompareQuestion, 1000);
    } else {
        // 答错了
        feedback.textContent = '✗ 正确答案是 ' + compareState.currentAnswer;
        feedback.className = 'feedback wrong';
        symbolDisplay.classList.add('wrong');
        btns.forEach(function(btn) {
            if (btn.dataset.symbol === compareState.currentAnswer) btn.classList.add('correct');
            if (btn.dataset.symbol === symbol) btn.classList.add('wrong');
        });
        playWrongSound();
        speakWrong();
        document.getElementById('compare-next-btn').style.display = 'block';
    }
}

// 更新计时器
function updateCompareTimer() {
    var elapsed = Math.floor((Date.now() - compareState.startTime) / 1000);
    document.getElementById('compare-timer').textContent = '用时：' + elapsed + '秒';
}

// 完成游戏
function finishCompareGame() {
    if (compareState.timerInterval) {
        clearInterval(compareState.timerInterval);
    }

    var totalTime = Math.floor((Date.now() - compareState.startTime) / 1000);
    var accuracy = Math.round((compareState.correctCount / compareState.totalQuestions) * 100);

    // 保存记录
    saveCompareRecord(accuracy, totalTime, compareState.totalQuestions, compareState.score);
    assessGrade(accuracy, totalTime, compareState.totalQuestions);

    // 显示奖励画面
    document.getElementById('compare-reward-score').textContent = compareState.score;
    document.getElementById('compare-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('compare-reward-time').textContent = totalTime;

    playMemoryLevelSound();
    speakReward(accuracy);

    document.getElementById('compare-quiz').style.display = 'none';
    document.getElementById('compare-reward').style.display = 'block';
}

// 从奖励画面进入详细结果
function showCompareRewardResult() {
    var totalTime = Math.floor((Date.now() - compareState.startTime) / 1000);
    var accuracy = Math.round((compareState.correctCount / compareState.totalQuestions) * 100);

    document.getElementById('compare-result-score').textContent = compareState.score;
    document.getElementById('compare-result-correct').textContent = accuracy + '%';
    document.getElementById('compare-result-time').textContent = totalTime + '秒';

    document.getElementById('compare-reward').style.display = 'none';
    document.getElementById('compare-result').style.display = 'block';
}
