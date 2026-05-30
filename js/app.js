// 主应用逻辑

// 页面切换函数
function showPage(pageId) {
    // 隐藏所有页面（包括默认显示的欢迎页）
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });

    // 显示目标页面
    var target = document.getElementById(pageId);
    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
    }
}

// 更新首页用户信息
function updateHomeUserInfo() {
    var name = getUserName();
    var gradeName = gradeConfig[currentGrade] ? gradeConfig[currentGrade].name : '';

    var greeting = document.getElementById('home-user-greeting');
    var gradeLabel = document.getElementById('home-user-grade');

    if (greeting) greeting.textContent = name ? name + '，你好！' : '你好！';
    if (gradeLabel) gradeLabel.textContent = gradeName;
}

// 返回首页
function goHome() {
    // 停止所有计时器
    if (mathState.timerInterval) {
        clearInterval(mathState.timerInterval);
    }
    if (memoryState.timerInterval) {
        clearInterval(memoryState.timerInterval);
    }

    // 隐藏数字键盘
    if (typeof numpad !== 'undefined') numpad.hide();

    // 隐藏通知
    if (typeof hideGradeChangeNotification === 'function') {
        hideGradeChangeNotification();
    }

    // 重置数学练习页面
    document.getElementById('math-setup').style.display = 'block';
    document.getElementById('math-quiz').style.display = 'none';
    document.getElementById('math-result').style.display = 'none';

    // 重置记忆游戏页面
    document.getElementById('memory-setup').style.display = 'block';
    document.getElementById('memory-show').style.display = 'none';
    document.getElementById('memory-input').style.display = 'none';
    document.getElementById('memory-reward').style.display = 'none';
    document.getElementById('memory-result').style.display = 'none';

    // 重置找规律页面
    document.getElementById('pattern-setup').style.display = 'block';
    document.getElementById('pattern-quiz').style.display = 'none';
    document.getElementById('pattern-result').style.display = 'none';

    // 停止找规律计时器
    if (patternState.timerInterval) {
        clearInterval(patternState.timerInterval);
    }

    // 重置比大小页面
    document.getElementById('compare-setup').style.display = 'block';
    document.getElementById('compare-quiz').style.display = 'none';
    document.getElementById('compare-result').style.display = 'none';

    // 停止比大小计时器
    if (compareState.timerInterval) {
        clearInterval(compareState.timerInterval);
    }

    // 更新首页用户信息并显示
    updateHomeUserInfo();
    showPage('home-page');
}

// 确保页面加载后立即隐藏非活动页面（防止CSS/JS加载延迟导致全部显示）
(function() {
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
        if (pages[i].id !== 'welcome-page') {
            pages[i].style.display = 'none';
        }
    }
})();

// 显示快速计算页面
function showMathQuiz() {
    showPage('math-page');
}

// 显示数字记忆页面
function showMemoryGame() {
    showPage('memory-page');
}

// 显示找规律页面
function showPatternGame() {
    // 更新当前难度显示
    var config = gradeConfig[currentGrade];
    var pConfig = patternGradeConfig[currentGrade] || patternGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('pattern-grade-name');
    var gradeDescEl = document.getElementById('pattern-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = pConfig.description;
    showPage('pattern-page');
}

// 显示比大小页面
function showCompareGame() {
    var config = gradeConfig[currentGrade];
    var cConfig = compareGradeConfig[currentGrade] || compareGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('compare-grade-name');
    var gradeDescEl = document.getElementById('compare-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = cConfig.description;
    showPage('compare-page');
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('数学小达人应用已加载');

    try {
        // 初始化存储
        initStorage();

        // 检查是否是首次用户
        if (isFirstTimeUser()) {
            // 首次用户，显示欢迎页面创建用户和选择年级
            showPage('welcome-page');
        } else {
            // 返回用户，加载保存的年级和用户名
            var savedGrade = getUserGrade();
            if (savedGrade && gradeConfig[savedGrade]) {
                currentGrade = savedGrade;
                updateGradeDisplay();
            }
            updateHomeUserInfo();
            showPage('home-page');
        }
    } catch (e) {
        console.error('初始化出错:', e);
        // 出错时至少显示欢迎页
        showPage('welcome-page');
    }
});
