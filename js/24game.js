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
    isProcessing: false,
    viewedAnswer: false,
    // 新增：填空/构建模式
    mode: 'fill',       // 'fill' 或 'build'
    tokens: [],          // 解析后的表达式token数组
    blanks: [],          // 需要填空的位置索引
    blankValues: [],     // 每个空的正确答案
    selectedBlank: -1,   // 当前选中的空
    userInputs: []       // 用户填入的值
};

// 年级难度配置
// 一年级及以下：只用加减，无括号（flat求解）
// 二年级起：学乘除法，引入括号（完整求解）
var twentyFourGradeConfig = {
    'k-small':  { numRange: 5,  ops: ['+', '-'],            target: 10, blanks: 1, mode: 'fill',  description: '4个数算10（加减填空）' },
    'k-medium': { numRange: 5,  ops: ['+', '-'],            target: 12, blanks: 1, mode: 'fill',  description: '4个数算12（加减填空）' },
    'k-large':  { numRange: 9,  ops: ['+', '-'],            target: 20, blanks: 2, mode: 'fill',  description: '4个数算20（加减填空）' },
    'grade-1':  { numRange: 9,  ops: ['+', '-'],            target: 20, blanks: 2, mode: 'fill',  description: '4个数算20（加减填空）' },
    'grade-2':  { numRange: 9,  ops: ['+', '-', '*', '/'],   target: 24, blanks: 0, mode: 'build', description: '经典24点（加减乘除+括号）' },
    'grade-3':  { numRange: 13, ops: ['+', '-', '*', '/'],   target: 24, blanks: 0, mode: 'build', description: '经典24点（1-13）' },
    'grade-4':  { numRange: 13, ops: ['+', '-', '*', '/'],   target: 24, blanks: 0, mode: 'build', description: '经典24点（进阶）' },
    'grade-5':  { numRange: 13, ops: ['+', '-', '*', '/'],   target: 24, blanks: 0, mode: 'build', description: '经典24点（进阶）' },
    'grade-6':  { numRange: 13, ops: ['+', '-', '*', '/'],   target: 24, blanks: 0, mode: 'build', description: '经典24点（挑战）' }
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
// 无括号的平铺求解（低年级用：连加连减连乘，左到右依次计算）
function applyOp(val, op, num) {
    if (op === '+') return val + num;
    if (op === '-') return val - num;
    if (op === '*') return val * num;
    if (op === '/') return (num !== 0) ? val / num : NaN;
    return NaN;
}

function solve24Flat(numbers, target, allowedOps) {
    var perms = permute24(numbers.slice());
    for (var p = 0; p < perms.length; p++) {
        var a = perms[p][0], b = perms[p][1], c = perms[p][2], d = perms[p][3];
        for (var i = 0; i < allowedOps.length; i++) {
            for (var j = 0; j < allowedOps.length; j++) {
                for (var k = 0; k < allowedOps.length; k++) {
                    var o1 = allowedOps[i], o2 = allowedOps[j], o3 = allowedOps[k];
                    var expr = a + o1 + b + o2 + c + o3 + d;
                    var val = applyOp(applyOp(applyOp(a, o1, b), o2, c), o3, d);
                    if (Math.abs(val - target) < 0.001) {
                        return expr;
                    }
                }
            }
        }
    }
    return null;
}

// 带括号的求解（高年级用）
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
    var solver = (config.mode === 'fill') ? solve24Flat : solve24;

    for (var attempt = 0; attempt < 50; attempt++) {
        var nums = [];
        for (var i = 0; i < 4; i++) {
            nums.push(Math.floor(Math.random() * range) + 1);
        }
        var solution = solver(nums, target, ops);
        if (solution) {
            return { numbers: nums, target: target, solution: solution };
        }
    }

    // 回退：用小数构造 a+b+c+d=target
    var a2 = 1, b2 = 1, c2 = 1, d2 = target - 3;
    if (d2 >= 1 && d2 <= range) {
        return { numbers: [a2, b2, c2, d2], target: target, solution: a2 + '+' + b2 + '+' + c2 + '+' + d2 };
    }
    // 最终回退
    var fb = Math.min(target, range);
    return { numbers: [1, 1, 1, fb], target: target, solution: '1+1+1+' + fb };
}

// ========== 表达式分词 ==========
function tokenize(expr) {
    var tokens = [];
    var i = 0;
    while (i < expr.length) {
        if (expr[i] === ' ') { i++; continue; }
        if (expr[i] >= '0' && expr[i] <= '9') {
            var num = '';
            while (i < expr.length && expr[i] >= '0' && expr[i] <= '9') {
                num += expr[i++];
            }
            tokens.push({ type: 'number', value: num });
        } else {
            tokens.push({ type: 'op', value: expr[i] });
            i++;
        }
    }
    return tokens;
}

// ========== 运算符显示符号 ==========
function opDisplay(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    if (op === '-') return '−';
    return op;
}

// ========== 生成填空位置 ==========
function generateBlanks(tokens, count) {
    var numIndices = [];
    for (var i = 0; i < tokens.length; i++) {
        if (tokens[i].type === 'number') numIndices.push(i);
    }
    // 随机打乱
    for (var j = numIndices.length - 1; j > 0; j--) {
        var k = Math.floor(Math.random() * (j + 1));
        var tmp = numIndices[j]; numIndices[j] = numIndices[k]; numIndices[k] = tmp;
    }
    return numIndices.slice(0, Math.min(count, numIndices.length));
}

// ========== 渲染算式 ==========
function renderExpression() {
    var container = document.getElementById('twentyfour-expression');
    container.innerHTML = '';

    for (var i = 0; i < twentyFourState.tokens.length; i++) {
        var token = twentyFourState.tokens[i];
        var box = document.createElement('span');
        box.dataset.index = i;

        if (token.type === 'number') {
            var isBlank = twentyFourState.blanks.indexOf(i) !== -1;
            if (isBlank) {
                box.className = 'twentyfour-expr-box blank';
                box.textContent = '';
                box.addEventListener('click', (function(idx) {
                    return function() { selectExprBlank(idx); };
                })(i));
            } else {
                box.className = 'twentyfour-expr-box number';
                box.textContent = token.value;
            }
        } else {
            box.className = 'twentyfour-expr-box operator';
            box.textContent = opDisplay(token.value);
        }

        container.appendChild(box);
    }

    // 填空模式自动选中第一个空
    if (twentyFourState.mode === 'fill' && twentyFourState.blanks.length > 0) {
        selectExprBlank(twentyFourState.blanks[0]);
    }
    // 构建模式选中第一个位置
    if (twentyFourState.mode === 'build') {
        selectExprBlank(0);
    }
}

// ========== 选中填空/位置 ==========
function selectExprBlank(index) {
    twentyFourState.selectedBlank = index;
    var boxes = document.querySelectorAll('.twentyfour-expr-box');
    for (var i = 0; i < boxes.length; i++) {
        boxes[i].classList.remove('selected');
    }
    if (boxes[index]) boxes[index].classList.add('selected');
}

// ========== 处理键盘输入 ==========
function handle24KeyInput(key) {
    if (twentyFourState.isProcessing) return;

    if (key === 'C') {
        clear24Input();
        return;
    }
    if (key === '←') {
        handleBackspace();
        return;
    }
    if (key === '=') {
        check24Answer();
        return;
    }
    if (key === 'hint') {
        show24Hint();
        return;
    }

    var idx = twentyFourState.selectedBlank;
    if (idx < 0 || idx >= twentyFourState.tokens.length) return;

    if (twentyFourState.mode === 'fill') {
        // 填空模式：只接受数字
        if (key < '0' || key > '9') return;
        var blankIdx = twentyFourState.blanks.indexOf(idx);
        if (blankIdx === -1) return;

        twentyFourState.userInputs[blankIdx] = key;
        var boxes = document.querySelectorAll('.twentyfour-expr-box');
        boxes[idx].textContent = key;
        boxes[idx].classList.add('filled');
        boxes[idx].classList.remove('blank');

        // 自动跳到下一个空
        var nextBlankIdx = (blankIdx + 1) % twentyFourState.blanks.length;
        selectExprBlank(twentyFourState.blanks[nextBlankIdx]);

    } else {
        // 构建模式：接受数字和运算符
        var boxes = document.querySelectorAll('.twentyfour-expr-box');
        var token = twentyFourState.tokens[idx];

        if (token.type === 'number') {
            if (key >= '0' && key <= '9') {
                // 追加数字（支持多位数）
                if (token.value === '' || token.value === '_') {
                    token.value = key;
                } else if (token.value.length < 3) {
                    token.value += key;
                }
                boxes[idx].textContent = token.value;
                boxes[idx].classList.add('filled');
            }
        } else {
            // 运算符位置
            var opMap = { '+': '+', '-': '-', '*': '*', '/': '/', '×': '*', '÷': '/' };
            if (opMap[key] || key === '(' || key === ')') {
                if (key === '(' || key === ')') {
                    // 括号不放在运算符位置，忽略
                    return;
                }
                token.value = opMap[key] || key;
                boxes[idx].textContent = opDisplay(token.value);
                boxes[idx].classList.add('filled');
            }
        }

        // 自动跳到下一个位置
        var next = (idx + 1) % twentyFourState.tokens.length;
        selectExprBlank(next);
    }

    playClickSound();
}

// ========== 退格处理 ==========
function handleBackspace() {
    var idx = twentyFourState.selectedBlank;
    if (idx < 0) return;

    var boxes = document.querySelectorAll('.twentyfour-expr-box');

    if (twentyFourState.mode === 'fill') {
        var blankIdx = twentyFourState.blanks.indexOf(idx);
        if (blankIdx !== -1) {
            twentyFourState.userInputs[blankIdx] = '';
            boxes[idx].textContent = '';
            boxes[idx].classList.remove('filled');
            boxes[idx].classList.add('blank');
        }
        // 跳到前一个空
        var prevBlankIdx = (blankIdx - 1 + twentyFourState.blanks.length) % twentyFourState.blanks.length;
        selectExprBlank(twentyFourState.blanks[prevBlankIdx]);

    } else {
        var token = twentyFourState.tokens[idx];
        if (token.type === 'number') {
            if (token.value.length > 0) {
                token.value = token.value.slice(0, -1);
                boxes[idx].textContent = token.value || '';
                if (!token.value) boxes[idx].classList.remove('filled');
            }
        } else {
            token.value = '_';
            boxes[idx].textContent = '';
            boxes[idx].classList.remove('filled');
        }
        // 跳到前一个位置
        var prev = (idx - 1 + twentyFourState.tokens.length) % twentyFourState.tokens.length;
        selectExprBlank(prev);
    }
}

// ========== 清空输入 ==========
function clear24Input() {
    if (twentyFourState.mode === 'fill') {
        for (var i = 0; i < twentyFourState.blanks.length; i++) {
            twentyFourState.userInputs[i] = '';
        }
        renderExpression();
    } else {
        for (var j = 0; j < twentyFourState.tokens.length; j++) {
            if (twentyFourState.tokens[j].type === 'number') {
                twentyFourState.tokens[j].value = '';
            } else {
                twentyFourState.tokens[j].value = '_';
            }
        }
        renderExpression();
    }
    var hintBtn = document.getElementById('twentyfour-hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';
    var hintBtnFill = document.getElementById('twentyfour-hint-btn-fill');
    if (hintBtnFill) hintBtnFill.style.display = 'none';
    twentyFourState.viewedAnswer = false;
    var answerBtn = document.getElementById('twentyfour-answer-btn');
    if (answerBtn) answerBtn.style.display = 'inline-block';
}

// ========== 提示 ==========
function show24Hint() {
    if (!twentyFourState.currentSolution) return;

    if (twentyFourState.mode === 'fill') {
        // 填空模式：填入所有空的正确值
        for (var i = 0; i < twentyFourState.blanks.length; i++) {
            var bi = twentyFourState.blanks[i];
            twentyFourState.userInputs[i] = twentyFourState.blankValues[i];
            var boxes = document.querySelectorAll('.twentyfour-expr-box');
            boxes[bi].textContent = twentyFourState.blankValues[i];
            boxes[bi].classList.add('filled');
            boxes[bi].classList.remove('blank');
        }
    } else {
        // 构建模式：填入完整解法
        var solutionTokens = tokenize(twentyFourState.currentSolution);
        for (var j = 0; j < solutionTokens.length && j < twentyFourState.tokens.length; j++) {
            twentyFourState.tokens[j].value = solutionTokens[j].value;
        }
        renderExpression();
    }

    var hintBtn = document.getElementById('twentyfour-hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';
    var hintBtnFill = document.getElementById('twentyfour-hint-btn-fill');
    if (hintBtnFill) hintBtnFill.style.display = 'none';
}

// ========== 查看答案 ==========
function show24Answer() {
    if (!twentyFourState.currentSolution) return;

    var solutionTokens = tokenize(twentyFourState.currentSolution);
    var boxes = document.querySelectorAll('.twentyfour-expr-box');

    if (twentyFourState.mode === 'fill') {
        for (var i = 0; i < twentyFourState.blanks.length; i++) {
            var bi = twentyFourState.blanks[i];
            twentyFourState.userInputs[i] = twentyFourState.blankValues[i];
            boxes[bi].textContent = twentyFourState.blankValues[i];
            boxes[bi].classList.remove('blank', 'wrong');
            boxes[bi].classList.add('filled', 'correct');
        }
    } else {
        for (var j = 0; j < solutionTokens.length && j < twentyFourState.tokens.length; j++) {
            twentyFourState.tokens[j].value = solutionTokens[j].value;
        }
        renderExpression();
        boxes = document.querySelectorAll('.twentyfour-expr-box');
        for (var k = 0; k < boxes.length; k++) {
            boxes[k].classList.add('correct');
        }
    }

    var feedback = document.getElementById('twentyfour-feedback');
    feedback.textContent = '答案已显示，按 = 进入下一题';
    feedback.className = 'feedback';

    twentyFourState.viewedAnswer = true;

    var answerBtn = document.getElementById('twentyfour-answer-btn');
    if (answerBtn) answerBtn.style.display = 'none';
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

    var config = get24Config();
    twentyFourState.mode = config.mode;

    var puzzle = generate24Puzzle();
    twentyFourState.currentNumbers = puzzle.numbers;
    twentyFourState.currentTarget = puzzle.target;
    twentyFourState.currentSolution = puzzle.solution;

    // 分词
    twentyFourState.tokens = tokenize(puzzle.solution);
    twentyFourState.blanks = [];
    twentyFourState.blankValues = [];
    twentyFourState.userInputs = [];
    twentyFourState.selectedBlank = -1;

    if (twentyFourState.mode === 'fill') {
        // 生成填空
        twentyFourState.blanks = generateBlanks(twentyFourState.tokens, config.blanks);
        for (var i = 0; i < twentyFourState.blanks.length; i++) {
            twentyFourState.blankValues.push(twentyFourState.tokens[twentyFourState.blanks[i]].value);
            twentyFourState.userInputs.push('');
        }
    } else {
        // 构建模式：清空所有数字，运算符标记为待填写
        for (var j = 0; j < twentyFourState.tokens.length; j++) {
            if (twentyFourState.tokens[j].type === 'number') {
                twentyFourState.tokens[j].value = '';
            } else {
                twentyFourState.tokens[j].value = '_';
            }
        }
    }

    // 更新显示
    twentyFourState.viewedAnswer = false;
    var answerBtn = document.getElementById('twentyfour-answer-btn');
    if (answerBtn) answerBtn.style.display = 'inline-block';

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

    // 显示/隐藏键盘
    var fillKb = document.getElementById('twentyfour-keyboard-fill');
    var buildKb = document.getElementById('twentyfour-keyboard-build');
    if (twentyFourState.mode === 'fill') {
        fillKb.style.display = 'block';
        buildKb.style.display = 'none';
    } else {
        fillKb.style.display = 'none';
        buildKb.style.display = 'block';
    }

    // 渲染算式
    renderExpression();

    var feedback = document.getElementById('twentyfour-feedback');
    feedback.textContent = '';
    feedback.className = 'feedback';

    var hintBtn = document.getElementById('twentyfour-hint-btn');
    if (hintBtn) hintBtn.style.display = 'none';
    var hintBtnFill = document.getElementById('twentyfour-hint-btn-fill');
    if (hintBtnFill) hintBtnFill.style.display = 'none';
}

function check24Answer() {
    if (twentyFourState.isProcessing) return;
    twentyFourState.isProcessing = true;

    var feedback = document.getElementById('twentyfour-feedback');
    var boxes = document.querySelectorAll('.twentyfour-expr-box');

    // 查看答案后直接进入下一题，不得分
    if (twentyFourState.viewedAnswer) {
        feedback.textContent = '✗ 已查看答案，不得分';
        feedback.className = 'feedback wrong';
        playWrongSound();
        setTimeout(function() {
            showNext24Question();
        }, 1500);
        return;
    }

    if (twentyFourState.mode === 'fill') {
        // 填空模式：检查每个空
        var allCorrect = true;
        for (var i = 0; i < twentyFourState.blanks.length; i++) {
            var bi = twentyFourState.blanks[i];
            var userInput = twentyFourState.userInputs[i];
            var correct = twentyFourState.blankValues[i];
            if (userInput === correct) {
                boxes[bi].classList.add('correct');
            } else {
                boxes[bi].classList.add('wrong');
                allCorrect = false;
            }
        }

        if (allCorrect) {
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
            feedback.textContent = '✗ 有错误，正确答案已标出';
            feedback.className = 'feedback wrong';
            playWrongSound();
            speakWrong();

            // 显示正确答案
            for (var j = 0; j < twentyFourState.blanks.length; j++) {
                var bIdx = twentyFourState.blanks[j];
                if (twentyFourState.userInputs[j] !== twentyFourState.blankValues[j]) {
                    boxes[bIdx].textContent = twentyFourState.blankValues[j];
                    boxes[bIdx].classList.remove('wrong');
                    boxes[bIdx].classList.add('correct');
                }
            }

            setTimeout(function() {
                twentyFourState.isProcessing = false;
                showNext24Question();
            }, 2500);
        }

    } else {
        // 构建模式：拼接表达式并验证
        var expr = '';
        for (var k = 0; k < twentyFourState.tokens.length; k++) {
            var t = twentyFourState.tokens[k];
            if (t.type === 'number') {
                if (!t.value || t.value === '_') {
                    feedback.textContent = '✗ 请填写完整算式';
                    feedback.className = 'feedback wrong';
                    twentyFourState.isProcessing = false;
                    return;
                }
                expr += t.value;
            } else {
                if (!t.value || t.value === '_') {
                    feedback.textContent = '✗ 请选择运算符';
                    feedback.className = 'feedback wrong';
                    twentyFourState.isProcessing = false;
                    return;
                }
                expr += t.value;
            }
        }

        var result = validate24Expression(expr, twentyFourState.currentNumbers, twentyFourState.currentTarget);

        if (result.valid) {
            twentyFourState.correctCount++;
            var roundScore2 = 10;
            twentyFourState.score += roundScore2;

            for (var m = 0; m < boxes.length; m++) {
                boxes[m].classList.add('correct');
            }

            feedback.textContent = '✓ 正确！+' + roundScore2 + '分';
            feedback.className = 'feedback correct';
            playCorrectSound();
            speakCorrect();

            setTimeout(function() {
                showNext24Question();
            }, 1200);
        } else {
            for (var n = 0; n < boxes.length; n++) {
                boxes[n].classList.add('wrong');
            }

            feedback.textContent = '✗ ' + result.error;
            feedback.className = 'feedback wrong';
            playWrongSound();
            speakWrong();

            var hintBtn = document.getElementById('twentyfour-hint-btn');
            if (hintBtn) hintBtn.style.display = 'inline-block';
            var hintBtnFill = document.getElementById('twentyfour-hint-btn-fill');
            if (hintBtnFill) hintBtnFill.style.display = 'inline-block';

            setTimeout(function() {
                twentyFourState.isProcessing = false;
            }, 500);
        }
    }
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
