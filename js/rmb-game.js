// 认识人民币游戏模块
var rmbState = {
    totalQuestions: 10,
    currentQuestion: 0,
    score: 0,
    correctCount: 0,
    currentItems: [],
    currentAnswer: 0,
    questionType: 'total',
    payAmount: 0,
    startTime: null,
    timerInterval: null,
    isProcessing: false
};

// 商品池
var rmbItems = [
    { name: '铅笔', price: 2, emoji: '✏️' },
    { name: '橡皮', price: 1, emoji: '🧽' },
    { name: '尺子', price: 3, emoji: '📏' },
    { name: '笔记本', price: 5, emoji: '📓' },
    { name: '故事书', price: 12, emoji: '📖' },
    { name: '饼干', price: 3, emoji: '🍪' },
    { name: '棒棒糖', price: 1, emoji: '🍭' },
    { name: '牛奶', price: 5, emoji: '🥛' },
    { name: '面包', price: 4, emoji: '🍞' },
    { name: '苹果', price: 6, emoji: '🍎' },
    { name: '香蕉', price: 4, emoji: '🍌' },
    { name: '巧克力', price: 8, emoji: '🍫' },
    { name: '矿泉水', price: 2, emoji: '💧' },
    { name: '果汁', price: 6, emoji: '🧃' },
    { name: '小汽车', price: 15, emoji: '🚗' },
    { name: '贴纸', price: 2, emoji: '🏷️' },
    { name: '气球', price: 1, emoji: '🎈' },
    { name: '冰淇淋', price: 5, emoji: '🍦' },
    { name: '水杯', price: 10, emoji: '🥤' },
    { name: '文具盒', price: 8, emoji: '📦' },
    { name: '彩笔', price: 7, emoji: '🖍️' },
    { name: '帽子', price: 10, emoji: '🧢' },
    { name: '手帕', price: 3, emoji: '🧣' },
    { name: '拼图', price: 9, emoji: '🧩' }
];

// 年级难度配置
// qtyMax: 每种商品最大数量
// showSubtotal: 是否在商品卡片上显示小计（降低难度）
// types: 'total'=算总价, 'change'=已知总价算找零, 'both'=只给商品和付款额，学生自己算总价再算找零
var rmbGradeConfig = {
    'k-small':  { itemCount: 1, priceMin: 1, priceMax: 5,  qtyMax: 1, showSubtotal: true,  types: ['total'],                     description: '1件商品，算总价（1-5元）' },
    'k-medium': { itemCount: 1, priceMin: 1, priceMax: 9,  qtyMax: 1, showSubtotal: true,  types: ['total', 'change'], payMax: 20, description: '1件商品，算总价或找零' },
    'k-large':  { itemCount: 2, priceMin: 1, priceMax: 10, qtyMax: 1, showSubtotal: true,  types: ['total', 'change'], payMax: 50, description: '1-2件商品，算总价或找零' },
    'grade-1':  { itemCount: 2, priceMin: 1, priceMax: 15, qtyMax: 1, showSubtotal: true,  types: ['total', 'change'], payMax: 50, description: '1-2件商品，算总价或找零' },
    'grade-2':  { itemCount: 2, priceMin: 1, priceMax: 20, qtyMax: 2, showSubtotal: true,  types: ['total', 'change'], payMax: 100, description: '2件商品，可买多个，算总价或找零' },
    'grade-3':  { itemCount: 2, priceMin: 1, priceMax: 20, qtyMax: 3, showSubtotal: true,  types: ['total', 'change'], payMax: 100, description: '2件商品，可买多个，算总价或找零' },
    'grade-4':  { itemCount: 2, priceMin: 1, priceMax: 30, qtyMax: 3, showSubtotal: false, types: ['total', 'change', 'both'], payMax: 150, description: '2件商品买多个，自己算总价和找零' },
    'grade-5':  { itemCount: 3, priceMin: 1, priceMax: 40, qtyMax: 4, showSubtotal: false, types: ['total', 'change', 'both'], payMax: 200, description: '3件商品买多个，自己算总价和找零（进阶）' },
    'grade-6':  { itemCount: 3, priceMin: 1, priceMax: 50, qtyMax: 5, showSubtotal: false, types: ['total', 'change', 'both'], payMax: 200, description: '3件商品买多个，自己算总价和找零（挑战）' }
};

function getRMBConfig() {
    return rmbGradeConfig[currentGrade] || rmbGradeConfig['grade-1'];
}

// 生成题目
function generateRMBQuestion() {
    var config = getRMBConfig();
    var count = config.itemCount;

    // 随机选商品（不重复）
    var pool = rmbItems.slice();
    for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var selected = pool.slice(0, count);

    // 分配数量
    var items = [];
    var total = 0;
    for (var k = 0; k < selected.length; k++) {
        var qty = Math.floor(Math.random() * config.qtyMax) + 1;
        var subtotal = selected[k].price * qty;
        total += subtotal;
        items.push({
            name: selected[k].name,
            price: selected[k].price,
            emoji: selected[k].emoji,
            qty: qty,
            subtotal: subtotal
        });
    }

    // 选题型
    var type = config.types[Math.floor(Math.random() * config.types.length)];
    var answer, payAmount = 0;

    if (type === 'total') {
        answer = total;
    } else if (type === 'change') {
        // 找零：找一个比总价大的整十/整五数
        var candidates = [];
        for (var n = 10; n <= config.payMax; n += 5) {
            if (n > total) candidates.push(n);
        }
        if (candidates.length === 0) {
            type = 'total';
            answer = total;
        } else {
            payAmount = candidates[Math.floor(Math.random() * candidates.length)];
            answer = payAmount - total;
        }
    } else {
        // both：只给商品和付款额，学生需先算总价再算找零
        var candidates2 = [];
        for (var n2 = 10; n2 <= config.payMax; n2 += 5) {
            if (n2 > total) candidates2.push(n2);
        }
        if (candidates2.length === 0) {
            type = 'total';
            answer = total;
        } else {
            payAmount = candidates2[Math.floor(Math.random() * candidates2.length)];
            answer = payAmount - total;
        }
    }

    return {
        items: items,
        total: total,
        type: type,
        answer: answer,
        payAmount: payAmount
    };
}

// 游戏生命周期
function startRMBGame() {
    var countSelect = document.getElementById('rmb-question-count');
    rmbState.totalQuestions = parseInt(countSelect ? countSelect.value : '10');
    rmbState.currentQuestion = 0;
    rmbState.score = 0;
    rmbState.correctCount = 0;
    rmbState.isProcessing = false;
    rmbState.startTime = Date.now();

    if (rmbState.timerInterval) clearInterval(rmbState.timerInterval);
    rmbState.timerInterval = setInterval(updateRMBTimer, 1000);

    // 绑定数字键盘
    var rmbInput = document.getElementById('rmb-input');
    rmbInput.onclick = function() {
        if (typeof numpad !== 'undefined') numpad.show(this);
    };

    playStartSound();
    showNextRMBQuestion();

    document.getElementById('rmb-setup').style.display = 'none';
    document.getElementById('rmb-result').style.display = 'none';
    document.getElementById('rmb-quiz').style.display = 'block';
}

function showNextRMBQuestion() {
    rmbState.isProcessing = false;
    rmbState.currentQuestion++;

    if (rmbState.currentQuestion > rmbState.totalQuestions) {
        finishRMBGame();
        return;
    }

    var config = getRMBConfig();
    var q = generateRMBQuestion();
    rmbState.currentItems = q.items;
    rmbState.currentAnswer = q.answer;
    rmbState.questionType = q.type;
    rmbState.payAmount = q.payAmount;

    // 更新进度
    document.getElementById('rmb-progress').textContent =
        '第 ' + rmbState.currentQuestion + '/' + rmbState.totalQuestions + ' 题';
    document.getElementById('rmb-score').textContent = '得分：' + rmbState.score;

    // 渲染商品
    var itemsContainer = document.getElementById('rmb-items');
    itemsContainer.innerHTML = '';
    for (var i = 0; i < q.items.length; i++) {
        var item = q.items[i];
        var card = document.createElement('div');
        card.className = 'rmb-item';
        var html = '<div class="rmb-item-emoji">' + item.emoji + '</div>';

        if (item.qty > 1) {
            html += '<div class="rmb-item-name">' + item.name + ' ×' + item.qty + '</div>';
            if (config.showSubtotal) {
                html += '<div class="rmb-item-price">' + item.price + '×' + item.qty + '=' + item.subtotal + '元</div>';
            } else {
                html += '<div class="rmb-item-price">' + item.price + '元/个</div>';
            }
        } else {
            html += '<div class="rmb-item-name">' + item.name + '</div>';
            html += '<div class="rmb-item-price">' + item.price + '元</div>';
        }

        card.innerHTML = html;
        itemsContainer.appendChild(card);
    }

    // 合计栏留空，需要学生自己计算
    document.getElementById('rmb-total').textContent = '';

    // 渲染题目
    var questionEl = document.getElementById('rmb-question-text');
    if (q.type === 'total') {
        questionEl.textContent = '一共要付多少元？';
    } else if (q.type === 'change') {
        questionEl.textContent = '一共要付 ' + q.total + ' 元，付 ' + q.payAmount + ' 元，应找回多少元？';
    } else {
        // both：不告诉总价，只给付款额
        questionEl.textContent = '付 ' + q.payAmount + ' 元，应找回多少元？';
    }

    // 清空输入
    var input = document.getElementById('rmb-input');
    if (input) {
        input.value = '';
        input.disabled = false;
    }
    var submitBtn = document.getElementById('rmb-submit-btn');
    if (submitBtn) submitBtn.disabled = false;

    var feedback = document.getElementById('rmb-feedback');
    feedback.textContent = '';
    feedback.className = 'feedback';
}

function checkRMBAnswer() {
    if (rmbState.isProcessing) return;

    var input = document.getElementById('rmb-input');
    var userAnswer = parseInt(input.value);
    if (isNaN(userAnswer)) return;

    rmbState.isProcessing = true;
    if (typeof numpad !== 'undefined') numpad.hide();

    var feedback = document.getElementById('rmb-feedback');

    if (userAnswer === rmbState.currentAnswer) {
        rmbState.correctCount++;
        var roundScore = 10;
        rmbState.score += roundScore;
        feedback.textContent = '✓ 正确！+' + roundScore + '分';
        feedback.className = 'feedback correct';
        playCorrectSound();
        speakCorrect();
        input.disabled = true;

        setTimeout(function() {
            showNextRMBQuestion();
        }, 1200);
    } else {
        feedback.textContent = '✗ 正确答案是 ' + rmbState.currentAnswer + ' 元';
        feedback.className = 'feedback wrong';
        playWrongSound();
        speakWrong();
        input.disabled = true;

        setTimeout(function() {
            showNextRMBQuestion();
        }, 2000);
    }
}

function updateRMBTimer() {
    var elapsed = Math.floor((Date.now() - rmbState.startTime) / 1000);
    var el = document.getElementById('rmb-timer');
    if (el) el.textContent = '用时：' + elapsed + '秒';
}

function finishRMBGame() {
    if (rmbState.timerInterval) clearInterval(rmbState.timerInterval);

    var totalTime = Math.floor((Date.now() - rmbState.startTime) / 1000);
    var accuracy = Math.round((rmbState.correctCount / rmbState.totalQuestions) * 100);

    saveRMBRecord(accuracy, totalTime, rmbState.totalQuestions, rmbState.score);

    document.getElementById('rmb-reward-score').textContent = rmbState.score;
    document.getElementById('rmb-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('rmb-reward-time').textContent = totalTime;

    playMemoryLevelSound();
    speakReward(accuracy);
    setRewardStars('rmb-reward-stars', accuracy);

    document.getElementById('rmb-quiz').style.display = 'none';
    document.getElementById('rmb-reward').style.display = 'block';
}

function showRMBRewardResult() {
    var totalTime = Math.floor((Date.now() - rmbState.startTime) / 1000);
    var accuracy = Math.round((rmbState.correctCount / rmbState.totalQuestions) * 100);

    document.getElementById('rmb-result-score').textContent = rmbState.score;
    document.getElementById('rmb-result-accuracy').textContent = accuracy + '%';
    document.getElementById('rmb-result-correct').textContent =
        rmbState.correctCount + '/' + rmbState.totalQuestions;
    document.getElementById('rmb-result-time').textContent = totalTime + '秒';

    document.getElementById('rmb-reward').style.display = 'none';
    document.getElementById('rmb-result').style.display = 'block';
}
