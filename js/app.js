// 主应用逻辑

// 页面切换函数
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 显示目标页面
    document.getElementById(pageId).classList.add('active');
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

    // 初始化存储
    initStorage();

    // 检查是否是首次用户
    if (isFirstTimeUser()) {
        // 首次用户，显示欢迎页面选择年级
        showPage('welcome-page');
    } else {
        // 返回用户，加载保存的年级
        const savedGrade = getUserGrade();
        if (savedGrade && gradeConfig[savedGrade]) {
            currentGrade = savedGrade;
            updateGradeDisplay();
        }
        showPage('home-page');
    }
});
