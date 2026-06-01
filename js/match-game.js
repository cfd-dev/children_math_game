// 数学连线游戏模块
var matchState = {
    pairs: [],
    leftItems: [],
    rightItems: [],
    selectedLeft: -1,
    selectedRight: -1,
    matched: [],
    score: 0,
    totalPairs: 0,
    startTime: null,
    timerInterval: null,
    isProcessing: false
};

// 按年级的题目配置
var matchGradeConfig = {
    'k-small':  { pairCount: 3, maxNum: 5,   ops: ['+'], description: '3对加法连线(5以内)' },
    'k-medium': { pairCount: 4, maxNum: 10,  ops: ['+'], description: '4对加法连线(10以内)' },
    'k-large':  { pairCount: 4, maxNum: 10,  ops: ['+', '-'], description: '4对加减连线(10以内)' },
    'grade-1':  { pairCount: 5, maxNum: 20,  ops: ['+', '-'], description: '5对加减连线(20以内)' },
    'grade-2':  { pairCount: 6, maxNum: 50,  ops: ['+', '-'], description: '6对加减连线(50以内)' },
    'grade-3':  { pairCount: 6, maxNum: 100, ops: ['+', '-', '×'], description: '6对混合连线' },
    'grade-4':  { pairCount: 7, maxNum: 100, ops: ['+', '-', '×', '÷'], description: '7对四则连线' },
    'grade-5':  { pairCount: 8, maxNum: 200, ops: ['+', '-', '×', '÷'], description: '8对四则连线' },
    'grade-6':  { pairCount: 8, maxNum: 500, ops: ['+', '-', '×', '÷'], description: '8对四则连线(大数)' }
};

// 获取当前配置
function getMatchConfig() {
    return matchGradeConfig[currentGrade] || matchGradeConfig['grade-1'];
}

// 生成一个算式
function matchGenerateExpr(config) {
    var ops = config.ops;
    var op = ops[Math.floor(Math.random() * ops.length)];
    var num1, num2, value, text;

    if (op === '+') {
        num1 = Math.floor(Math.random() * config.maxNum) + 1;
        num2 = Math.floor(Math.random() * (config.maxNum - num1)) + 1;
        value = num1 + num2;
        text = num1 + ' + ' + num2;
    } else if (op === '-') {
        num1 = Math.floor(Math.random() * config.maxNum) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        value = num1 - num2;
        text = num1 + ' - ' + num2;
    } else if (op === '×') {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        value = num1 * num2;
        text = num1 + ' × ' + num2;
    } else { // ÷
        num2 = Math.floor(Math.random() * 12) + 1;
        value = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * value;
        text = num1 + ' ÷ ' + num2;
    }

    return { text: text, value: value };
}

// 生成连线题目
function generateMatchQuestion() {
    var config = getMatchConfig();
    var pairCount = config.pairCount;
    var pairs = [];
    var usedValues = {};
    var usedTexts = {};

    var attempts = 0;
    while (pairs.length < pairCount && attempts < 500) {
        attempts++;
        var expr = matchGenerateExpr(config);
        // 确保算式和答案都不重复
        if (usedValues[expr.value] || usedTexts[expr.text]) continue;
        usedValues[expr.value] = true;
        usedTexts[expr.text] = true;
        pairs.push(expr);
    }

    // 左列：算式（保持顺序）
    var leftItems = pairs.map(function(p) { return p.text; });

    // 右列：答案（打乱）
    var rightItems = pairs.map(function(p) { return p.value.toString(); });
    for (var i = rightItems.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = rightItems[i]; rightItems[i] = rightItems[j]; rightItems[j] = tmp;
    }

    return {
        pairs: pairs,
        leftItems: leftItems,
        rightItems: rightItems
    };
}

// 开始游戏
function startMatchGame() {
    matchState.score = 0;
    matchState.totalPairs = getMatchConfig().pairCount;
    matchState.startTime = Date.now();
    matchState.isProcessing = false;

    document.getElementById('match-setup').style.display = 'none';
    document.getElementById('match-result').style.display = 'none';
    document.getElementById('match-quiz').style.display = 'block';

    if (matchState.timerInterval) clearInterval(matchState.timerInterval);
    matchState.timerInterval = setInterval(updateMatchTimer, 1000);

    playStartSound();
    showMatchQuestion();
}

// 显示题目
function showMatchQuestion() {
    var q = generateMatchQuestion();
    matchState.pairs = q.pairs;
    matchState.leftItems = q.leftItems;
    matchState.rightItems = q.rightItems;
    matchState.selectedLeft = -1;
    matchState.selectedRight = -1;
    matchState.matched = new Array(q.pairs.length).fill(false);
    matchState.score = 0;

    document.getElementById('match-progress').textContent = '已配对：0/' + q.pairs.length;
    document.getElementById('match-score-text').textContent = '得分：0';
    document.getElementById('match-feedback').textContent = '';
    document.getElementById('match-feedback').className = 'feedback';

    renderMatchItems();
}

// 渲染连线界面
function renderMatchItems() {
    var leftContainer = document.getElementById('match-left');
    var rightContainer = document.getElementById('match-right');
    leftContainer.innerHTML = '';
    rightContainer.innerHTML = '';

    // 左列：算式
    for (var i = 0; i < matchState.leftItems.length; i++) {
        var item = document.createElement('div');
        item.className = 'match-item';
        item.textContent = matchState.leftItems[i];
        item.dataset.index = i;

        if (matchState.matched[i]) {
            item.classList.add('matched');
        } else if (i === matchState.selectedLeft) {
            item.classList.add('selected');
        }

        item.addEventListener('click', (function(idx) {
            return function() { handleLeftTap(idx); };
        })(i));

        leftContainer.appendChild(item);
    }

    // 右列：答案
    for (var i = 0; i < matchState.rightItems.length; i++) {
        var item = document.createElement('div');
        item.className = 'match-item';
        item.textContent = matchState.rightItems[i];
        item.dataset.index = i;

        // 检查该答案是否已匹配
        var isMatched = false;
        for (var j = 0; j < matchState.pairs.length; j++) {
            if (matchState.matched[j] && matchState.pairs[j].value.toString() === matchState.rightItems[i]) {
                isMatched = true;
                break;
            }
        }

        if (isMatched) {
            item.classList.add('matched');
        } else if (i === matchState.selectedRight) {
            item.classList.add('selected');
        }

        item.addEventListener('click', (function(idx) {
            return function() { handleRightTap(idx); };
        })(i));

        rightContainer.appendChild(item);
    }
}

// 点击左列
function handleLeftTap(idx) {
    if (matchState.isProcessing) return;
    if (matchState.matched[idx]) return;

    matchState.selectedLeft = idx;
    playClickSound();
    renderMatchItems();

    // 如果右列已选中，判断配对
    if (matchState.selectedRight >= 0) {
        checkMatchPair();
    }
}

// 点击右列
function handleRightTap(idx) {
    if (matchState.isProcessing) return;

    // 检查该答案是否已匹配
    for (var j = 0; j < matchState.pairs.length; j++) {
        if (matchState.matched[j] && matchState.pairs[j].value.toString() === matchState.rightItems[idx]) {
            return;
        }
    }

    matchState.selectedRight = idx;
    playClickSound();
    renderMatchItems();

    // 如果左列已选中，判断配对
    if (matchState.selectedLeft >= 0) {
        checkMatchPair();
    }
}

// 检查配对
function checkMatchPair() {
    matchState.isProcessing = true;

    var leftIdx = matchState.selectedLeft;
    var rightIdx = matchState.selectedRight;
    var leftValue = matchState.pairs[leftIdx].value;
    var rightValue = parseInt(matchState.rightItems[rightIdx]);

    var leftItems = document.querySelectorAll('#match-left .match-item');
    var rightItems = document.querySelectorAll('#match-right .match-item');

    if (leftValue === rightValue) {
        // 正确配对
        matchState.matched[leftIdx] = true;
        matchState.score += 10;

        leftItems[leftIdx].classList.add('matched');
        rightItems[rightIdx].classList.add('matched');

        document.getElementById('match-score-text').textContent = '得分：' + matchState.score;

        var matchedCount = matchState.matched.filter(function(m) { return m; }).length;
        document.getElementById('match-progress').textContent =
            '已配对：' + matchedCount + '/' + matchState.pairs.length;

        matchState.selectedLeft = -1;
        matchState.selectedRight = -1;
        matchState.isProcessing = false;

        playCorrectSound();
        speakCorrect();

        // 检查是否全部完成
        if (matchedCount >= matchState.pairs.length) {
            setTimeout(finishMatchGame, 800);
        }
    } else {
        // 错误配对
        leftItems[leftIdx].classList.add('wrong-flash');
        rightItems[rightIdx].classList.add('wrong-flash');
        playWrongSound();
        speakWrong();

        setTimeout(function() {
            matchState.selectedLeft = -1;
            matchState.selectedRight = -1;
            matchState.isProcessing = false;
            renderMatchItems();
        }, 600);
    }
}

// 更新计时器
function updateMatchTimer() {
    var elapsed = Math.floor((Date.now() - matchState.startTime) / 1000);
    document.getElementById('match-timer').textContent = '用时：' + elapsed + '秒';
}

// 完成游戏
function finishMatchGame() {
    if (matchState.timerInterval) clearInterval(matchState.timerInterval);

    var totalTime = Math.floor((Date.now() - matchState.startTime) / 1000);
    var matchedCount = matchState.matched.filter(function(m) { return m; }).length;
    var accuracy = Math.round((matchedCount / matchState.pairs.length) * 100);

    saveMatchRecord(accuracy, totalTime, matchState.pairs.length, matchState.score);

    // 显示奖励画面
    document.getElementById('match-reward-score').textContent = matchState.score;
    document.getElementById('match-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('match-reward-time').textContent = totalTime;

    playMemoryLevelSound();
    speakReward(accuracy);
    setRewardStars('match-reward-stars', accuracy);

    document.getElementById('match-quiz').style.display = 'none';
    document.getElementById('match-reward').style.display = 'block';
}

function showMatchRewardResult() {
    var totalTime = Math.floor((Date.now() - matchState.startTime) / 1000);
    var matchedCount = matchState.matched.filter(function(m) { return m; }).length;
    var accuracy = Math.round((matchedCount / matchState.pairs.length) * 100);

    document.getElementById('match-result-score').textContent = matchState.score;
    document.getElementById('match-result-correct').textContent = accuracy + '%';
    document.getElementById('match-result-time').textContent = totalTime + '秒';

    document.getElementById('match-reward').style.display = 'none';
    document.getElementById('match-result').style.display = 'block';
}
