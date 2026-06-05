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
    'k-small':  { count: 3, min: 1, max: 5,   allowDesc: false, questionTypes: ['number'], description: '3个数排序(1-5)' },
    'k-medium': { count: 4, min: 1, max: 10,  allowDesc: false, questionTypes: ['number'], description: '4个数排序(1-10)' },
    'k-large':  { count: 4, min: 1, max: 20,  allowDesc: true,  questionTypes: ['number'], description: '4个数排序(1-20)' },
    'grade-1':  { count: 5, min: 1, max: 30,  allowDesc: true,  questionTypes: ['number'], description: '5个数排序(1-30)' },
    'grade-2':  { count: 5, min: 1, max: 50,  allowDesc: true,  questionTypes: ['number'], description: '5个数排序(1-50)' },
    'grade-3':  { count: 6, min: 1, max: 100, allowDesc: true,  questionTypes: ['number', 'unit'], description: '6个数排序(含单位换算)' },
    'grade-4':  { count: 6, min: -10, max: 100, allowDesc: true, questionTypes: ['number', 'unit'], description: '6个数排序(含负数/单位)' },
    'grade-5':  { count: 7, min: 0, max: 100, allowDesc: true,  questionTypes: ['number', 'unit', 'fraction'], description: '7个数排序(含小数/单位/分数)' },
    'grade-6':  { count: 8, min: 0, max: 100, allowDesc: true,  questionTypes: ['number', 'unit', 'fraction'], description: '8个数排序(含小数/单位/分数)' }
};

// 单位换算类别
var sortUnitCategories = [
    { units: [
        { label: 'km', toBase: 100000, range: [1, 10] },
        { label: 'm',  toBase: 100,    range: [10, 500] },
        { label: 'cm', toBase: 1,      range: [10, 999] }
    ]},
    { units: [
        { label: 'm',  toBase: 100, range: [1, 50] },
        { label: 'cm', toBase: 1,   range: [50, 5000] }
    ]},
    { units: [
        { label: 'km', toBase: 1000, range: [1, 100] },
        { label: 'm',  toBase: 1,    range: [100, 50000] }
    ]},
    { units: [
        { label: 'kg', toBase: 1000, range: [1, 50] },
        { label: 'g',  toBase: 1,    range: [100, 5000] }
    ]},
    { units: [
        { label: '吨', toBase: 1000, range: [1, 20] },
        { label: 'kg', toBase: 1,    range: [100, 5000] }
    ]},
    { units: [
        { label: 'L',  toBase: 1000, range: [1, 20] },
        { label: 'mL', toBase: 1,    range: [100, 5000] }
    ]}
];

// 分数分母配置
var sortFractionDenominators = {
    'grade-5': [2, 3, 4, 5],
    'grade-6': [2, 3, 4, 5, 6, 8, 12]
};

// 最大公约数
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// 获取当前配置
function getSortConfig() {
    return sortGradeConfig[currentGrade] || sortGradeConfig['grade-1'];
}

// 公共结果构建：排序方向、正确顺序、洗牌、分配id
function buildSortResult(items, config) {
    for (var i = 0; i < items.length; i++) {
        items[i].id = i;
    }
    var sortOrder = 'asc';
    if (config.allowDesc && Math.random() < 0.4) {
        sortOrder = 'desc';
    }
    var correctOrder = items.slice().sort(function(a, b) {
        return sortOrder === 'asc' ? a.value - b.value : b.value - a.value;
    });
    var shuffled = items.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    return { numbers: shuffled, correctOrder: correctOrder, sortOrder: sortOrder };
}

// 生成纯数字排序题
function generateNumberSortQuestion(config) {
    var count = config.count;
    var numbers = [];
    var used = {};
    var hasDecimalTypes = config.questionTypes.indexOf('fraction') >= 0;

    while (numbers.length < count) {
        var num;
        if (hasDecimalTypes && Math.random() < 0.3) {
            num = Math.round((Math.random() * config.max + config.min) * 10) / 10;
        } else {
            num = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        }
        var key = num.toString();
        if (!used[key]) {
            used[key] = true;
            var display = Number.isInteger(num) ? num.toString() : num.toFixed(1);
            numbers.push({ display: display, value: num, type: 'number' });
        }
    }
    return buildSortResult(numbers, config);
}

// 生成单位换算排序题
function generateUnitSortQuestion(config) {
    var category = sortUnitCategories[Math.floor(Math.random() * sortUnitCategories.length)];
    var count = config.count;
    var items = [];
    var used = {};

    while (items.length < count) {
        var unit = category.units[Math.floor(Math.random() * category.units.length)];
        var min = unit.range[0], max = unit.range[1];
        var num = Math.floor(Math.random() * (max - min + 1)) + min;
        var value = num * unit.toBase;
        var key = value.toString();
        if (!used[key]) {
            used[key] = true;
            items.push({
                display: num + unit.label,
                value: value,
                type: 'unit'
            });
        }
    }
    return buildSortResult(items, config);
}

// 生成分数排序题
function generateFractionSortQuestion(config) {
    var denominators = sortFractionDenominators[currentGrade] || sortFractionDenominators['grade-5'];
    var count = config.count;
    var items = [];
    var used = {};

    while (items.length < count) {
        var d = denominators[Math.floor(Math.random() * denominators.length)];
        var maxN = (currentGrade === 'grade-6') ? d * 2 : d - 1;
        var n = Math.floor(Math.random() * maxN) + 1;
        var g = gcd(n, d);
        var reducedN = n / g, reducedD = d / g;
        var key = reducedN + '/' + reducedD;
        if (!used[key]) {
            used[key] = true;
            items.push({
                display: n + '/' + d,
                value: n / d,
                type: 'fraction'
            });
        }
    }
    return buildSortResult(items, config);
}

// 生成排序题目（随机选类型）
function generateSortQuestion() {
    var config = getSortConfig();
    var types = config.questionTypes;
    var chosenType = types[Math.floor(Math.random() * types.length)];

    switch (chosenType) {
        case 'unit':     return generateUnitSortQuestion(config);
        case 'fraction': return generateFractionSortQuestion(config);
        default:         return generateNumberSortQuestion(config);
    }
}

// 格式化显示
function formatSortDisplay(item) {
    if (typeof item === 'object' && item !== null && item.display) {
        return item.display;
    }
    if (Number.isInteger(item)) return item.toString();
    return item.toFixed(1);
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
    var hintText = '请从' + (q.sortOrder === 'asc' ? '小到大' : '大到小') + '排列';
    var firstItem = q.correctOrder[0] || q.numbers[0];
    if (firstItem.type === 'unit') {
        hintText += '（注意单位换算）';
    } else if (firstItem.type === 'fraction') {
        hintText += '（比较分数大小）';
    }
    hintText += '：';
    document.getElementById('sort-hint').textContent = hintText;

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
    var needsWide = count > 0 &&
        (sortState.currentNumbers[0].type === 'unit' || sortState.currentNumbers[0].type === 'fraction');

    // 渲染数字按钮
    for (var i = 0; i < count; i++) {
        var btn = document.createElement('button');
        btn.className = 'sort-num-btn';
        if (needsWide) btn.classList.add('wide');
        btn.textContent = formatSortDisplay(sortState.currentNumbers[i]);

        // 检查是否已被放入
        var currentItem = sortState.currentNumbers[i];
        var isPlaced = sortState.userOrder.some(function(u) { return u.id === currentItem.id; });
        if (isPlaced) {
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
        if (needsWide) slot.classList.add('wide');

        if (i < sortState.userOrder.length) {
            slot.textContent = formatSortDisplay(sortState.userOrder[i]);
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

    var item = sortState.currentNumbers[idx];
    // 检查是否已放入
    var alreadyPlaced = sortState.userOrder.some(function(u) { return u.id === item.id; });
    if (alreadyPlaced) return;

    // 放入下一个空格
    sortState.userOrder.push(item);
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
        if (sortState.userOrder[i].id !== sortState.correctOrder[i].id) {
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
        speakCorrect();
        setTimeout(showNextSortQuestion, 1000);
    } else {
        feedback.textContent = '✗ 正确顺序：' + sortState.correctOrder.map(formatSortDisplay).join(' → ');
        feedback.className = 'feedback wrong';
        slots.forEach(function(s) { s.classList.add('wrong'); });
        playWrongSound();
        speakWrong();
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
    speakReward(accuracy);
    setRewardStars('sort-reward-stars', accuracy);

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
