// 快速计算模块
let mathState = {
    difficulty: 20,
    operations: ['+', '-'],
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

// 年级难度配置
const gradeConfig = {
    'k-small': {
        name: '幼儿园小班',
        difficulty: 5,
        operations: ['+'],
        description: '5以内加法'
    },
    'k-medium': {
        name: '幼儿园中班',
        difficulty: 10,
        operations: ['+'],
        description: '10以内加法'
    },
    'k-large': {
        name: '幼儿园大班',
        difficulty: 10,
        operations: ['+', '-'],
        description: '10以内加减法'
    },
    'grade-1': {
        name: '一年级',
        difficulty: 20,
        operations: ['+', '-'],
        description: '20以内加减法'
    },
    'grade-2': {
        name: '二年级',
        difficulty: 50,
        operations: ['+', '-'],
        description: '50以内加减法'
    },
    'grade-3': {
        name: '三年级',
        difficulty: 100,
        operations: ['+', '-'],
        description: '100以内加减法'
    },
    'grade-4': {
        name: '四年级',
        difficulty: 100,
        operations: ['+', '-', '×'],
        description: '100以内加减乘法'
    },
    'grade-5': {
        name: '五年级',
        difficulty: 100,
        operations: ['+', '-', '×', '÷'],
        description: '100以内四则运算'
    },
    'grade-6': {
        name: '六年级',
        difficulty: 100,
        operations: ['+', '-', '×', '÷'],
        description: '100以内四则运算'
    }
};

// 年级顺序
const gradeOrder = ['k-small', 'k-medium', 'k-large', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'];

// 当前选中的年级
let currentGrade = 'grade-1';

// 练习历史记录
let quizHistory = [];

// 选择年级
function selectGrade(btn) {
    document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentGrade = btn.dataset.grade;
    updateGradeDisplay();
    hideGradeChangeNotification();
}

// 更新年级显示
function updateGradeDisplay() {
    const config = gradeConfig[currentGrade];
    document.getElementById('current-grade-name').textContent = config.name;
    document.getElementById('current-difficulty').textContent = config.description;

    // 更新年级按钮状态
    document.querySelectorAll('.grade-btn').forEach(btn => {
        if (btn.dataset.grade === currentGrade) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 自动评估年级
function assessGrade(accuracy, totalTime, questionCount) {
    const avgTimePerQuestion = totalTime / questionCount;
    const currentGradeIndex = gradeOrder.indexOf(currentGrade);

    let newGradeIndex = currentGradeIndex;
    let reason = '';

    // 评估逻辑
    if (accuracy >= 95 && avgTimePerQuestion <= 3) {
        // 优秀：正确率95%以上且平均3秒内
        newGradeIndex = Math.min(currentGradeIndex + 2, gradeOrder.length - 1);
        reason = '表现优秀，连升两级！';
    } else if (accuracy >= 85 && avgTimePerQuestion <= 5) {
        // 良好：正确率85%以上且平均5秒内
        newGradeIndex = Math.min(currentGradeIndex + 1, gradeOrder.length - 1);
        reason = '表现良好，提升一级！';
    } else if (accuracy >= 70) {
        // 一般：保持当前年级
        newGradeIndex = currentGradeIndex;
        reason = '继续加油！';
    } else if (accuracy >= 50) {
        // 较差：可能需要降低
        if (avgTimePerQuestion > 10) {
            newGradeIndex = Math.max(currentGradeIndex - 1, 0);
            reason = '速度较慢，降低一级巩固基础';
        }
    } else {
        // 很差：降低年级
        newGradeIndex = Math.max(currentGradeIndex - 1, 0);
        reason = '需要巩固基础，降低一级';
    }

    // 记录历史
    quizHistory.push({
        grade: currentGrade,
        accuracy: accuracy,
        avgTime: avgTimePerQuestion,
        timestamp: Date.now()
    });

    // 年级变化
    if (newGradeIndex !== currentGradeIndex) {
        const oldGrade = gradeConfig[currentGrade].name;
        currentGrade = gradeOrder[newGradeIndex];
        const newGrade = gradeConfig[currentGrade].name;
        updateGradeDisplay();
        showGradeChangeNotification(oldGrade, newGrade, reason);
        playLevelUpSound();
    }
}

// 显示年级变化通知
function showGradeChangeNotification(oldGrade, newGrade, reason) {
    const notification = document.getElementById('grade-notification');
    notification.innerHTML = `
        <div class="notification-content">
            <button class="notification-close" onclick="hideGradeChangeNotification()">×</button>
            <div class="notification-icon">🎉</div>
            <div class="notification-text">
                <strong>${oldGrade} → ${newGrade}</strong>
                <p>${reason}</p>
            </div>
        </div>
    `;
    notification.style.display = '-webkit-flex';
    notification.style.display = 'flex';

    // 3秒后自动消失
    if (notification._autoTimer) clearTimeout(notification._autoTimer);
    notification._autoTimer = setTimeout(function() {
        hideGradeChangeNotification();
    }, 3000);
}

// 隐藏年级变化通知
function hideGradeChangeNotification() {
    var notification = document.getElementById('grade-notification');
    if (notification._autoTimer) clearTimeout(notification._autoTimer);
    notification.style.display = 'none';
}

// 生成随机数学题
function generateMathQuestion() {
    const config = gradeConfig[currentGrade];
    const max = config.difficulty;
    const operations = config.operations;
    const op = operations[Math.floor(Math.random() * operations.length)];

    let num1, num2, answer, question;

    if (op === '+') {
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * (max - num1)) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2} = ?`;
    } else if (op === '-') {
        num1 = Math.floor(Math.random() * max) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2} = ?`;
    } else if (op === '×') {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2} = ?`;
    } else if (op === '÷') {
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * answer;
        question = `${num1} ÷ ${num2} = ?`;
    }

    return { question, answer };
}

// 创建答案输入框
function createAnswerBoxes(length) {
    const container = document.getElementById('answer-boxes');
    container.innerHTML = '';

    for (let i = 0; i < length; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.inputMode = 'none';
        input.className = 'answer-box';
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('autocorrect', 'off');
        input.setAttribute('autocapitalize', 'off');
        input.setAttribute('spellcheck', 'false');
        input.maxLength = 1;
        input.dataset.index = i;

        input.addEventListener('input', handleBoxInput);
        input.addEventListener('keydown', handleBoxKeydown);
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
function handleBoxInput(e) {
    if (mathState.isProcessing) return;

    const input = e.target;
    const index = parseInt(input.dataset.index);

    // 只允许数字
    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value.length === 1) {
        // 自动跳转到下一个输入框
        const nextInput = input.parentElement.children[index + 1];
        if (nextInput) {
            nextInput.focus();
        } else {
            // 最后一个框已输入，提交答案
            checkMathAnswer();
        }
    }
}

// 处理按键事件（主要是退格键）
function handleBoxKeydown(e) {
    if (mathState.isProcessing) return;

    const input = e.target;
    const index = parseInt(input.dataset.index);

    if (e.key === 'Backspace') {
        if (input.value === '' && index > 0) {
            // 当前框为空，跳转到上一个框
            const prevInput = input.parentElement.children[index - 1];
            prevInput.value = '';
            prevInput.focus();
            e.preventDefault();
        }
    }
}

// 获取所有输入框的值
function getAnswerValue() {
    const inputs = document.querySelectorAll('#answer-boxes .answer-box');
    let value = '';
    inputs.forEach(input => {
        value += input.value;
    });
    return value;
}

// 检查答案
function checkMathAnswer() {
    if (mathState.isProcessing) return;

    const userAnswer = parseInt(getAnswerValue());

    if (isNaN(userAnswer)) return;

    mathState.isProcessing = true;

    // 隐藏数字键盘
    if (typeof numpad !== 'undefined') numpad.hide();

    const feedback = document.getElementById('math-feedback');
    const inputs = document.querySelectorAll('#answer-boxes .answer-box');

    // 禁用所有输入框
    inputs.forEach(input => {
        input.disabled = true;
        input.classList.add('disabled');
    });

    if (userAnswer === mathState.currentAnswer) {
        // 答对了
        mathState.score += 10;
        mathState.correctCount++;
        feedback.textContent = '✓ 回答正确！';
        feedback.className = 'feedback correct';

        // 输入框变绿
        inputs.forEach(input => input.classList.add('correct'));

        // 播放正确音效
        playCorrectSound();

        // 1秒后跳转下一题
        setTimeout(showNextMathQuestion, 1000);
    } else {
        // 答错了
        feedback.textContent = `✗ 正确答案是 ${mathState.currentAnswer}`;
        feedback.className = 'feedback wrong';

        // 输入框变红
        inputs.forEach(input => input.classList.add('wrong'));

        // 播放错误音效
        playWrongSound();

        // 显示下一题按钮
        document.getElementById('next-btn').style.display = 'block';
    }
}

// 开始数学练习
function startMathQuiz() {
    // 重置状态
    mathState.totalQuestions = parseInt(document.getElementById('question-count').value);
    mathState.currentQuestion = 0;
    mathState.score = 0;
    mathState.correctCount = 0;
    mathState.startTime = Date.now();
    mathState.isProcessing = false;

    // 切换显示
    document.getElementById('math-setup').style.display = 'none';
    document.getElementById('math-result').style.display = 'none';
    document.getElementById('math-quiz').style.display = 'block';

    // 清除之前的定时器
    if (mathState.timerInterval) {
        clearInterval(mathState.timerInterval);
    }

    // 开始计时
    mathState.timerInterval = setInterval(updateMathTimer, 1000);

    // 播放开始音效
    playStartSound();

    // 显示第一题
    showNextMathQuestion();
}

// 显示下一题
function showNextMathQuestion() {
    mathState.currentQuestion++;

    if (mathState.currentQuestion > mathState.totalQuestions) {
        finishMathQuiz();
        return;
    }

    // 生成题目
    const { question, answer } = generateMathQuestion();
    mathState.currentAnswer = answer;
    mathState.answerLength = answer.toString().length;
    mathState.isProcessing = false;

    // 更新显示
    document.getElementById('math-question').textContent = question;
    document.getElementById('math-progress').textContent =
        `${mathState.currentQuestion}/${mathState.totalQuestions}`;
    document.getElementById('math-score').textContent = `得分：${mathState.score}`;
    document.getElementById('math-feedback').textContent = '';
    document.getElementById('math-feedback').className = 'feedback';
    document.getElementById('next-btn').style.display = 'none';

    // 创建答案输入框
    createAnswerBoxes(mathState.answerLength);
}

// 更新计时器
function updateMathTimer() {
    const elapsed = Math.floor((Date.now() - mathState.startTime) / 1000);
    document.getElementById('math-timer').textContent = `用时：${elapsed}秒`;
}

// 完成练习
function finishMathQuiz() {
    // 停止计时
    if (mathState.timerInterval) {
        clearInterval(mathState.timerInterval);
    }

    // 隐藏数字键盘
    if (typeof numpad !== 'undefined') numpad.hide();

    const totalTime = Math.floor((Date.now() - mathState.startTime) / 1000);
    const accuracy = Math.round((mathState.correctCount / mathState.totalQuestions) * 100);

    // 自动评估年级
    assessGrade(accuracy, totalTime, mathState.totalQuestions);

    // 保存记录
    saveMathQuizRecord(accuracy, totalTime, mathState.totalQuestions, mathState.score, currentGrade);

    // 显示奖励画面
    document.getElementById('math-reward-score').textContent = mathState.score;
    document.getElementById('math-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('math-reward-time').textContent = totalTime;

    playMemoryLevelSound();

    document.getElementById('math-quiz').style.display = 'none';
    document.getElementById('math-reward').style.display = 'block';
}

function showMathRewardResult() {
    var totalTime = Math.floor((Date.now() - mathState.startTime) / 1000);
    var accuracy = Math.round((mathState.correctCount / mathState.totalQuestions) * 100);

    document.getElementById('result-score').textContent = mathState.score;
    document.getElementById('result-correct').textContent = accuracy + '%';
    document.getElementById('result-time').textContent = totalTime + '秒';

    document.getElementById('math-reward').style.display = 'none';
    document.getElementById('math-result').style.display = 'block';
}

// 初始化年级显示
updateGradeDisplay();
