// 个人中心模块

// 数据存储键名
const STORAGE_KEYS = {
    MATH_HISTORY: 'mathQuizHistory',
    MEMORY_HISTORY: 'memoryGameHistory',
    MATH_ABILITY: 'mathAbility',
    MEMORY_ABILITY: 'memoryAbility',
    USER_GRADE: 'userGrade'
};

// 初始化本地存储
function initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.MATH_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.MATH_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMORY_HISTORY)) {
        localStorage.setItem(STORAGE_KEYS.MEMORY_HISTORY, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATH_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.MATH_ABILITY, '50');
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMORY_ABILITY)) {
        localStorage.setItem(STORAGE_KEYS.MEMORY_ABILITY, '50');
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

// 检查是否是首次使用
function isFirstTimeUser() {
    return !getUserGrade();
}

// 获取历史记录
function getMathHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MATH_HISTORY) || '[]');
}

function getMemoryHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMORY_HISTORY) || '[]');
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

// 获取能力值
function getMathAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.MATH_ABILITY) || '50');
}

function getMemoryAbility() {
    return parseInt(localStorage.getItem(STORAGE_KEYS.MEMORY_ABILITY) || '50');
}

// 绘制雷达图
function drawRadarChart() {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    const mathAbility = getMathAbility();
    const memoryAbility = getMemoryAbility();

    // 数据点
    const data = [mathAbility, memoryAbility];
    const labels = ['算术能力', '记忆能力'];
    const angles = [Math.PI / 2, -Math.PI / 2]; // 两个顶点的位置

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景网格
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    // 绘制同心圆
    for (let i = 1; i <= 5; i++) {
        const r = (radius * i) / 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
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

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
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
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制标签
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < labels.length; i++) {
        const labelRadius = radius + 30;
        const x = centerX + labelRadius * Math.cos(angles[i]);
        const y = centerY - labelRadius * Math.sin(angles[i]);

        ctx.fillText(labels[i], x, y);

        // 显示数值
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(data[i], x, y + 20);
        ctx.fillStyle = '#333';
        ctx.font = '14px sans-serif';
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
    } else {
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
    // 更新统计
    const mathHistory = getMathHistory();
    const memoryHistory = getMemoryHistory();

    document.getElementById('total-math-quizzes').textContent = mathHistory.length;
    document.getElementById('total-math-correct').textContent =
        mathHistory.reduce((sum, r) => sum + Math.round(r.accuracy * r.questionCount / 100), 0);

    document.getElementById('total-memory-games').textContent = memoryHistory.length;
    document.getElementById('total-memory-levels').textContent =
        memoryHistory.reduce((sum, r) => sum + r.level, 0);

    // 更新能力值
    document.getElementById('math-ability').textContent = getMathAbility();
    document.getElementById('memory-ability').textContent = getMemoryAbility();

    // 更新等级显示
    document.getElementById('profile-grade-badge').textContent = gradeConfig[currentGrade].name;
    document.getElementById('profile-grade-desc').textContent = gradeConfig[currentGrade].description;

    // 同步下拉选择框
    var gradeSelect = document.getElementById('profile-grade-select');
    if (gradeSelect) gradeSelect.value = currentGrade;

    // 绘制雷达图
    drawRadarChart();

    // 显示历史记录
    showHistory('math');
}

// 清除所有数据
function clearAllData() {
    if (confirm('确定要清除所有学习数据吗？此操作不可恢复，需要重新选择年级。')) {
        localStorage.removeItem(STORAGE_KEYS.MATH_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.MEMORY_HISTORY);
        localStorage.removeItem(STORAGE_KEYS.MATH_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.MEMORY_ABILITY);
        localStorage.removeItem(STORAGE_KEYS.USER_GRADE);

        initStorage();
        updateProfilePage();
        alert('数据已清除，即将返回首页重新选择年级');
        goHome();
    }
}

// 首次欢迎页面选择年级
function selectWelcomeGrade(btn) {
    const grade = btn.dataset.grade;

    // 保存年级
    saveUserGrade(grade);

    // 设置当前年级
    currentGrade = grade;
    updateGradeDisplay();

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
