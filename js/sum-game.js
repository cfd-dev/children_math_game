// 凑十法游戏模块
var sumState = {
    targetSum: 10,
    numbers: [],
    paired: [],
    selectedIdx: -1,
    score: 0,
    pairsFound: 0,
    totalPairs: 0,
    startTime: null,
    timerInterval: null,
    isProcessing: false
};

// 按年级的题目配置
var sumGradeConfig = {
    'k-small':  { pairCount: 3, target: 10,  min: 1, max: 9,   description: '3对凑10' },
    'k-medium': { pairCount: 4, target: 10,  min: 1, max: 9,   description: '4对凑10' },
    'k-large':  { pairCount: 4, target: 10,  min: 1, max: 9,   description: '4对凑10' },
    'grade-1':  { pairCount: 5, target: 10,  min: 1, max: 9,   description: '5对凑10' },
    'grade-2':  { pairCount: 5, target: 20,  min: 1, max: 19,  description: '5对凑20' },
    'grade-3':  { pairCount: 6, target: 50,  min: 1, max: 49,  description: '6对凑50' },
    'grade-4':  { pairCount: 6, target: 100, min: 1, max: 99,  description: '6对凑100' },
    'grade-5':  { pairCount: 7, target: 100, min: 1, max: 99,  description: '7对凑100' },
    'grade-6':  { pairCount: 7, target: 200, min: 1, max: 199, description: '7对凑200' }
};

// 获取当前配置
function getSumConfig() {
    return sumGradeConfig[currentGrade] || sumGradeConfig['grade-1'];
}

// 生成凑十题目
function generateSumQuestion() {
    var config = getSumConfig();
    var pairCount = config.pairCount;
    var target = config.target;
    var numbers = [];
    var used = {};

    // 生成 N 对和为 target 的数字
    var attempts = 0;
    while (numbers.length < pairCount * 2 && attempts < 1000) {
        attempts++;
        var a = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        var b = target - a;
        if (b < config.min || b > config.max) continue;

        var key1 = Math.min(a, b) + ',' + Math.max(a, b);
        if (used[key1]) continue;

        used[key1] = true;
        numbers.push(a);
        numbers.push(b);
    }

    // 打乱顺序（Fisher-Yates）
    for (var i = numbers.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = numbers[i]; numbers[i] = numbers[j]; numbers[j] = tmp;
    }

    return {
        numbers: numbers,
        target: target,
        pairCount: pairCount
    };
}

// 开始游戏
function startSumGame() {
    var config = getSumConfig();
    sumState.targetSum = config.target;
    sumState.totalPairs = config.pairCount;
    sumState.pairsFound = 0;
    sumState.selectedIdx = -1;
    sumState.score = 0;
    sumState.startTime = Date.now();
    sumState.isProcessing = false;

    document.getElementById('sum-setup').style.display = 'none';
    document.getElementById('sum-result').style.display = 'none';
    document.getElementById('sum-quiz').style.display = 'block';

    if (sumState.timerInterval) clearInterval(sumState.timerInterval);
    sumState.timerInterval = setInterval(updateSumTimer, 1000);

    playStartSound();
    showSumQuestion();
}

// 显示题目
function showSumQuestion() {
    var q = generateSumQuestion();
    sumState.numbers = q.numbers;
    sumState.paired = new Array(q.numbers.length).fill(false);
    sumState.selectedIdx = -1;
    sumState.pairsFound = 0;

    document.getElementById('sum-target-value').textContent = q.target;
    document.getElementById('sum-pairs').textContent = '已找到：0/' + q.pairCount;
    document.getElementById('sum-score-text').textContent = '得分：' + sumState.score;
    document.getElementById('sum-feedback').textContent = '';
    document.getElementById('sum-feedback').className = 'feedback';

    renderSumGrid();
}

// 渲染数字网格
function renderSumGrid() {
    var container = document.getElementById('sum-grid');
    container.innerHTML = '';

    for (var i = 0; i < sumState.numbers.length; i++) {
        var cell = document.createElement('div');
        cell.className = 'sum-cell';
        cell.textContent = sumState.numbers[i];
        cell.dataset.index = i;

        if (sumState.paired[i]) {
            cell.classList.add('matched');
        } else if (i === sumState.selectedIdx) {
            cell.classList.add('selected');
        }

        cell.addEventListener('click', (function(idx) {
            return function() { handleSumTap(idx); };
        })(i));

        container.appendChild(cell);
    }
}

// 点击数字
function handleSumTap(idx) {
    if (sumState.isProcessing) return;
    if (sumState.paired[idx]) return;

    if (sumState.selectedIdx === -1) {
        // 第一次选择
        sumState.selectedIdx = idx;
        playClickSound();
        renderSumGrid();
    } else if (sumState.selectedIdx === idx) {
        // 取消选择
        sumState.selectedIdx = -1;
        renderSumGrid();
    } else {
        // 第二次选择，检查和
        var a = sumState.numbers[sumState.selectedIdx];
        var b = sumState.numbers[idx];
        var firstIdx = sumState.selectedIdx;
        sumState.selectedIdx = -1;

        if (a + b === sumState.targetSum) {
            // 正确配对
            sumState.paired[firstIdx] = true;
            sumState.paired[idx] = true;
            sumState.pairsFound++;
            sumState.score += 10;

            document.getElementById('sum-pairs').textContent =
                '已找到：' + sumState.pairsFound + '/' + sumState.totalPairs;
            document.getElementById('sum-score-text').textContent = '得分：' + sumState.score;

            renderSumGrid();
            playCorrectSound();
            speakCorrect();

            // 检查是否全部完成
            if (sumState.pairsFound >= sumState.totalPairs) {
                setTimeout(finishSumGame, 800);
            }
        } else {
            // 错误配对
            sumState.isProcessing = true;
            renderSumGrid();

            var cells = document.querySelectorAll('.sum-cell');
            cells[firstIdx].classList.add('wrong-flash');
            cells[idx].classList.add('wrong-flash');
            playWrongSound();
            speakWrong();

            setTimeout(function() {
                sumState.isProcessing = false;
                renderSumGrid();
            }, 600);
        }
    }
}

// 更新计时器
function updateSumTimer() {
    var elapsed = Math.floor((Date.now() - sumState.startTime) / 1000);
    document.getElementById('sum-timer').textContent = '用时：' + elapsed + '秒';
}

// 完成游戏
function finishSumGame() {
    if (sumState.timerInterval) clearInterval(sumState.timerInterval);

    var totalTime = Math.floor((Date.now() - sumState.startTime) / 1000);
    var accuracy = Math.round((sumState.pairsFound / sumState.totalPairs) * 100);

    saveSumRecord(sumState.score, totalTime, sumState.pairsFound, sumState.totalPairs);

    // 显示奖励画面
    document.getElementById('sum-reward-score').textContent = sumState.score;
    document.getElementById('sum-reward-accuracy').textContent = accuracy + '%';
    document.getElementById('sum-reward-time').textContent = totalTime;

    playMemoryLevelSound();
    speakReward(accuracy);
    setRewardStars('sum-reward-stars', accuracy);

    document.getElementById('sum-quiz').style.display = 'none';
    document.getElementById('sum-reward').style.display = 'block';
}

function showSumRewardResult() {
    var totalTime = Math.floor((Date.now() - sumState.startTime) / 1000);
    var accuracy = Math.round((sumState.pairsFound / sumState.totalPairs) * 100);

    document.getElementById('sum-result-score').textContent = sumState.score;
    document.getElementById('sum-result-correct').textContent = accuracy + '%';
    document.getElementById('sum-result-time').textContent = totalTime + '秒';

    document.getElementById('sum-reward').style.display = 'none';
    document.getElementById('sum-result').style.display = 'block';
}
