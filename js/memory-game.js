// 数字记忆游戏模块
let memoryState = {
    level: 1,
    roundInLevel: 1,
    score: 0,
    currentNumbers: '',
    blankPositions: [],
    correctAnswers: [],
    totalCorrect: 0,
    timerInterval: null,
    timeLeft: 10,
    maxTime: 10,
    isProcessing: false
};

// 关卡配置（每关10题，难度越低显示时间越短）
const levelConfig = [
    { digitLength: 4, blankCount: 1, displayTime: 4 },   // 第1关
    { digitLength: 4, blankCount: 2, displayTime: 5 },   // 第2关
    { digitLength: 4, blankCount: 4, displayTime: 6 },   // 第3关
    { digitLength: 6, blankCount: 2, displayTime: 6 },   // 第4关
    { digitLength: 6, blankCount: 3, displayTime: 7 },   // 第5关
    { digitLength: 6, blankCount: 6, displayTime: 8 },   // 第6关
    { digitLength: 8, blankCount: 3, displayTime: 8 },   // 第7关
    { digitLength: 8, blankCount: 4, displayTime: 9 },   // 第8关
    { digitLength: 8, blankCount: 8, displayTime: 10 },  // 第9关
];

const ROUNDS_PER_LEVEL = 10;

// 生成随机数字串
function generateNumberString(length) {
    let numbers = '';
    for (let i = 0; i < length; i++) {
        numbers += Math.floor(Math.random() * 10).toString();
    }
    return numbers;
}

// 随机选择空缺位置
function selectBlankPositions(length, count) {
    const positions = [];
    const allPositions = Array.from({ length: length }, (_, i) => i);

    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * allPositions.length);
        positions.push(allPositions[randomIndex]);
        allPositions.splice(randomIndex, 1);
    }

    return positions.sort((a, b) => a - b);
}

// 获取当前关卡配置
function getLevelConfig() {
    const index = Math.min(memoryState.level - 1, levelConfig.length - 1);
    return levelConfig[index];
}

// 开始记忆游戏
function startMemoryGame() {
    // 重置状态
    memoryState.level = 1;
    memoryState.roundInLevel = 1;
    memoryState.score = 0;
    memoryState.totalCorrect = 0;
    memoryState.isProcessing = false;

    // 切换显示
    document.getElementById('memory-setup').style.display = 'none';
    document.getElementById('memory-result').style.display = 'none';
    document.getElementById('memory-input').style.display = 'none';
    document.getElementById('memory-show').style.display = 'block';

    // 播放开始音效
    playStartSound();

    // 显示第一轮
    showMemoryRound();
}

// 显示记忆轮次
function showMemoryRound() {
    memoryState.isProcessing = false;
    const config = getLevelConfig();

    // 生成数字和空缺位置
    memoryState.currentNumbers = generateNumberString(config.digitLength);
    memoryState.blankPositions = selectBlankPositions(config.digitLength, config.blankCount);
    memoryState.correctAnswers = memoryState.blankPositions.map(pos => memoryState.currentNumbers[pos]);

    // 更新显示
    document.getElementById('memory-level').textContent = `第 ${memoryState.level} 关`;
    document.getElementById('memory-round').textContent = `第 ${memoryState.roundInLevel}/${ROUNDS_PER_LEVEL} 题`;
    document.getElementById('memory-score').textContent = `得分：${memoryState.score}`;

    // 显示数字（带空格）
    const displayNumbers = memoryState.currentNumbers.split('').join(' ');
    document.getElementById('memory-numbers').textContent = displayNumbers;

    // 根据关卡设置显示时间
    memoryState.maxTime = config.displayTime;
    memoryState.timeLeft = config.displayTime;
    var timerFill = document.querySelector('.timer-fill');
    var timerText = document.getElementById('memory-timer-text');
    timerFill.style.width = '100%';
    if (timerText) timerText.textContent = memoryState.timeLeft + '秒';

    // 清除之前的定时器
    if (memoryState.timerInterval) {
        clearInterval(memoryState.timerInterval);
    }

    // 开始倒计时
    memoryState.timerInterval = setInterval(() => {
        memoryState.timeLeft--;
        if (timerText) timerText.textContent = memoryState.timeLeft + '秒';
        timerFill.style.width = `${(memoryState.timeLeft / memoryState.maxTime) * 100}%`;

        if (memoryState.timeLeft <= 0) {
            clearInterval(memoryState.timerInterval);
            showMemoryInput();
        }
    }, 1000);
}

// 创建记忆答案输入框
function createMemoryAnswerBoxes() {
    const config = getLevelConfig();
    const container = document.getElementById('memory-answer-boxes');
    container.innerHTML = '';

    // 显示完整的数字框架，空缺位置用输入框
    for (let i = 0; i < config.digitLength; i++) {
        const isBlank = memoryState.blankPositions.includes(i);

        if (isBlank) {
            const input = document.createElement('input');
            input.type = 'text';
            input.inputMode = 'none';
            input.className = 'answer-box memory-box';
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
            input.setAttribute('spellcheck', 'false');
            input.maxLength = 1;
            input.dataset.position = i;
            input.placeholder = '?';

            input.addEventListener('input', handleMemoryBoxInput);
            input.addEventListener('keydown', handleMemoryBoxKeydown);
            input.addEventListener('focus', function() {
                this.select();
                if (typeof numpad !== 'undefined') numpad.show(this);
            });
            input.addEventListener('touchstart', function() {
                if (typeof numpad !== 'undefined') numpad.show(this);
            }, { passive: true });

            container.appendChild(input);
        } else {
            const span = document.createElement('span');
            span.className = 'memory-fixed-digit';
            span.textContent = memoryState.currentNumbers[i];
            container.appendChild(span);
        }
    }

    // 聚焦第一个输入框
    const firstInput = container.querySelector('.memory-box');
    if (firstInput) {
        firstInput.focus();
    }
}

// 处理记忆输入框输入
function handleMemoryBoxInput(e) {
    if (memoryState.isProcessing) return;

    const input = e.target;
    const position = parseInt(input.dataset.position);

    // 只允许数字
    input.value = input.value.replace(/[^0-9]/g, '');

    // 输入数字后隐藏placeholder的"?"
    if (input.value.length === 1) {
        input.placeholder = '';

        // 自动跳转到下一个输入框
        const allInputs = Array.from(document.querySelectorAll('.memory-box'));
        const currentIndex = allInputs.indexOf(input);
        const nextInput = allInputs[currentIndex + 1];

        if (nextInput) {
            nextInput.focus();
        } else {
            // 所有框都已填入，自动提交
            checkAllBoxesFilled();
        }
    } else {
        // 清空时恢复placeholder
        input.placeholder = '?';
    }
}

// 处理记忆输入框按键事件
function handleMemoryBoxKeydown(e) {
    if (memoryState.isProcessing) return;

    const input = e.target;
    const allInputs = Array.from(document.querySelectorAll('.memory-box'));
    const currentIndex = allInputs.indexOf(input);

    if (e.key === 'Backspace') {
        if (input.value === '' && currentIndex > 0) {
            const prevInput = allInputs[currentIndex - 1];
            prevInput.value = '';
            prevInput.placeholder = '?';
            prevInput.focus();
            e.preventDefault();
        } else {
            // 清空当前框时恢复placeholder
            input.placeholder = '?';
        }
    }
}

// 检查是否所有输入框都已填入
function checkAllBoxesFilled() {
    const inputs = document.querySelectorAll('.memory-box');
    const allFilled = Array.from(inputs).every(input => input.value.length === 1);

    if (allFilled) {
        submitMemoryAnswer();
    }
}

// 显示输入界面
function showMemoryInput() {
    // 切换显示
    document.getElementById('memory-show').style.display = 'none';
    document.getElementById('memory-input').style.display = 'block';

    // 更新信息
    document.getElementById('memory-level2').textContent = `第 ${memoryState.level} 关`;
    document.getElementById('memory-round2').textContent = `第 ${memoryState.roundInLevel}/${ROUNDS_PER_LEVEL} 题`;
    document.getElementById('memory-score2').textContent = `得分：${memoryState.score}`;

    // 更新提示
    const config = getLevelConfig();
    document.getElementById('memory-input-hint').textContent =
        `请填出 ${memoryState.blankPositions.length} 个空缺位置的数字（标记?的位置）：`;

    // 清空反馈
    document.getElementById('memory-feedback').textContent = '';
    document.getElementById('memory-feedback').className = 'feedback';

    // 创建答案输入框
    createMemoryAnswerBoxes();
}

// 提交记忆答案
function submitMemoryAnswer() {
    if (memoryState.isProcessing) return;

    const inputs = document.querySelectorAll('.memory-box');
    const userAnswers = Array.from(inputs).map(input => input.value);

    memoryState.isProcessing = true;

    // 隐藏数字键盘
    if (typeof numpad !== 'undefined') numpad.hide();

    const feedback = document.getElementById('memory-feedback');

    // 比较答案
    let allCorrect = true;
    for (let i = 0; i < inputs.length; i++) {
        const position = parseInt(inputs[i].dataset.position);
        if (inputs[i].value !== memoryState.currentNumbers[position]) {
            allCorrect = false;
            break;
        }
    }

    // 禁用输入框
    inputs.forEach(input => {
        input.disabled = true;
        input.classList.add('disabled');
    });

    if (allCorrect) {
        // 答对了
        const roundScore = memoryState.level * 10;
        memoryState.score += roundScore;
        memoryState.totalCorrect++;

        // 输入框变绿
        inputs.forEach(input => input.classList.add('correct'));

        feedback.textContent = `✓ 完全正确！+${roundScore}分`;
        feedback.className = 'feedback correct';

        // 播放正确音效
        playCorrectSound();
        speakCorrect();

        // 延迟后进入下一题或显示过关奖励
        setTimeout(() => {
            memoryState.roundInLevel++;

            if (memoryState.roundInLevel > ROUNDS_PER_LEVEL) {
                // 通过当前关卡，显示奖励画面
                showLevelReward();
            } else {
                document.getElementById('memory-input').style.display = 'none';
                document.getElementById('memory-show').style.display = 'block';
                showMemoryRound();
            }
        }, 1200);
    } else {
        // 答错了
        inputs.forEach(input => input.classList.add('wrong'));

        // 显示正确答案
        let correctDisplay = '';
        memoryState.blankPositions.forEach((pos, i) => {
            correctDisplay += `位置${pos + 1}: ${memoryState.currentNumbers[pos]}  `;
        });
        feedback.textContent = `✗ 正确答案是 ${correctDisplay}`;
        feedback.className = 'feedback wrong';

        // 播放错误音效
        playWrongSound();
        speakWrong();

        // 延迟后显示结果
        setTimeout(showMemoryResult, 2000);
    }
}

// 显示过关奖励画面
function showLevelReward() {
    // 停止计时器
    if (memoryState.timerInterval) {
        clearInterval(memoryState.timerInterval);
    }

    // 隐藏数字键盘
    if (typeof numpad !== 'undefined') numpad.hide();

    // 播放过关音效
    playMemoryLevelSound();
    speakReward(100);

    // 更新奖励信息
    document.getElementById('reward-level').textContent = memoryState.level;
    document.getElementById('reward-score').textContent = memoryState.score;
    document.getElementById('reward-correct').textContent = ROUNDS_PER_LEVEL;

    // 计算下一关的显示时间
    var nextConfig = levelConfig[Math.min(memoryState.level, levelConfig.length - 1)];
    document.getElementById('reward-next-time').textContent = nextConfig.displayTime;

    // 切换显示
    document.getElementById('memory-show').style.display = 'none';
    document.getElementById('memory-input').style.display = 'none';
    document.getElementById('memory-reward').style.display = 'block';
}

// 进入下一关
function goToNextLevel() {
    memoryState.level++;
    memoryState.roundInLevel = 1;

    // 切换显示
    document.getElementById('memory-reward').style.display = 'none';
    document.getElementById('memory-show').style.display = 'block';

    showMemoryRound();
}

// 显示游戏结果
function showMemoryResult() {
    // 停止计时器
    if (memoryState.timerInterval) {
        clearInterval(memoryState.timerInterval);
    }

    // 隐藏数字键盘
    if (typeof numpad !== 'undefined') numpad.hide();

    // 保存记录
    saveMemoryGameRecord(memoryState.score, memoryState.level, memoryState.totalCorrect);

    // 更新显示
    document.getElementById('memory-final-score').textContent = memoryState.score;
    document.getElementById('memory-final-level').textContent = memoryState.level;
    document.getElementById('memory-final-questions').textContent = memoryState.totalCorrect;

    // 切换显示
    document.getElementById('memory-show').style.display = 'none';
    document.getElementById('memory-input').style.display = 'none';
    document.getElementById('memory-result').style.display = 'block';
}
