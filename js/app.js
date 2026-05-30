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
    document.getElementById('memory-result').style.display = 'none';

    // 显示首页
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

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('数学小达人应用已加载');

    try {
        // 初始化存储
        initStorage();

        // 检查是否是首次用户
        if (isFirstTimeUser()) {
            // 首次用户，显示欢迎页面选择年级
            showPage('welcome-page');
        } else {
            // 返回用户，加载保存的年级
            var savedGrade = getUserGrade();
            if (savedGrade && gradeConfig[savedGrade]) {
                currentGrade = savedGrade;
                updateGradeDisplay();
            }
            showPage('home-page');
        }
    } catch (e) {
        console.error('初始化出错:', e);
        // 出错时至少显示欢迎页
        showPage('welcome-page');
    }
});
