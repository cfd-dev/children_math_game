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
    document.getElementById('math-reward').style.display = 'none';
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
    document.getElementById('pattern-reward').style.display = 'none';
    document.getElementById('pattern-result').style.display = 'none';

    // 停止找规律计时器
    if (patternState.timerInterval) {
        clearInterval(patternState.timerInterval);
    }

    // 重置比大小页面
    document.getElementById('compare-setup').style.display = 'block';
    document.getElementById('compare-quiz').style.display = 'none';
    document.getElementById('compare-reward').style.display = 'none';
    document.getElementById('compare-result').style.display = 'none';

    // 停止比大小计时器
    if (compareState.timerInterval) {
        clearInterval(compareState.timerInterval);
    }

    // 重置数独页面
    document.getElementById('sudoku-setup').style.display = 'block';
    document.getElementById('sudoku-quiz').style.display = 'none';
    document.getElementById('sudoku-reward').style.display = 'none';
    document.getElementById('sudoku-result').style.display = 'none';

    // 停止数独计时器
    if (sudokuState.timerInterval) {
        clearInterval(sudokuState.timerInterval);
    }

    // 重置数字排序页面
    document.getElementById('sort-setup').style.display = 'block';
    document.getElementById('sort-quiz').style.display = 'none';
    document.getElementById('sort-reward').style.display = 'none';
    document.getElementById('sort-result').style.display = 'none';

    // 停止排序计时器
    if (sortState.timerInterval) {
        clearInterval(sortState.timerInterval);
    }

    // 重置凑十法页面
    document.getElementById('sum-setup').style.display = 'block';
    document.getElementById('sum-quiz').style.display = 'none';
    document.getElementById('sum-reward').style.display = 'none';
    document.getElementById('sum-result').style.display = 'none';

    // 停止凑十计时器
    if (sumState.timerInterval) {
        clearInterval(sumState.timerInterval);
    }

    // 重置时钟认知页面
    document.getElementById('clock-setup').style.display = 'block';
    document.getElementById('clock-quiz').style.display = 'none';
    document.getElementById('clock-reward').style.display = 'none';
    document.getElementById('clock-result').style.display = 'none';

    // 停止时钟计时器
    if (clockState.timerInterval) {
        clearInterval(clockState.timerInterval);
    }

    // 重置数学连线页面
    document.getElementById('match-setup').style.display = 'block';
    document.getElementById('match-quiz').style.display = 'none';
    document.getElementById('match-reward').style.display = 'none';
    document.getElementById('match-result').style.display = 'none';

    // 停止连线计时器
    if (matchState.timerInterval) {
        clearInterval(matchState.timerInterval);
    }

    // 重置脑筋急转弯页面
    document.getElementById('brainteaser-setup').style.display = 'block';
    document.getElementById('brainteaser-quiz').style.display = 'none';
    document.getElementById('brainteaser-result').style.display = 'none';

    // 停止脑筋急转弯计时器
    if (btState.timerInterval) {
        clearInterval(btState.timerInterval);
    }

    // 重置数字捉迷藏页面
    document.getElementById('seek-setup').style.display = 'block';
    document.getElementById('seek-quiz').style.display = 'none';
    document.getElementById('seek-reward').style.display = 'none';
    document.getElementById('seek-result').style.display = 'none';

    // 停止捉迷藏计时器
    if (seekState.timerInterval) {
        clearInterval(seekState.timerInterval);
    }

    // 重置24点游戏页面
    document.getElementById('twentyfour-setup').style.display = 'block';
    document.getElementById('twentyfour-quiz').style.display = 'none';
    document.getElementById('twentyfour-reward').style.display = 'none';
    document.getElementById('twentyfour-result').style.display = 'none';

    // 停止24点计时器
    if (twentyFourState.timerInterval) {
        clearInterval(twentyFourState.timerInterval);
    }

    // 重置迷宫游戏页面
    document.getElementById('maze-setup').style.display = 'block';
    document.getElementById('maze-quiz').style.display = 'none';
    document.getElementById('maze-reward').style.display = 'none';
    document.getElementById('maze-result').style.display = 'none';

    // 停止迷宫计时器
    if (mazeState.timerInterval) {
        clearInterval(mazeState.timerInterval);
    }
    // 移除迷宫键盘事件
    if (mazeState.keyHandler) {
        document.removeEventListener('keydown', mazeState.keyHandler);
        mazeState.keyHandler = null;
    }
    // 移除迷宫窗口大小变化事件
    if (mazeState.resizeHandler) {
        window.removeEventListener('resize', mazeState.resizeHandler);
        mazeState.resizeHandler = null;
    }
    if (mazeState.resizeTimer) {
        clearTimeout(mazeState.resizeTimer);
        mazeState.resizeTimer = null;
    }

    // 重置认识人民币页面
    document.getElementById('rmb-setup').style.display = 'block';
    document.getElementById('rmb-quiz').style.display = 'none';
    document.getElementById('rmb-reward').style.display = 'none';
    document.getElementById('rmb-result').style.display = 'none';

    // 停止人民币计时器
    if (rmbState.timerInterval) {
        clearInterval(rmbState.timerInterval);
    }

    // 隐藏捐赠二维码
    var donateQr = document.getElementById('donate-qr-area');
    if (donateQr) donateQr.style.display = 'none';

    // 更新首页用户信息
    updateHomeUserInfo();

    // 检查游戏时间
    checkPlayTime(function() {
        showPage('home-page');
    });
}

// ========== 游戏时间控制 ==========
var REST_THRESHOLD = 20 * 60 * 1000;   // 20分钟
var PARENT_THRESHOLD = 40 * 60 * 1000; // 40分钟
var REST_DURATION = 120;               // 休息120秒

var restTimerInterval = null;
var playStartTime = parseInt(sessionStorage.getItem('playStartTime')) || 0;
var parentChallengeAnswer = 0;

if (!playStartTime) {
    playStartTime = Date.now();
    sessionStorage.setItem('playStartTime', playStartTime);
}

function checkPlayTime(callback) {
    var elapsed = Date.now() - playStartTime;
    if (elapsed >= PARENT_THRESHOLD) {
        showParentScreen(callback);
    } else if (elapsed >= REST_THRESHOLD) {
        showRestScreen(elapsed, callback);
    } else {
        callback();
    }
}

function showRestScreen(elapsed, callback) {
    var minutes = Math.floor(elapsed / 60000);
    document.getElementById('rest-elapsed').textContent = minutes;
    document.getElementById('rest-screen').style.display = 'flex';

    var remaining = REST_DURATION;
    updateRestCountdown(remaining);

    restTimerInterval = setInterval(function() {
        remaining--;
        updateRestCountdown(remaining);
        if (remaining <= 0) {
            clearInterval(restTimerInterval);
            restTimerInterval = null;
            document.getElementById('rest-screen').style.display = 'none';
            playStartTime = Date.now();
            sessionStorage.setItem('playStartTime', playStartTime);
            callback();
        }
    }, 1000);
}

function updateRestCountdown(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    document.getElementById('rest-countdown').textContent = m + ':' + (s < 10 ? '0' : '') + s;
}

function showParentScreen(callback) {
    var a = Math.floor(Math.random() * 90) + 10; // 10~99
    var b = Math.floor(Math.random() * 90) + 10;
    parentChallengeAnswer = a * b;
    document.getElementById('parent-question').textContent = a + ' × ' + b + ' = ?';
    document.getElementById('parent-answer').value = '';
    document.getElementById('parent-hint').textContent = '（小朋友可以请爸妈帮忙哦）';
    document.getElementById('parent-hint').style.color = '#95a5a6';
    document.getElementById('parent-screen').style.display = 'flex';
    window._parentCallback = callback;
}

function verifyParent() {
    var input = parseInt(document.getElementById('parent-answer').value);
    if (input === parentChallengeAnswer) {
        document.getElementById('parent-screen').style.display = 'none';
        playStartTime = Date.now();
        sessionStorage.setItem('playStartTime', playStartTime);
        if (window._parentCallback) window._parentCallback();
    } else {
        document.getElementById('parent-hint').textContent = '答案不正确，请重试';
        document.getElementById('parent-hint').style.color = '#e74c3c';
        document.getElementById('parent-answer').value = '';
        // 生成新题目
        var a = Math.floor(Math.random() * 90) + 10;
        var b = Math.floor(Math.random() * 90) + 10;
        parentChallengeAnswer = a * b;
        document.getElementById('parent-question').textContent = a + ' × ' + b + ' = ?';
    }
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

// 显示数独页面
function showSudokuGame() {
    var config = gradeConfig[currentGrade];
    var sConfig = sudokuGradeConfig[currentGrade] || sudokuGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('sudoku-grade-name');
    var gradeDescEl = document.getElementById('sudoku-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = sConfig.description;
    showPage('sudoku-page');
}

// 显示数字排序页面
function showSortGame() {
    var config = gradeConfig[currentGrade];
    var sConfig = sortGradeConfig[currentGrade] || sortGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('sort-grade-name');
    var gradeDescEl = document.getElementById('sort-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = sConfig.description;
    showPage('sort-page');
}

// 显示凑十法页面
function showSumGame() {
    var config = gradeConfig[currentGrade];
    var sConfig = sumGradeConfig[currentGrade] || sumGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('sum-grade-name');
    var gradeDescEl = document.getElementById('sum-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = sConfig.description;
    showPage('sum-page');
}

// 显示时钟认知页面
function showClockGame() {
    var config = gradeConfig[currentGrade];
    var cConfig = clockGradeConfig[currentGrade] || clockGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('clock-grade-name');
    var gradeDescEl = document.getElementById('clock-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = cConfig.description;
    showPage('clock-page');
}

// 显示数学连线页面
function showMatchGame() {
    var config = gradeConfig[currentGrade];
    var mConfig = matchGradeConfig[currentGrade] || matchGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('match-grade-name');
    var gradeDescEl = document.getElementById('match-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = mConfig.description;
    showPage('match-page');
}

// 显示脑筋急转弯页面
function showBrainTeaserGame() {
    var config = gradeConfig[currentGrade];
    var bConfig = btGradeConfig[currentGrade] || btGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('bt-grade-name');
    var gradeDescEl = document.getElementById('bt-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = bConfig.description;
    showPage('brainteaser-page');
}

// 显示数字捉迷藏页面
function showSeekGame() {
    var config = gradeConfig[currentGrade];
    var sConfig = seekGradeConfig[currentGrade] || seekGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('seek-grade-name');
    var gradeDescEl = document.getElementById('seek-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = sConfig.description;
    showPage('seek-page');
}

// 显示24点游戏页面
function show24Game() {
    var config = gradeConfig[currentGrade];
    var tfConfig = twentyFourGradeConfig[currentGrade] || twentyFourGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('twentyfour-grade-name');
    var gradeDescEl = document.getElementById('twentyfour-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = tfConfig.description;
    showPage('twentyfour-page');
}

// 显示迷宫游戏页面
function showMazeGame() {
    var config = gradeConfig[currentGrade];
    var mConfig = mazeGradeConfig[currentGrade] || mazeGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('maze-grade-name');
    var gradeDescEl = document.getElementById('maze-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = mConfig.description;

    // 填充迷宫大小下拉框
    var select = document.getElementById('maze-size-select');
    if (select) {
        var defaultSize = mConfig.size;
        var minSize = Math.max(5, defaultSize - 10);
        var maxSize = defaultSize + 10;
        select.innerHTML = '';
        for (var s = minSize; s <= maxSize; s += 5) {
            var opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s + '×' + s;
            if (s === defaultSize) opt.textContent += '（默认）';
            select.appendChild(opt);
        }
        if (defaultSize < minSize || defaultSize > maxSize || (defaultSize - minSize) % 5 !== 0) {
            var opt0 = document.createElement('option');
            opt0.value = defaultSize;
            opt0.textContent = defaultSize + '×' + defaultSize + '（默认）';
            select.insertBefore(opt0, select.firstChild);
            select.value = defaultSize;
        } else {
            select.value = defaultSize;
        }
    }

    showPage('maze-page');
}

// 显示认识人民币页面
function showRMBGame() {
    var config = gradeConfig[currentGrade];
    var rConfig = rmbGradeConfig[currentGrade] || rmbGradeConfig['grade-1'];
    var gradeNameEl = document.getElementById('rmb-grade-name');
    var gradeDescEl = document.getElementById('rmb-grade-desc');
    if (gradeNameEl) gradeNameEl.textContent = config.name;
    if (gradeDescEl) gradeDescEl.textContent = rConfig.description;
    showPage('rmb-page');
}

// 显示关于页面
function showAboutPage() {
    showPage('about-page');
}

// EmailJS 配置 - 请替换为你自己的值
var EMAILJS_PUBLIC_KEY = 'nhyb3VyyrK6umNt-p';
var EMAILJS_SERVICE_ID = 'service_3uzeqlr';
var EMAILJS_TEMPLATE_ID = 'template_yj1gowl';

// 初始化 EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

function submitFeedback() {
    var text = document.getElementById('feedback-text').value.trim();
    if (!text) {
        alert('请输入反馈意见');
        return;
    }
    if (EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
        alert('邮件服务尚未配置，请联系开发者');
        return;
    }
    var btn = document.querySelector('.feedback-submit-btn');
    btn.textContent = '发送中...';
    btn.disabled = true;
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        message: text,
        to_email: 'cfd_dev@126.com'
    }).then(function() {
        alert('反馈已发送，感谢您的意见！');
        document.getElementById('feedback-text').value = '';
    }, function(err) {
        alert('发送失败，请稍后再试');
        console.error('EmailJS error:', err);
    }).finally(function() {
        btn.textContent = '提交反馈';
        btn.disabled = false;
    });
}

// 捐赠金额选择
function selectDonate(btn, amount) {
    var btns = document.querySelectorAll('.donate-option-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('selected');
    }
    btn.classList.add('selected');

    var filename = amount === 'x'
        ? 'assets/alipay_x.jpg'
        : 'assets/alipay_' + amount + '.jpg';
    var label = amount === 'x' ? '其他金额' : amount + ' 元';

    document.getElementById('donate-qr-img').src = filename;
    document.getElementById('donate-qr-amount').textContent = '支付宝扫码支付 · ' + label;
    document.getElementById('donate-qr-area').style.display = 'block';
    document.getElementById('donate-qr-area').scrollIntoView({ behavior: 'smooth' });
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('数学小达人应用已加载');

    try {
        // 初始化存储
        initStorage();

        // 初始化声音图标状态
        if (typeof updateSoundIcon === 'function') updateSoundIcon();

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
