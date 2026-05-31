// 数字排序游戏模块
var sortState = {
    totalQuestions: 20,
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    startTime: null,
    timerInterval: null,
    currentNumbers: [],
    correctOrder: [],
    userOrder: [],
    sortOrder: 'asc',
    isProcessing: false
};

// 按年级的题目配置
var sortGradeConfig = {
    'k-small':  { count: 3, min: 1, max: 5,   allowDesc: false, description: '3个数排序(1-5)' },
    'k-medium': { count: 4, min: 1, max: 10,  allowDesc: false, description: '4个数排序(1-10)' },
    'k-large':  { count: 4, min: 1, max: 20,  allowDesc: true,  description: '4个数排序(1-20)' },
    'grade-1':  { count: 5, min: 1, max: 30,  allowDesc: true,  description: '5个数排序(1-30)' },
    'grade-2':  { count: 5, min: 1, max: 50,  allowDesc: true,  description: '5个数排序(1-50)' },
    'grade-3':  { count: 6, min: 1, max: 100, allowDesc: true,  description: '6个数排序(1-100)' },
    'grade-4':  { count: 6, min: -10, max: 100, allowDesc: true, description: '6个数排序(含负数)' },
    'grade-5':  { count: 7, min: 0, max: 100, allowDesc: true, hasDecimals: true, description: '7个数排序(含小数)' },
    'grade-6':  { count: 8, min: 0, max: 100, allowDesc: true, hasDecimals: true, description: '8个数排序(含小数)' }
};

// 获取当前配置
function getSortConfig() {
    return sortGradeConfig[currentGrade] || sortGradeConfig['grade-1'];
}

// 生成排序题目
function generateSortQuestion() {
    var config = getSortConfig();
    var count = config.count;
    var numbers = [];
    var used = {};

    // 生成不重复的随机数
    while (numbers.length < count) {
        var num;
        if (config.hasDecimals) {
            num = Math.round((Math.random() * config.max + config.min) * 10) / 10;
        } else {
            num = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        }
        var key = num.toString();
        if (!used[key]) {
            used[key] = true;
            numbers.push(num);
        }
    }

    // 确定排序方向
    var sortOrder = 'asc';
    if (config.allowDesc && Math.random() < 0.4) {
        sortOrder = 'desc';
    }

    // 计算正确排序
    var correctOrder = numbers.slice().sort(function(a, b) {
        return sortOrder === 'asc' ? a - b : b - a;
    });

    // 打乱展示顺序（Fisher-Yates）
    var shuffled = numbers.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }

    return {
        numbers: shuffled,
        correctOrder: correctOrder,
        sortOrder: sortOrder
    };
}

// 格式化数字显示
function formatSortNum(num) {
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(1);
}

// 开始游戏
function startSortGame() {
    sortState.totalQuestions = parseInt(document.getElementById('sort-question-count').value);
    sortState.currentQuestion = 0;
    sortState.score = 0;
    sortState.correctCount = 0;
    sortState.startTime = Date.now();
    sortState.isProcessing = false;

    document.getElementById('sort-setup').style.display = 'none';
    document.getElementById('sort-result').style.display = 'none';
    document.getElementById('sort-quiz').style.display = 'block';

    if (sortState.timerInterval) clearInterval(sortState.timerInterval);
    sortState.timerInterval = setInterval(updateSortTimer, 1000);

    playStartSound();
    showNextSortQuestion();
}

// 显示下一题
function showNextSortQuestion() {
    sortState.currentQuestion++;
    if (sortState.currentQuestion > sortState.totalQuestions) {
        finishSortGame();
        return;
    }

    var q = generateSortQuestion();
    sortState.currentNumbers = q.numbers;
    sortState.correctOrder = q.correctOrder;
    sortState.sortOrder = q.sortOrder;
    sortState.userOrder = [];
    sortState.isProcessing = false;

    // 更新提示
    document.getElementById('sort-hint').textContent =
        '请从' + (q.sortOrder === 'asc' ? '小到大' : '大到小') + '排列：';

    document.getElementById('sort-progress').textContent =
        sortState.currentQuestion + '/' + sortState.totalQuestions;
    document.getElementById('sort-score-text').textContent = '得分：' + sortState.score;
    document.getElementById('sort-feedback').textContent = '';
    document.getElementById('sort-feedback').className = 'feedback';
    document.getElementById('sort-next-btn').style.display = 'none';

    renderSortInterface();
}

// 渲染排序界面
function renderSortInterface() {
    var numbersContainer = document.getElementById('sort-numbers');
    var slotsContainer = document.getElementById('sort-slots');
    numbersContainer.innerHTML = '';
    slotsContainer.innerHTML = '';

    var count = sortState.currentNumbers.length;

    // 渲染数字按钮
    for (var i = 0; i < count; i++) {
        var btn = document.createElement('button');
        btn.className = 'sort-num-btn';
        btn.textContent = formatSortNum(sortState.currentNumbers[i]);
        btn.dataset.index = i;
        btn.dataset.value = sortState.currentNumbers[i];

        // 检查是否已被放入
        var placedIdx = sortState.userOrder.indexOf(sortState.currentNumbers[i]);
        if (placedIdx >= 0) {
            btn.classList.add('selected');
        }

        btn.addEventListener('click', (function(idx) {
            return function() { handleSortNumClick(idx); };
        })(i));

        numbersContainer.appendChild(btn);
    }

    // 渲染空格
    for (var i = 0; i < count; i++) {
        var slot = document.createElement('div');
        slot.className = 'sort-slot';
        slot.dataset.slotIndex = i;

        if (i < sortState.userOrder.length) {
            slot.textContent = formatSortNum(sortState.userOrder[i]);
            slot.classList.add('filled');
            slot.addEventListener('click', (function(idx) {
                return function() { handleSortSlotClick(idx); };
            })(i));
        }

        slotsContainer.appendChild(slot);
    }
}

// 点击数字按钮
function handleSortNumClick(idx) {
    if (sortState.isProcessing) return;

    var num = sortState.currentNumbers[idx];
    // 检查是否已放入
    if (sortState.userOrder.indexOf(num) >= 0) return;

    // 放入下一个空格
    sortState.userOrder.push(num);
    playClickSound();
    renderSortInterface();

    // 检查是否全部放满
    if (sortState.userOrder.length === sortState.currentNumbers.length) {
        checkSortAnswer();
    }
}

// 点击已放好的空格（撤回）
function handleSortSlotClick(slotIdx) {
    if (sortState.isProcessing) return;
    if (slotIdx >= sortState.userOrder.length) return;

    sortState.userOrder.splice(slotIdx, 1);
    playClickSound();
    renderSortInterface();
}

// 检查答案
function checkSortAnswer() {
    sortState.isProcessing = true;

    var correct = true;
    for (var i = 0; i < sortState.correctOrder.length; i++) {
        if (sortState.userOrder[i] !== sortState.correctOrder[i]) {
            correct = false;
            break;
        }
    }

    var feedback = document.getElementById('sort-feedback');
    var slots = document.querySelectorAll('.sort-slot');

    if (correct) {
        sortState.score += 10;
        sortState.correctCount++;
        feedback.textContent = '✓ 排列正确！';
        feedback.className = 'feedback correct';
        slots.forEach(function(s) { s.classList.add('correct'); });
        playCorrectSound();
        setTimeout(showNextSortQuestion, 1000);
    } else {
        feedback.textContent = '✗ 正确顺序：' + sortState.correctOrder.map(formatSortNum).join(' → ');
        feedback.className = 'feedback wrong';
        slots.forEach(function(s) { s.classList.add('wrong'); });
        playWrongSound();
        document.getElementById('sort-next-btn').style.display = 'block';
    }
}

// 更新计时器
function updateSortTimer() {
    var elapsed = Math.floor((Date.now() - sortState.startTime) / 1000);
    document.getElementById('sort-timer').textContent = '用时：' + elapsed + '秒';
}

// 完成游戏
function finishSortGame() {
    if (sortState.timerInterval) clearInterval(sortState.timerInterval);

    var totalTime = Math.floor((Date.now() - sortState.startTime) / 1000);
    var accuracy = Math.round((sortState.correctCount / sortState.totalQuestions) * 100);

    saveSortRecord(accuracy, totalTime, sortState.totalQuestions, sortState.score);
    assessGrade(accuracy, totalTime, sortState.totalQuestions);

    // 显示奖励画面
    document.getElementById('sort-reward-score').textContent = sortState.score;
    document.getElementById('sort-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('sort-reward-time').textContent = totalTime;

    playMemoryLevelSound();

    document.getElementById('sort-quiz').style.display = 'none';
    document.getElementById('sort-reward').style.display = 'block';
}

function showSortRewardResult() {
    var totalTime = Math.floor((Date.now() - sortState.startTime) / 1000);
    var accuracy = Math.round((sortState.correctCount / sortState.totalQuestions) * 100);

    document.getElementById('sort-result-score').textContent = sortState.score;
    document.getElementById('sort-result-correct').textContent = accuracy + '%';
    document.getElementById('sort-result-time').textContent = totalTime + '秒';

    document.getElementById('sort-reward').style.display = 'none';
    document.getElementById('sort-result').style.display = 'block';
}
