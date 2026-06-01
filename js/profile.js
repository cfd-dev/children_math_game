// 个人中心模块

// 数据存储键名
const STORAGE_KEYS = {
    MATH_HISTORY: 'mathQuizHistory',
    MEMORY_HISTORY: 'memoryGameHistory',
    PATTERN_HISTORY: 'patternGameHistory',
    COMPARE_HISTORY: 'compareGameHistory',
    SUDOKU_HISTORY: 'sudokuGameHistory',
    SORT_HISTORY: 'sortGameHistory',
    SUM_HISTORY: 'sumPairsGameHistory',
    CLOCK_HISTORY: 'clockGameHistory',
    MATCH_HISTORY: 'mathMatchGameHistory',
    MATH_ABILITY: 'mathAbility',
    MEMORY_ABILITY: 'memoryAbility',
    PATTERN_ABILITY: 'patternAbility',
    COMPARE_ABILITY: 'compareAbility',
    SUDOKU_ABILITY: 'sudokuAbility',
    SORT_ABILITY: 'sortAbility',
    SUM_ABILITY: 'sumPairsAbility',
    CLOCK_ABILITY: 'clockAbility',
    MATCH_ABILITY: 'mathMatchAbility',
    BRAINTEASER_HISTORY: 'brainTeaserGameHistory',
    BRAINTEASER_ABILITY: 'brainTeaserAbility',
    SEEK_HISTORY: 'seekGameHistory',
    SEEK_ABILITY: 'seekAbility',
    USER_GRADE: 'userGrade',
    USER_NAME: 'userName'
};

// 初始化本地存储
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.MATH_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.MATH_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMORY_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.MEMORY_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATTERN_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.PATTERN_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPARE_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.COMPARE_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUDOKU_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.SUDOKU_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SORT_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.SORT_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUM_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.SUM_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLOCK_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.CLOCK_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRAINTEASER_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.BRAINTEASER_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SEEK_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.SEEK_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATH_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.MATH_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMORY_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.MEMORY_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.PATTERN_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.PATTERN_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPARE_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.COMPARE_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUDOKU_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.SUDOKU_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.SORT_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.SORT_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUM_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.SUM_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLOCK_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.CLOCK_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATCH_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.MATCH_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRAINTEASER_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.BRAINTEASER_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.SEEK_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.SEEK_ABILITY, '50');
    }
}

// 保存用户年级
function saveUserGrade(grade) {
    localStorage.setItem(STORAGE_KEYS.USER_GRADE, grade);
}

// 获取用户年级
function getUserGrade() {
    return localStorage.getItem(STORAGE_KEYS.USER_GRADE);
}

// 保存用户名
function saveUserName(name) {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
}

// 获取用户名
function getUserName() {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME);
}

// 检查是否是首次使用（用户名和年级都存在才算非首次）
function isFirstTimeUser() {
    return !getUserGrade() || !getUserName();
}

// 获取历史记录
function getMathHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MATH_HISTORY) || '[]');
}

function getMemoryHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMORY_HISTORY) || '[]');
}

function getPatternHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATTERN_HISTORY) || '[]');
}

function getCompareHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPARE_HISTORY) || '[]');
}

function getSudokuHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUDOKU_HISTORY) || '[]');
}

// 保存数学练习记录
function saveMathQuizRecord(accuracy, totalTime, questionCount, score, grade) {
    const history = getMathHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        accuracy: accuracy,
        totalTime: totalTime,
        questionCount: questionCount,
        score: score,
        grade: gradeConfig[grade].name,
        avgTime: (totalTime / questionCount).toFixed(1)
    });

    // 只保留最近50条记录
    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem(STORAGE_KEYS.MATH_HISTORY, JSON.stringify(history));

    // 更新能力值
    updateMathAbility(accuracy, totalTime / questionCount);
}

// 保存记忆游戏记录
function saveMemoryGameRecord(score, level, totalCorrect) {
    const history = getMemoryHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        score: score,
        level: level,
        totalCorrect: totalCorrect
    });

    // 只保留最近50条记录
    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem(STORAGE_KEYS.MEMORY_HISTORY, JSON.stringify(history));

    // 更新能力值
    updateMemoryAbility(level, totalCorrect);
}

// 保存找规律记录
function savePatternRecord(accuracy, totalTime, questionCount, score) {
    const history = getPatternHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        accuracy: accuracy,
        totalTime: totalTime,
        questionCount: questionCount,
        score: score,
        avgTime: (totalTime / questionCount).toFixed(1)
    });

    // 只保留最近50条记录
    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem(STORAGE_KEYS.PATTERN_HISTORY, JSON.stringify(history));

    // 更新能力值
    updatePatternAbility(accuracy, totalTime / questionCount);
}

// 更新数学能力值
function updateMathAbility(accuracy, avgTime) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.MATH_ABILITY) || '50');

    // 基于正确率和速度计算能力变化
    if (accuracy >= 95 && avgTime <= 3) {
        ability = Math.min(100, ability + 5);
    } else if (accuracy >= 85 && avgTime <= 5) {
        ability = Math.min(100, ability + 3);
    } else if (accuracy >= 70) {
        ability = Math.min(100, ability + 1);
    } else if (accuracy < 50) {
        ability = Math.max(0, ability - 3);
    }

    localStorage.setItem(STORAGE_KEYS.MATH_ABILITY, ability.toString());
    return ability;
}

// 更新记忆能力值
function updateMemoryAbility(level, totalCorrect) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.MEMORY_ABILITY) || '50');

    // 基于通过的关卡数和答对题数计算能力变化
    if (level >= 6) {
        ability = Math.min(100, ability + 5);
    } else if (level >= 4) {
        ability = Math.min(100, ability + 3);
    } else if (level >= 2) {
        ability = Math.min(100, ability + 1);
    } else {
        ability = Math.max(0, ability - 2);
    }

    localStorage.setItem(STORAGE_KEYS.MEMORY_ABILITY, ability.toString());
    return ability;
}

// 更新找规律能力值
function updatePatternAbility(accuracy, avgTime) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.PATTERN_ABILITY) || '50');

    if (accuracy >= 95 && avgTime <= 5) {
        ability = Math.min(100, ability + 5);
    } else if (accuracy >= 85 && avgTime <= 8) {
        ability = Math.min(100, ability + 3);
    } else if (accuracy >= 70) {
        ability = Math.min(100, ability + 1);
    } else if (accuracy < 50) {
        ability = Math.max(0, ability - 3);
    }

    localStorage.setItem(STORAGE_KEYS.PATTERN_ABILITY, ability.toString());
    return ability;
}

// 获取能力值
function getMathAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.MATH_ABILITY) || '50');
}

function getMemoryAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.MEMORY_ABILITY) || '50');
}

function getPatternAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.PATTERN_ABILITY) || '50');
}

// 保存比大小记录
function saveCompareRecord(accuracy, totalTime, questionCount, score) {
    const history = getCompareHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        accuracy: accuracy,
        totalTime: totalTime,
        questionCount: questionCount,
        score: score,
        avgTime: (totalTime / questionCount).toFixed(1)
    });

    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem(STORAGE_KEYS.COMPARE_HISTORY, JSON.stringify(history));
    updateCompareAbility(accuracy, totalTime / questionCount);
}

// 更新比大小能力值
function updateCompareAbility(accuracy, avgTime) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.COMPARE_ABILITY) || '50');

    if (accuracy >= 95 && avgTime <= 3) {
        ability = Math.min(100, ability + 5);
    } else if (accuracy >= 85 && avgTime <= 5) {
        ability = Math.min(100, ability + 3);
    } else if (accuracy >= 70) {
        ability = Math.min(100, ability + 1);
    } else if (accuracy < 50) {
        ability = Math.max(0, ability - 3);
    }

    localStorage.setItem(STORAGE_KEYS.COMPARE_ABILITY, ability.toString());
    return ability;
}

function getCompareAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.COMPARE_ABILITY) || '50');
}

// 保存数独记录
function saveSudokuRecord(score, totalTime, gridSize, mistakes) {
    const history = getSudokuHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        score: score,
        totalTime: totalTime,
        gridSize: gridSize,
        mistakes: mistakes
    });

    if (history.length > 50) {
        history.pop();
    }

    localStorage.setItem(STORAGE_KEYS.SUDOKU_HISTORY, JSON.stringify(history));
    updateSudokuAbility(score, gridSize);
}

// 更新数独能力值
function updateSudokuAbility(score, gridSize) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.SUDOKU_ABILITY) || '50');

    if (score >= 90) {
        ability = Math.min(100, ability + 5);
    } else if (score >= 70) {
        ability = Math.min(100, ability + 3);
    } else if (score >= 50) {
        ability = Math.min(100, ability + 1);
    } else {
        ability = Math.max(0, ability - 2);
    }

    localStorage.setItem(STORAGE_KEYS.SUDOKU_ABILITY, ability.toString());
    return ability;
}

function getSudokuAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.SUDOKU_ABILITY) || '50');
}

// 获取排序历史
function getSortHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SORT_HISTORY) || '[]');
}

// 保存排序记录
function saveSortRecord(accuracy, totalTime, questionCount, score) {
    const history = getSortHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        accuracy: accuracy,
        totalTime: totalTime,
        questionCount: questionCount,
        score: score,
        avgTime: (totalTime / questionCount).toFixed(1)
    });
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.SORT_HISTORY, JSON.stringify(history));
    updateSortAbility(accuracy, totalTime / questionCount);
}

// 更新排序能力值
function updateSortAbility(accuracy, avgTime) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.SORT_ABILITY) || '50');
    if (accuracy >= 95 && avgTime <= 5) ability = Math.min(100, ability + 5);
    else if (accuracy >= 85 && avgTime <= 8) ability = Math.min(100, ability + 3);
    else if (accuracy >= 70) ability = Math.min(100, ability + 1);
    else if (accuracy < 50) ability = Math.max(0, ability - 3);
    localStorage.setItem(STORAGE_KEYS.SORT_ABILITY, ability.toString());
    return ability;
}

function getSortAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.SORT_ABILITY) || '50');
}

// 获取凑十历史
function getSumHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUM_HISTORY) || '[]');
}

// 保存凑十记录
function saveSumRecord(score, totalTime, pairsFound, totalPairs) {
    const history = getSumHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        score: score,
        totalTime: totalTime,
        pairsFound: pairsFound,
        totalPairs: totalPairs
    });
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.SUM_HISTORY, JSON.stringify(history));
    updateSumAbility(pairsFound, totalPairs, totalTime);
}

// 更新凑十能力值
function updateSumAbility(pairsFound, totalPairs, totalTime) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.SUM_ABILITY) || '50');
    var ratio = pairsFound / totalPairs;
    if (ratio >= 1 && totalTime <= totalPairs * 5) ability = Math.min(100, ability + 5);
    else if (ratio >= 0.8) ability = Math.min(100, ability + 3);
    else if (ratio >= 0.6) ability = Math.min(100, ability + 1);
    else ability = Math.max(0, ability - 2);
    localStorage.setItem(STORAGE_KEYS.SUM_ABILITY, ability.toString());
    return ability;
}

function getSumAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.SUM_ABILITY) || '50');
}

// 获取时钟历史
function getClockHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLOCK_HISTORY) || '[]');
}

// 保存时钟记录
function saveClockRecord(accuracy, totalTime, questionCount, score) {
    const history = getClockHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        accuracy: accuracy,
        totalTime: totalTime,
        questionCount: questionCount,
        score: score,
        avgTime: (totalTime / questionCount).toFixed(1)
    });
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.CLOCK_HISTORY, JSON.stringify(history));
    updateClockAbility(accuracy, totalTime / questionCount);
}

// 更新时钟能力值
function updateClockAbility(accuracy, avgTime) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.CLOCK_ABILITY) || '50');
    if (accuracy >= 95 && avgTime <= 5) ability = Math.min(100, ability + 5);
    else if (accuracy >= 85 && avgTime <= 8) ability = Math.min(100, ability + 3);
    else if (accuracy >= 70) ability = Math.min(100, ability + 1);
    else if (accuracy < 50) ability = Math.max(0, ability - 3);
    localStorage.setItem(STORAGE_KEYS.CLOCK_ABILITY, ability.toString());
    return ability;
}

function getClockAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.CLOCK_ABILITY) || '50');
}

// 获取连线历史
function getMatchHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY) || '[]');
}

// 保存连线记录
function saveMatchRecord(accuracy, totalTime, questionCount, score) {
    const history = getMatchHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        accuracy: accuracy,
        totalTime: totalTime,
        questionCount: questionCount,
        score: score,
        avgTime: (totalTime / questionCount).toFixed(1)
    });
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(history));
    updateMatchAbility(accuracy, totalTime / questionCount);
}

// 更新连线能力值
function updateMatchAbility(accuracy, avgTime) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.MATCH_ABILITY) || '50');
    if (accuracy >= 95 && avgTime <= 3) ability = Math.min(100, ability + 5);
    else if (accuracy >= 85 && avgTime <= 5) ability = Math.min(100, ability + 3);
    else if (accuracy >= 70) ability = Math.min(100, ability + 1);
    else if (accuracy < 50) ability = Math.max(0, ability - 3);
    localStorage.setItem(STORAGE_KEYS.MATCH_ABILITY, ability.toString());
    return ability;
}

function getMatchAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.MATCH_ABILITY) || '50');
}

// 获取脑筋急转弯历史
function getBTHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BRAINTEASER_HISTORY) || '[]');
}

// 保存脑筋急转弯记录
function saveBTRecord(completionRate, totalTime, questionCount, viewedCount) {
    const history = getBTHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        completionRate: completionRate,
        totalTime: totalTime,
        questionCount: questionCount,
        viewedCount: viewedCount
    });
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.BRAINTEASER_HISTORY, JSON.stringify(history));
    updateBTAbility(completionRate);
}

// 更新脑筋急转弯能力值
function updateBTAbility(completionRate) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.BRAINTEASER_ABILITY) || '50');
    if (completionRate >= 95) ability = Math.min(100, ability + 5);
    else if (completionRate >= 80) ability = Math.min(100, ability + 3);
    else if (completionRate >= 60) ability = Math.min(100, ability + 1);
    else if (completionRate < 40) ability = Math.max(0, ability - 2);
    localStorage.setItem(STORAGE_KEYS.BRAINTEASER_ABILITY, ability.toString());
    return ability;
}

function getBTAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.BRAINTEASER_ABILITY) || '50');
}

// 获取数字捉迷藏历史
function getSeekHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEEK_HISTORY) || '[]');
}

// 保存数字捉迷藏记录
function saveSeekRecord(accuracy, totalTime, questionCount, score) {
    const history = getSeekHistory();
    history.unshift({
        date: new Date().toLocaleString('zh-CN'),
        accuracy: accuracy,
        totalTime: totalTime,
        questionCount: questionCount,
        score: score
    });
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.SEEK_HISTORY, JSON.stringify(history));
    updateSeekAbility(accuracy);
}

// 更新数字捉迷藏能力值
function updateSeekAbility(accuracy) {
    let ability = parseInt(localStorage.getItem(STORAGE_KEYS.SEEK_ABILITY) || '50');
    if (accuracy >= 90) ability = Math.min(100, ability + 5);
    else if (accuracy >= 70) ability = Math.min(100, ability + 3);
    else if (accuracy >= 50) ability = Math.min(100, ability + 1);
    else if (accuracy < 30) ability = Math.max(0, ability - 3);
    localStorage.setItem(STORAGE_KEYS.SEEK_ABILITY, ability.toString());
    return ability;
}

function getSeekAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.SEEK_ABILITY) || '50');
}

// 绘制雷达图
function drawRadarChart() {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 55;

    const mathAbility = getMathAbility();
    const memoryAbility = getMemoryAbility();
    const patternAbility = getPatternAbility();
    const compareAbility = getCompareAbility();
    const sudokuAbility = getSudokuAbility();

    // 数据点（五个顶点，均匀分布在圆上，从正上方开始逆时针）
    const data = [mathAbility, memoryAbility, patternAbility, compareAbility, sudokuAbility];
    const labels = ['算术', '记忆', '推理', '比较', '数独'];
    const step = 2 * Math.PI / 5;
    const startAngle = Math.PI / 2;
    const angles = [];
    for (let i = 0; i < 5; i++) {
        angles.push(startAngle + i * step);
    }

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景网格（五边形）
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let level = 1; level <= 5; level++) {
        const r = (radius * level) / 5;
        ctx.beginPath();
        for (let i = 0; i < angles.length; i++) {
            const x = centerX + r * Math.cos(angles[i]);
            const y = centerY - r * Math.sin(angles[i]);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // 绘制轴线
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    for (let i = 0; i < angles.length; i++) {
        const x = centerX + radius * Math.cos(angles[i]);
        const y = centerY - radius * Math.sin(angles[i]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    // 绘制数据区域
    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < data.length; i++) {
        const value = data[i] / 100;
        const x = centerX + radius * value * Math.cos(angles[i]);
        const y = centerY - radius * value * Math.sin(angles[i]);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 绘制数据点
    ctx.fillStyle = '#667eea';
    for (let i = 0; i < data.length; i++) {
        const value = data[i] / 100;
        const x = centerX + radius * value * Math.cos(angles[i]);
        const y = centerY - radius * value * Math.sin(angles[i]);
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制标签
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < labels.length; i++) {
        const labelRadius = radius + 30;
        const x = centerX + labelRadius * Math.cos(angles[i]);
        const y = centerY - labelRadius * Math.sin(angles[i]);

        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.fillText(labels[i], x, y - 6);

        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText(data[i], x, y + 10);
    }
}

// 显示历史记录
function showHistory(type) {
    // 更新标签状态
    document.querySelectorAll('.history-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    const historyList = document.getElementById('history-list');
    let html = '';

    if (type === 'math') {
        const history = getMathHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无计算练习记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>正确率: ${record.accuracy}%</span>
                            <span>平均: ${record.avgTime}秒/题</span>
                            <span>${record.grade}</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'memory') {
        const history = getMemoryHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无记忆游戏记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>得分: ${record.score}</span>
                            <span>通过: ${record.level}关</span>
                            <span>答对: ${record.totalCorrect}题</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'pattern') {
        const history = getPatternHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无找规律记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>正确率: ${record.accuracy}%</span>
                            <span>平均: ${record.avgTime}秒/题</span>
                            <span>得分: ${record.score}</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'compare') {
        const history = getCompareHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无比大小记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>正确率: ${record.accuracy}%</span>
                            <span>平均: ${record.avgTime}秒/题</span>
                            <span>得分: ${record.score}</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'sudoku') {
        const history = getSudokuHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无数独记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                var size = record.gridSize + '×' + record.gridSize;
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>${size}</span>
                            <span>得分: ${record.score}</span>
                            <span>错误: ${record.mistakes}次</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'sort') {
        const history = getSortHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无排序记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>正确率: ${record.accuracy}%</span>
                            <span>平均: ${record.avgTime}秒/题</span>
                            <span>得分: ${record.score}</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'sum') {
        const history = getSumHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无凑十记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>得分: ${record.score}</span>
                            <span>配对: ${record.pairsFound}/${record.totalPairs}</span>
                            <span>用时: ${record.totalTime}秒</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'clock') {
        const history = getClockHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无时钟记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>正确率: ${record.accuracy}%</span>
                            <span>平均: ${record.avgTime}秒/题</span>
                            <span>得分: ${record.score}</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'match') {
        const history = getMatchHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无连线记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>正确率: ${record.accuracy}%</span>
                            <span>平均: ${record.avgTime}秒/题</span>
                            <span>得分: ${record.score}</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'brainteaser') {
        const history = getBTHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无脑筋急转弯记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>完成率: ${record.completionRate}%</span>
                            <span>用时: ${record.totalTime}秒</span>
                            <span>已看: ${record.viewedCount}/${record.questionCount}题</span>
                        </div>
                    </div>
                `;
            });
        }
    } else if (type === 'seek') {
        const history = getSeekHistory();
        if (history.length === 0) {
            html = '<div class="history-empty">暂无捉迷藏记录</div>';
        } else {
            history.slice(0, 10).forEach(record => {
                html += `
                    <div class="history-item">
                        <div class="history-date">${record.date}</div>
                        <div class="history-details">
                            <span>正确率: ${record.accuracy}%</span>
                            <span>用时: ${record.totalTime}秒</span>
                            <span>得分: ${record.score}</span>
                        </div>
                    </div>
                `;
            });
        }
    }

    historyList.innerHTML = html;
}

// 从个人中心修改等级
function changeGradeFromProfile(grade) {
    if (!gradeConfig[grade]) return;

    currentGrade = grade;
    saveUserGrade(grade);
    updateGradeDisplay();

    // 更新个人中心显示
    document.getElementById('profile-grade-badge').textContent = gradeConfig[grade].name;
    document.getElementById('profile-grade-desc').textContent = gradeConfig[grade].description;
}

// 更新个人中心页面
function updateProfilePage() {
    // 更新用户名
    var profileName = document.getElementById('profile-username');
    if (profileName) profileName.textContent = getUserName() || '-';

    // 更新统计
    document.getElementById('total-math-quizzes').textContent = getMathHistory().length;
    document.getElementById('total-memory-games').textContent = getMemoryHistory().length;
    document.getElementById('total-pattern-games').textContent = getPatternHistory().length;
    document.getElementById('total-compare-games').textContent = getCompareHistory().length;
    document.getElementById('total-sudoku-games').textContent = getSudokuHistory().length;
    document.getElementById('total-sort-games').textContent = getSortHistory().length;
    document.getElementById('total-sum-games').textContent = getSumHistory().length;
    document.getElementById('total-clock-games').textContent = getClockHistory().length;
    document.getElementById('total-match-games').textContent = getMatchHistory().length;
    document.getElementById('total-bt-games').textContent = getBTHistory().length;
    document.getElementById('total-seek-games').textContent = getSeekHistory().length;

    // 更新能力值
    document.getElementById('math-ability').textContent = getMathAbility();
    document.getElementById('memory-ability').textContent = getMemoryAbility();
    document.getElementById('pattern-ability').textContent = getPatternAbility();
    document.getElementById('compare-ability').textContent = getCompareAbility();
    document.getElementById('sudoku-ability').textContent = getSudokuAbility();
    document.getElementById('sort-ability').textContent = getSortAbility();
    document.getElementById('sum-ability').textContent = getSumAbility();
    document.getElementById('clock-ability').textContent = getClockAbility();
    document.getElementById('match-ability').textContent = getMatchAbility();
    document.getElementById('bt-ability').textContent = getBTAbility();
    document.getElementById('seek-ability').textContent = getSeekAbility();

    // 更新等级显示
    document.getElementById('profile-grade-badge').textContent = gradeConfig[currentGrade].name;
    document.getElementById('profile-grade-desc').textContent = gradeConfig[currentGrade].description;

    // 同步下拉选择框
    var gradeSelect = document.getElementById('profile-grade-select');
    if (gradeSelect) gradeSelect.value = currentGrade;

    // 同步语音选择
    var voiceSelect = document.getElementById('voice-style-select');
    if (voiceSelect) voiceSelect.value = currentVoiceStyle;

    // 绘制雷达图
    drawRadarChart();

    // 显示历史记录
    showHistory('math');
}

// 切换用户（清除数据重新开始）
function switchUser() {
    if (confirm('切换用户将清除当前所有数据，是否继续？')) {
        localStorage.removeItem(STORAGE_KEYS.MATH_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.MEMORY_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.PATTERN_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.COMPARE_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.SUDOKU_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.SORT_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.SUM_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.CLOCK_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.MATCH_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.MATH_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.MEMORY_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.PATTERN_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.COMPARE_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.SUDOKU_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.SORT_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.SUM_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.CLOCK_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.MATCH_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.BRAINTEASER_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.BRAINTEASER_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.SEEK_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.SEEK_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.USER_GRADE);
        localStorage.removeItem(STORAGE_KEYS.USER_NAME);

        initStorage();
        showPage('welcome-page');
    }
}

// 清除所有数据
function clearAllData() {
    if (confirm('确定要清除所有学习数据吗？此操作不可恢复，需要重新选择年级。')) {
        localStorage.removeItem(STORAGE_KEYS.MATH_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.MEMORY_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.PATTERN_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.COMPARE_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.SUDOKU_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.SORT_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.SUM_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.CLOCK_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.MATCH_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.MATH_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.MEMORY_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.PATTERN_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.COMPARE_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.SUDOKU_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.SORT_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.SUM_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.CLOCK_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.MATCH_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.BRAINTEASER_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.BRAINTEASER_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.SEEK_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.SEEK_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.USER_GRADE);
        localStorage.removeItem(STORAGE_KEYS.USER_NAME);

        initStorage();
        updateProfilePage();
        alert('数据已清除，即将返回首页重新选择年级');
        goHome();
    }
}

// 首次欢迎页面选择年级
function selectWelcomeGrade(btn) {
    const nameInput = document.getElementById('welcome-username');
    const name = nameInput ? nameInput.value.trim() : '';

    if (!name) {
        alert('请先输入你的名字');
        if (nameInput) nameInput.focus();
        return;
    }

    const grade = btn.dataset.grade;

    // 保存用户名和年级
    saveUserName(name);
    saveUserGrade(grade);

    // 设置当前年级
    currentGrade = grade;
    updateGradeDisplay();

    // 更新首页用户信息
    updateHomeUserInfo();

    // 切换到主页面
    showPage('home-page');
}

// 显示个人中心页面
function showProfile() {
    showPage('profile-page');
    updateProfilePage();
}

// 初始化存储
initStorage();
