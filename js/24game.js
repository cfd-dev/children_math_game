// 24点游戏模块 — 计算器自由输入模式
var twentyFourState = {
    totalQuestions: 10,
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    currentNumbers: [],
    currentTarget: 24,
    allSolutions: [],
    solutionCount: 0,
    userExpression: '',
    startTime: null,
    timerInterval: null,
    isProcessing: false,
    viewedAnswer: false,
    isPractice: false
};

// 年级难度配置
var twentyFourGradeConfig = {
    'k-small':  { numRange: 5,  ops: ['+', '-'],            target: 10, description: '4个数算10（加减）' },
    'k-medium': { numRange: 5,  ops: ['+', '-'],            target: 12, description: '4个数算12（加减）' },
    'k-large':  { numRange: 9,  ops: ['+', '-'],            target: 20, description: '4个数算20（加减）' },
    'grade-1':  { numRange: 9,  ops: ['+', '-'],            target: 20, description: '4个数算20（加减）' },
    'grade-2':  { numRange: 9,  ops: ['+', '-', '*', '/'],   target: 24, description: '经典24点（加减乘除+括号）' },
    'grade-3':  { numRange: 13, ops: ['+', '-', '*', '/'],   target: 24, description: '经典24点（1-13）' },
    'grade-4':  { numRange: 13, ops: ['+', '-', '*', '/'],   target: 24, description: '经典24点（进阶）' },
    'grade-5':  { numRange: 13, ops: ['+', '-', '*', '/'],   target: 24, description: '经典24点（进阶）' },
    'grade-6':  { numRange: 13, ops: ['+', '-', '*', '/'],   target: 24, description: '经典24点（挑战）' }
};

function get24Config() {
    return twentyFourGradeConfig[currentGrade] || twentyFourGradeConfig['grade-1'];
}

// ========== 排列生成 ==========
function permute24(arr) {
    var results = [];
    function backtrack(start) {
        if (start === arr.length) {
            results.push(arr.slice());
            return;
        }
        for (var i = start; i < arr.length; i++) {
            var tmp = arr[start]; arr[start] = arr[i]; arr[i] = tmp;
            backtrack(start + 1);
            tmp = arr[start]; arr[start] = arr[i]; arr[i] = tmp;
        }
    }
    backtrack(0);
    return results;
}

// ========== 安全表达式求值（递归下降解析器）==========
function safeEval24(expr) {
    var pos = 0;
    var str = expr.replace(/\s+/g, '');

    function parseExpr() {
        var val = parseTerm();
        while (pos < str.length && (str[pos] === '+' || str[pos] === '-')) {
            var op = str[pos++];
            var right = parseTerm();
            val = (op === '+') ? val + right : val - right;
        }
        return val;
    }

    function parseTerm() {
        var val = parseFactor();
        while (pos < str.length && (str[pos] === '*' || str[pos] === '/')) {
            var op = str[pos++];
            var right = parseFactor();
            if (op === '*') val = val * right;
            else {
                if (right === 0) throw new Error('Division by zero');
                val = val / right;
            }
        }
        return val;
    }

    function parseFactor() {
        if (pos < str.length && str[pos] === '-') {
            pos++;
            return -parseFactor();
        }
        if (pos < str.length && str[pos] === '(') {
            pos++;
            var val = parseExpr();
            if (pos >= str.length || str[pos] !== ')') throw new Error('Missing )');
            pos++;
            return val;
        }
        var start = pos;
        while (pos < str.length && str[pos] >= '0' && str[pos] <= '9') pos++;
        if (pos === start) throw new Error('Expected number at pos ' + pos);
        return parseInt(str.substring(start, pos));
    }

    var result = parseExpr();
    if (pos !== str.length) throw new Error('Unexpected char at pos ' + pos);
    return result;
}

// ========== 运算符显示符号 ==========
function opDisplay(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    if (op === '-') return '−';
    return op;
}

// ========== 24点求解器 ==========
function applyOp(val, op, num) {
    if (op === '+') return val + num;
    if (op === '-') return val - num;
    if (op === '*') return val * num;
    if (op === '/') return (num !== 0 && val % num === 0) ? val / num : NaN;
    return NaN;
}

// 无括号求解（低年级）
function solve24Flat(numbers, target, allowedOps) {
    var perms = permute24(numbers.slice());
    for (var p = 0; p < perms.length; p++) {
        var a = perms[p][0], b = perms[p][1], c = perms[p][2], d = perms[p][3];
        for (var i = 0; i < allowedOps.length; i++) {
            for (var j = 0; j < allowedOps.length; j++) {
                for (var k = 0; k < allowedOps.length; k++) {
                    var o1 = allowedOps[i], o2 = allowedOps[j], o3 = allowedOps[k];
                    var val = applyOp(applyOp(applyOp(a, o1, b), o2, c), o3, d);
                    if (Math.abs(val - target) < 0.001) {
                        return a + o1 + b + o2 + c + o3 + d;
                    }
                }
            }
        }
    }
    return null;
}

// 带括号求解（高年级）
function solve24(numbers, target, allowedOps) {
    var perms = permute24(numbers.slice());
    for (var p = 0; p < perms.length; p++) {
        var a = perms[p][0], b = perms[p][1], c = perms[p][2], d = perms[p][3];
        for (var i = 0; i < allowedOps.length; i++) {
            for (var j = 0; j < allowedOps.length; j++) {
                for (var k = 0; k < allowedOps.length; k++) {
                    var o1 = allowedOps[i], o2 = allowedOps[j], o3 = allowedOps[k];
                    var trees = [
                        '(' + a + o1 + b + ')' + o2 + '(' + c + o3 + d + ')',
                        '((' + a + o1 + b + ')' + o2 + c + ')' + o3 + d,
                        '(' + a + o1 + '(' + b + o2 + c + '))' + o3 + d,
                        a + o1 + '((' + b + o2 + c + ')' + o3 + d + ')',
                        a + o1 + '(' + b + o2 + '(' + c + o3 + d + '))'
                    ];
                    for (var t = 0; t < trees.length; t++) {
                        try {
                            var val = safeEval24(trees[t]);
                            if (Math.abs(val - target) < 0.001) {
                                return trees[t];
                            }
                        } catch (e) { /* skip */ }
                    }
                }
            }
        }
    }
    return null;
}

// ========== 查找所有可能的算式 ==========
function findAllSolutions(numbers, target, allowedOps) {
    var found = {};
    var perms = permute24(numbers.slice());
    var isFlat = (allowedOps.length <= 2 && allowedOps.indexOf('*') === -1);

    for (var p = 0; p < perms.length; p++) {
        var a = perms[p][0], b = perms[p][1], c = perms[p][2], d = perms[p][3];
        for (var i = 0; i < allowedOps.length; i++) {
            for (var j = 0; j < allowedOps.length; j++) {
                for (var k = 0; k < allowedOps.length; k++) {
                    var o1 = allowedOps[i], o2 = allowedOps[j], o3 = allowedOps[k];

                    if (isFlat) {
                        // 无括号：左到右
                        var flatExpr = a + o1 + b + o2 + c + o3 + d;
                        try {
                            var flatVal = applyOp(applyOp(applyOp(a, o1, b), o2, c), o3, d);
                            if (Math.abs(flatVal - target) < 0.001 && !found[flatExpr]) {
                                found[flatExpr] = true;
                            }
                        } catch (e) { /* skip */ }
                    } else {
                        // 有括号：5种树形
                        var trees = [
                            '(' + a + o1 + b + ')' + o2 + '(' + c + o3 + d + ')',
                            '((' + a + o1 + b + ')' + o2 + c + ')' + o3 + d,
                            '(' + a + o1 + '(' + b + o2 + c + '))' + o3 + d,
                            a + o1 + '((' + b + o2 + c + ')' + o3 + d + ')',
                            a + o1 + '(' + b + o2 + '(' + c + o3 + d + '))'
                        ];
                        for (var t = 0; t < trees.length; t++) {
                            try {
                                var val = safeEval24(trees[t]);
                                if (Math.abs(val - target) < 0.001 && !found[trees[t]]) {
                                    found[trees[t]] = true;
                                }
                            } catch (e) { /* skip */ }
                        }
                    }
                }
            }
        }
    }

    var results = [];
    for (var key in found) {
        if (found.hasOwnProperty(key)) results.push(key);
    }
    return results;
}

// ========== 生成题目 ==========
function generate24Puzzle() {
    var config = get24Config();
    var range = config.numRange;
    var target = config.target;
    var ops = config.ops;

    for (var attempt = 0; attempt < 50; attempt++) {
        var nums = [];
        for (var i = 0; i < 4; i++) {
            nums.push(Math.floor(Math.random() * range) + 1);
        }
        var solutions = findAllSolutions(nums, target, ops);
        if (solutions.length > 0) {
            return { numbers: nums, target: target, solutions: solutions, solutionCount: solutions.length };
        }
    }

    // 回退：用小数构造 a+b+c+d=target
    var a2 = 1, b2 = 1, c2 = 1, d2 = target - 3;
    if (d2 >= 1 && d2 <= range) {
        var fbExpr = a2 + '+' + b2 + '+' + c2 + '+' + d2;
        return { numbers: [a2, b2, c2, d2], target: target, solutions: [fbExpr], solutionCount: 1 };
    }
    var fb = Math.min(target, range);
    var fbExpr2 = '1+1+1+' + fb;
    return { numbers: [1, 1, 1, fb], target: target, solutions: [fbExpr2], solutionCount: 1 };
}

// ========== 验证玩家表达式 ==========
function validate24Expression(expr, numbers, target) {
    if (!/^[0-9+\-*/() ]+$/.test(expr)) {
        return { valid: false, error: '包含非法字符' };
    }

    var usedNums = expr.match(/\d+/g);
    if (!usedNums) return { valid: false, error: '未输入数字' };
    usedNums = usedNums.map(Number).sort(function(a, b) { return a - b; });
    var sorted = numbers.slice().sort(function(a, b) { return a - b; });

    if (usedNums.length !== 4) {
        return { valid: false, error: '必须使用4个数字（你用了' + usedNums.length + '个）' };
    }
    for (var i = 0; i < 4; i++) {
        if (usedNums[i] !== sorted[i]) {
            return { valid: false, error: '使用的数字不正确，应为 ' + sorted.join(', ') };
        }
    }

    var result;
    try {
        result = safeEval24(expr);
    } catch (e) {
        return { valid: false, error: '表达式格式错误' };
    }

    if (Math.abs(result - target) < 0.001) {
        return { valid: true };
    }
    return { valid: false, error: '结果是 ' + (Math.round(result * 100) / 100) + '，不是 ' + target };
}

// ========== 更新计算器显示屏 ==========
function updateCalcScreen() {
    var screen = document.getElementById('twentyfour-calc-screen');
    if (screen) {
        screen.textContent = twentyFourState.userExpression || '';
        // 自动滚动到右侧
        screen.scrollLeft = screen.scrollWidth;
    }
}

// ========== 处理键盘输入 ==========
function handle24KeyInput(key) {
    if (twentyFourState.isProcessing) return;

    if (key === 'C') {
        clear24Input();
        return;
    }
    if (key === '←') {
        twentyFourState.userExpression = twentyFourState.userExpression.slice(0, -1);
        updateCalcScreen();
        playClickSound();
        return;
    }
    if (key === '=') {
        check24Answer();
        return;
    }

    // 追加字符到表达式
    twentyFourState.userExpression += key;
    updateCalcScreen();
    playClickSound();
}

// ========== 清空输入 ==========
function clear24Input() {
    twentyFourState.userExpression = '';
    updateCalcScreen();
    twentyFourState.viewedAnswer = false;
    var answerBtn = document.getElementById('twentyfour-answer-btn');
    if (answerBtn) answerBtn.style.display = 'inline-block';
    var solutionsDiv = document.getElementById('twentyfour-all-solutions');
    if (solutionsDiv) solutionsDiv.style.display = 'none';
    var feedback = document.getElementById('twentyfour-feedback');
    if (feedback) { feedback.textContent = ''; feedback.className = 'feedback'; }
    var screen = document.getElementById('twentyfour-calc-screen');
    if (screen) screen.classList.remove('correct', 'wrong');
}

// ========== 查看答案 ==========
function show24Answer() {
    if (!twentyFourState.allSolutions || twentyFourState.allSolutions.length === 0) return;

    twentyFourState.viewedAnswer = true;
    var answerBtn = document.getElementById('twentyfour-answer-btn');
    if (answerBtn) answerBtn.style.display = 'none';

    // 显示所有可能的算式
    var solutionsDiv = document.getElementById('twentyfour-all-solutions');
    if (solutionsDiv) {
        var html = '<div class="solutions-title">所有可能的算式（' + twentyFourState.allSolutions.length + '种）：</div>';
        html += '<div class="solutions-list">';
        for (var i = 0; i < twentyFourState.allSolutions.length; i++) {
            var expr = twentyFourState.allSolutions[i];
            // 美化显示：* → ×，/ → ÷
            var display = expr.replace(/\*/g, '×').replace(/\//g, '÷');
            html += '<div class="solution-item">' + display + ' = ' + twentyFourState.currentTarget + '</div>';
        }
        html += '</div>';
        solutionsDiv.innerHTML = html;
        solutionsDiv.style.display = 'block';
    }

    var feedback = document.getElementById('twentyfour-feedback');
    feedback.textContent = '答案已显示，按 = 进入下一题';
    feedback.className = 'feedback';
}

// ========== 检查答案 ==========
function check24Answer() {
    if (twentyFourState.isProcessing) return;
    twentyFourState.isProcessing = true;

    var feedback = document.getElementById('twentyfour-feedback');
    var screen = document.getElementById('twentyfour-calc-screen');

    if (twentyFourState.viewedAnswer) {
        feedback.textContent = '✗ 已查看答案，不得分';
        feedback.className = 'feedback wrong';
        playWrongSound();
        setTimeout(function() { showNext24Question(); }, 1500);
        return;
    }

    var expr = twentyFourState.userExpression.trim();
    if (!expr) {
        feedback.textContent = '✗ 请输入算式';
        feedback.className = 'feedback wrong';
        twentyFourState.isProcessing = false;
        return;
    }

    var result = validate24Expression(expr, twentyFourState.currentNumbers, twentyFourState.currentTarget);

    if (result.valid) {
        twentyFourState.correctCount++;
        var roundScore = 10;
        twentyFourState.score += roundScore;

        if (screen) screen.classList.add('correct');
        feedback.textContent = '✓ 正确！+' + roundScore + '分';
        feedback.className = 'feedback correct';
        playCorrectSound();
        speakCorrect();

        setTimeout(function() { showNext24Question(); }, 1200);
    } else {
        if (screen) screen.classList.add('wrong');
        feedback.textContent = '✗ ' + result.error;
        feedback.className = 'feedback wrong';
        playWrongSound();
        speakWrong();

        if (twentyFourState.isPractice) {
            feedback.textContent = '✗ ' + result.error + '，再试试';
            setTimeout(function() {
                if (screen) screen.classList.remove('wrong');
                twentyFourState.isProcessing = false;
            }, 1500);
        } else {
            setTimeout(function() {
                if (screen) screen.classList.remove('wrong');
                twentyFourState.isProcessing = false;
            }, 500);
        }
    }
}

// ========== 游戏生命周期 ==========
function start24Game(practice) {
    var countSelect = document.getElementById('twentyfour-question-count');
    twentyFourState.totalQuestions = parseInt(countSelect ? countSelect.value : '10');
    twentyFourState.currentQuestion = 0;
    twentyFourState.score = 0;
    twentyFourState.correctCount = 0;
    twentyFourState.isProcessing = false;
    twentyFourState.isPractice = !!practice;
    twentyFourState.startTime = Date.now();

    if (twentyFourState.timerInterval) clearInterval(twentyFourState.timerInterval);
    twentyFourState.timerInterval = setInterval(update24Timer, 1000);

    playStartSound();
    showNext24Question();

    document.getElementById('twentyfour-setup').style.display = 'none';
    document.getElementById('twentyfour-result').style.display = 'none';
    document.getElementById('twentyfour-quiz').style.display = 'block';
}

function showNext24Question() {
    twentyFourState.isProcessing = false;
    twentyFourState.currentQuestion++;

    if (twentyFourState.currentQuestion > twentyFourState.totalQuestions) {
        finish24Game();
        return;
    }

    var puzzle = generate24Puzzle();
    twentyFourState.currentNumbers = puzzle.numbers;
    twentyFourState.currentTarget = puzzle.target;
    twentyFourState.allSolutions = puzzle.solutions;
    twentyFourState.solutionCount = puzzle.solutionCount;
    twentyFourState.userExpression = '';
    twentyFourState.viewedAnswer = false;

    // 更新显示
    document.getElementById('twentyfour-progress').textContent =
        '第 ' + twentyFourState.currentQuestion + '/' + twentyFourState.totalQuestions + ' 题';
    document.getElementById('twentyfour-score').textContent = '得分：' + twentyFourState.score;

    var numsContainer = document.getElementById('twentyfour-numbers');
    numsContainer.innerHTML = '';
    puzzle.numbers.forEach(function(n) {
        var box = document.createElement('span');
        box.className = 'twentyfour-num-box';
        box.textContent = n;
        numsContainer.appendChild(box);
    });

    document.getElementById('twentyfour-target-text').textContent = puzzle.target;
    document.getElementById('twentyfour-solution-count').textContent = puzzle.solutionCount;

    // 重置界面
    updateCalcScreen();
    var answerBtn = document.getElementById('twentyfour-answer-btn');
    if (answerBtn) answerBtn.style.display = 'inline-block';
    var solutionsDiv = document.getElementById('twentyfour-all-solutions');
    if (solutionsDiv) solutionsDiv.style.display = 'none';
    var screen = document.getElementById('twentyfour-calc-screen');
    if (screen) screen.classList.remove('correct', 'wrong');

    var feedback = document.getElementById('twentyfour-feedback');
    feedback.textContent = '';
    feedback.className = 'feedback';
}

function update24Timer() {
    var elapsed = Math.floor((Date.now() - twentyFourState.startTime) / 1000);
    var el = document.getElementById('twentyfour-timer');
    if (el) el.textContent = '用时：' + elapsed + '秒';
}

function finish24Game() {
    if (twentyFourState.timerInterval) clearInterval(twentyFourState.timerInterval);

    var totalTime = Math.floor((Date.now() - twentyFourState.startTime) / 1000);
    var accuracy = Math.round((twentyFourState.correctCount / twentyFourState.totalQuestions) * 100);

    if (!twentyFourState.isPractice) {
        save24Record(accuracy, totalTime, twentyFourState.totalQuestions, twentyFourState.score);
    }

    var rewardTitle = document.querySelector('#twentyfour-reward h3');
    if (rewardTitle) rewardTitle.textContent = twentyFourState.isPractice ? '练习完成！' : '挑战完成！';
    document.getElementById('twentyfour-reward-score').textContent = twentyFourState.score;
    document.getElementById('twentyfour-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('twentyfour-reward-time').textContent = totalTime;

    playMemoryLevelSound();
    speakReward(accuracy);
    setRewardStars('twentyfour-reward-stars', accuracy);

    document.getElementById('twentyfour-quiz').style.display = 'none';
    document.getElementById('twentyfour-reward').style.display = 'block';
}

function show24RewardResult() {
    var totalTime = Math.floor((Date.now() - twentyFourState.startTime) / 1000);
    var accuracy = Math.round((twentyFourState.correctCount / twentyFourState.totalQuestions) * 100);

    document.getElementById('twentyfour-result-score').textContent = twentyFourState.score;
    document.getElementById('twentyfour-result-accuracy').textContent = accuracy + '%';
    document.getElementById('twentyfour-result-correct').textContent =
        twentyFourState.correctCount + '/' + twentyFourState.totalQuestions;
    document.getElementById('twentyfour-result-time').textContent = totalTime;

    document.getElementById('twentyfour-reward').style.display = 'none';
    document.getElementById('twentyfour-result').style.display = 'block';
}
