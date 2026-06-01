// 24点游戏模块
var twentyFourState = {
    totalQuestions: 10,
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    currentNumbers: [],
    currentTarget: 24,
    currentSolution: null,
    startTime: null,
    timerInterval: null,
    isProcessing: false
};

// 年级难度配置
var twentyFourGradeConfig = {
    'k-small':  { numRange: 5,  ops: ['+', '-'],            target: 10, description: '4个数算10（加减）' },
    'k-medium': { numRange: 5,  ops: ['+', '-', '*'],        target: 12, description: '4个数算12（加减乘）' },
    'k-large':  { numRange: 9,  ops: ['+', '-', '*'],        target: 20, description: '4个数算20（加减乘）' },
    'grade-1':  { numRange: 9,  ops: ['+', '-', '*', '/'],   target: 24, description: '经典24点（1-9）' },
    'grade-2':  { numRange: 13, ops: ['+', '-', '*', '/'],   target: 24, description: '经典24点（1-13）' },
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

// ========== 24点求解器 ==========
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
        var solution = solve24(nums, target, ops);
        if (solution) {
            return { numbers: nums, target: target, solution: solution };
        }
    }

    // 回退：构造一个保证有解的组合
    var a = Math.floor(Math.random() * range) + 1;
    var b = Math.floor(Math.random() * range) + 1;
    var c = Math.floor(Math.random() * range) + 1;
    var d = target - a - b - c;
    if (d >= 1 && d <= range) {
        var nums2 = [a, b, c, d];
        var solution2 = solve24(nums2, target, ops);
        if (solution2) return { numbers: nums2, target: target, solution: solution2 };
    }
    // 最终回退
    return { numbers: [1, 2, 3, 4], target: target, solution: solve24([1, 2, 3, 4], target, ops) || '1+2+3+4' };
}

// ========== 验证玩家表达式 ==========
function validate24Expression(expr, numbers, target) {
    // 检查非法字符
    if (!/^[0-9+\-*/() ]+$/.test(expr)) {
        return { valid: false, error: '包含非法字符' };
    }

    // 提取数字
    var usedNums = expr.match(/\d+/g);
    if (!usedNums) return { valid: false, error: '未输入数字' };
    usedNums = usedNums.map(Number).sort(function(a, b) { return a - b; });
    var sorted = numbers.slice().sort(function(a, b) { return a - b; });

    if (usedNums.length !== 4) {
        return { valid: false, error: '必须使用4个数字' };
    }
    for (var i = 0; i < 4; i++) {
        if (usedNums[i] !== sorted[i]) {
            return { valid: false, error: '使用的数字不正确' };
        }
    }

    // 求值
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

// ========== 游戏生命周期 ==========
function start24Game() {
    var countSelect = document.getElementById('twentyfour-question-count');
    twentyFourState.totalQuestions = parseInt(countSelect ? countSelect.value : '10');
    twentyFourState.currentQuestion = 0;
    twentyFourState.score = 0;
    twentyFourState.correctCount = 0;
    twentyFourState.isProcessing = false;
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
    twentyFourState.currentSolution = puzzle.solution;

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

    // 清空输入
    clear24Input();
    var feedback = document.getElementById('twentyfour-feedback');
    feedback.textContent = '';
    feedback.className = 'feedback';
}

function check24Answer() {
    if (twentyFourState.isProcessing) return;

    var input = document.getElementById('twentyfour-input');
    var expr = input.value.trim();
    if (!expr) return;

    twentyFourState.isProcessing = true;
    var feedback = document.getElementById('twentyfour-feedback');

    var result = validate24Expression(expr, twentyFourState.currentNumbers, twentyFourState.currentTarget);

    if (result.valid) {
        twentyFourState.correctCount++;
        var roundScore = 10;
        twentyFourState.score += roundScore;

        feedback.textContent = '✓ 正确！+' + roundScore + '分';
        feedback.className = 'feedback correct';
        playCorrectSound();
        speakCorrect();

        setTimeout(function() {
            showNext24Question();
        }, 1200);
    } else {
        feedback.textContent = '✗ ' + result.error;
        feedback.className = 'feedback wrong';
        playWrongSound();
        speakWrong();

        // 显示提示按钮
        var hintBtn = document.getElementById('twentyfour-hint-btn');
        if (hintBtn) hintBtn.style.display = 'inline-block';

        setTimeout(function() {
            twentyFourState.isProcessing = false;
        }, 500);
    }
}

function show24Hint() {
    if (twentyFourState.currentSolution) {
        var input = document.getElementById('twentyfour-input');
        input.value = twentyFourState.currentSolution;
        var hintBtn = document.getElementById('twentyfour-hint-btn');
        if (hintBtn) hintBtn.style.display = 'none';
    }
}

function handle24KeyInput(key) {
    var input = document.getElementById('twentyfour-input');
    if (key === 'C') {
        input.value = '';
    } else if (key === '←') {
        input.value = input.value.slice(0, -1);
    } else if (key === '=') {
        check24Answer();
    } else if (key === 'hint') {
        show24Hint();
    } else {
        if (input.value.length < 30) {
            input.value += key;
        }
    }
}

function clear24Input() {
    var input = document.getElementById('twentyfour-input');
    if (input) input.value = '';
    var hintBtn = document.getElementById('twentyfour-hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';
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

    save24Record(accuracy, totalTime, twentyFourState.totalQuestions, twentyFourState.score);

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
