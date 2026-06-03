// 音效模块 - 使用 Web Audio API 生成适合儿童的音效

let soundEnabled = localStorage.getItem('soundEnabled') !== 'off';

function updateSoundIcon() {
    var iconOn = document.getElementById('sound-icon-on');
    var iconOff = document.getElementById('sound-icon-off');
    if (iconOn && iconOff) {
        iconOn.style.display = soundEnabled ? '' : 'none';
        iconOff.style.display = soundEnabled ? 'none' : '';
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled ? 'on' : 'off');
    updateSoundIcon();
    if (soundEnabled) playClickSound();
}

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// 播放一个音符
function playTone(frequency, duration, type, volume, delay) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    const startTime = ctx.currentTime + (delay || 0);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume || 0.3, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
}

// 按钮点击音效 - 轻快的"嘀"声
function playClickSound() {
    playTone(800, 0.08, 'sine', 0.15);
}

// 输入数字音效 - 短促的敲击声
function playTypeSound() {
    playTone(600, 0.05, 'sine', 0.1);
}

// 回答正确音效 - 欢快的上升音阶
function playCorrectSound() {
    playTone(523, 0.12, 'sine', 0.25, 0);      // C5
    playTone(659, 0.12, 'sine', 0.25, 0.1);     // E5
    playTone(784, 0.2, 'sine', 0.3, 0.2);       // G5
}

// 回答错误音效 - 友好的下降音
function playWrongSound() {
    playTone(400, 0.15, 'triangle', 0.2, 0);
    playTone(300, 0.25, 'triangle', 0.2, 0.12);
}

// 过关/升级音效 - 欢庆的旋律
function playLevelUpSound() {
    playTone(523, 0.1, 'sine', 0.25, 0);        // C5
    playTone(587, 0.1, 'sine', 0.25, 0.08);     // D5
    playTone(659, 0.1, 'sine', 0.25, 0.16);     // E5
    playTone(784, 0.15, 'sine', 0.3, 0.24);     // G5
    playTone(1047, 0.3, 'sine', 0.35, 0.35);    // C6
}

// 记忆游戏过关音效 - 闪亮的上升音
function playMemoryLevelSound() {
    playTone(659, 0.08, 'sine', 0.2, 0);        // E5
    playTone(784, 0.08, 'sine', 0.2, 0.07);     // G5
    playTone(1047, 0.08, 'sine', 0.25, 0.14);   // C6
    playTone(1319, 0.25, 'sine', 0.3, 0.22);    // E6
}

// 开始游戏音效
function playStartSound() {
    playTone(392, 0.1, 'sine', 0.2, 0);         // G4
    playTone(523, 0.1, 'sine', 0.2, 0.08);      // C5
    playTone(659, 0.15, 'sine', 0.25, 0.16);    // E5
}

// 为所有按钮添加点击音效（事件委托）
document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (btn) {
        playClickSound();
    }
});

// 为所有输入框添加输入音效（事件委托）
document.addEventListener('input', function(e) {
    if (e.target.matches('.answer-box, .memory-box') && e.target.value.length === 1) {
        playTypeSound();
    }
});

// ============ 语音鼓励 ============
var voiceStyles = {
    'female-teacher': { rate: 0.95, pitch: 1.3 },
    'female-student': { rate: 1.0,  pitch: 1.6 },
    // 小米冰糖 - 预录音频
    'xiaomi-bingtang': { rate: 1.0, pitch: 1.0 },
    // 小米苏打 - 预录音频
    'xiaomi-suda': { rate: 1.0, pitch: 1.0 },
    // 小米茉莉 - 预录音频
    'xiaomi-moli': { rate: 1.0, pitch: 1.0 },
    // 小米白桦 - 预录音频
    'xiaomi-baihua': { rate: 1.0, pitch: 1.0 },
    // DashScope Cherry - 预录音频
    'cherry': { rate: 1.0, pitch: 1.0 }
};
var currentVoiceStyle = localStorage.getItem('voiceStyle') || 'cherry';

// 预录音频角色配置（通用）
var voiceAudioProfiles = {
    'xiaomi-bingtang': {
        base: 'assets/audio/xiaomi-bingtang/',
        correct: ['correct_01.wav','correct_02.wav','correct_03.wav','correct_04.wav','correct_05.wav','correct_06.wav','correct_07.wav','correct_08.wav'],
        wrong:   ['wrong_01.wav','wrong_02.wav','wrong_03.wav','wrong_04.wav','wrong_05.wav','wrong_06.wav'],
        reward: {
            high:    ['reward_high_01.wav','reward_high_02.wav','reward_high_03.wav'],
            mid:     ['reward_mid_01.wav','reward_mid_02.wav','reward_mid_03.wav'],
            low:     ['reward_low_01.wav','reward_low_02.wav','reward_low_03.wav'],
            veryLow: ['reward_verylow_01.wav','reward_verylow_02.wav','reward_verylow_03.wav']
        }
    },
    'xiaomi-suda': {
        base: 'assets/audio/xiaomi-suda/',
        correct: ['correct_01.wav','correct_02.wav','correct_03.wav','correct_04.wav','correct_05.wav','correct_06.wav','correct_07.wav','correct_08.wav'],
        wrong:   ['wrong_01.wav','wrong_02.wav','wrong_03.wav','wrong_04.wav','wrong_05.wav','wrong_06.wav'],
        reward: {
            high:    ['reward_high_01.wav','reward_high_02.wav','reward_high_03.wav'],
            mid:     ['reward_mid_01.wav','reward_mid_02.wav','reward_mid_03.wav'],
            low:     ['reward_low_01.wav','reward_low_02.wav','reward_low_03.wav'],
            veryLow: ['reward_verylow_01.wav','reward_verylow_02.wav','reward_verylow_03.wav']
        }
    },
    'xiaomi-moli': {
        base: 'assets/audio/xiaomi-moli/',
        correct: ['correct_01.wav','correct_02.wav','correct_03.wav','correct_04.wav','correct_05.wav','correct_06.wav','correct_07.wav','correct_08.wav'],
        wrong:   ['wrong_01.wav','wrong_02.wav','wrong_03.wav','wrong_04.wav','wrong_05.wav','wrong_06.wav'],
        reward: {
            high:    ['reward_high_01.wav','reward_high_02.wav','reward_high_03.wav'],
            mid:     ['reward_mid_01.wav','reward_mid_02.wav','reward_mid_03.wav'],
            low:     ['reward_low_01.wav','reward_low_02.wav','reward_low_03.wav'],
            veryLow: ['reward_verylow_01.wav','reward_verylow_02.wav','reward_verylow_03.wav']
        }
    },
    'xiaomi-baihua': {
        base: 'assets/audio/xiaomi-baihua/',
        correct: ['correct_01.wav','correct_02.wav','correct_03.wav','correct_04.wav','correct_05.wav','correct_06.wav','correct_07.wav','correct_08.wav'],
        wrong:   ['wrong_01.wav','wrong_02.wav','wrong_03.wav','wrong_04.wav','wrong_05.wav','wrong_06.wav'],
        reward: {
            high:    ['reward_high_01.wav','reward_high_02.wav','reward_high_03.wav'],
            mid:     ['reward_mid_01.wav','reward_mid_02.wav','reward_mid_03.wav'],
            low:     ['reward_low_01.wav','reward_low_02.wav','reward_low_03.wav'],
            veryLow: ['reward_verylow_01.wav','reward_verylow_02.wav','reward_verylow_03.wav']
        }
    },
    'cherry': {
        base: 'assets/audiox/cherry/',
        correct: ['correct_01.wav','correct_02.wav','correct_03.wav','correct_04.wav','correct_05.wav','correct_06.wav','correct_07.wav','correct_08.wav'],
        wrong:   ['wrong_01.wav','wrong_02.wav','wrong_03.wav','wrong_04.wav','wrong_05.wav','wrong_06.wav'],
        reward: {
            high:    ['reward_high_01.wav','reward_high_02.wav','reward_high_03.wav'],
            mid:     ['reward_mid_01.wav','reward_mid_02.wav','reward_mid_03.wav'],
            low:     ['reward_low_01.wav','reward_low_02.wav','reward_low_03.wav'],
            veryLow: ['reward_verylow_01.wav','reward_verylow_02.wav','reward_verylow_03.wav']
        }
    }
};

// 通用预录音频播放
function playVoiceAudio(style, filename) {
    if (!soundEnabled) return;
    var profile = voiceAudioProfiles[style];
    if (!profile) return;
    var audio = new Audio(profile.base + filename);
    audio.play().catch(function() {});
}

function setVoiceStyle(style) {
    currentVoiceStyle = style;
    localStorage.setItem('voiceStyle', style);
    if (voiceAudioProfiles[style]) {
        playVoiceAudio(style, 'system_hello.wav');
    } else if (style !== 'off') {
        speak('我是你的学习小助手');
    }
}

var correctPhrases = [
    '答对啦', '好厉害呀', '你太棒啦', '真聪明呀',
    '太了不起啦', '做得真好呀', '好棒好棒', '对啦对啦'
];
var wrongPhrases = [
    '没关系哦', '再试试吧', '加油呀', '别着急',
    '差一点点啦', '没关系我们再来'
];
var rewardPhrases = {
    high: ['太厉害啦，你是小小数学家', '好棒呀，全部答对啦', '你就是小天才呀'],
    mid: ['做得很好哦，继续加油', '很厉害了呢，再练练会更棒', '你进步好大呀'],
    low: ['没关系，我们再来一次', '慢慢来你会越来越棒', '加油下次一定行'],
    veryLow: ['别灰心哦多练练就好啦', '我们一起加油好不好', '慢慢来不着急']
};

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

var _voicesCache = null;
function getVoicesCached() {
    if (!_voicesCache) _voicesCache = window.speechSynthesis.getVoices();
    if (!_voicesCache.length) { _voicesCache = null; return []; }
    return _voicesCache;
}
if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = function() { _voicesCache = null; };
}

var femaleVoiceRe = /xiaoxiao|yaoyao|huihui|lili|tian|female|女|hanhan/i;

function findVoice() {
    var zhVoices = getVoicesCached().filter(function(v) { return v.lang.startsWith('zh'); });
    if (!zhVoices.length) return null;
    return zhVoices.find(function(v) { return femaleVoiceRe.test(v.name); })
        || zhVoices[0];
}

function speak(text) {
    if (!soundEnabled || !window.speechSynthesis || currentVoiceStyle === 'off') return;
    if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    var style = voiceStyles[currentVoiceStyle] || voiceStyles['female-student'];
    var utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'zh-CN';
    utter.rate = style.rate;
    utter.pitch = style.pitch;
    var voice = findVoice();
    if (voice) utter.voice = voice;
    window.speechSynthesis.speak(utter);
}

function speakCorrect() {
    var profile = voiceAudioProfiles[currentVoiceStyle];
    if (profile) { playVoiceAudio(currentVoiceStyle, pickRandom(profile.correct)); return; }
    speak(pickRandom(correctPhrases));
}
function speakWrong() {
    var profile = voiceAudioProfiles[currentVoiceStyle];
    if (profile) { playVoiceAudio(currentVoiceStyle, pickRandom(profile.wrong)); return; }
    speak(pickRandom(wrongPhrases));
}
function speakReward(accuracy) {
    var tier;
    if (accuracy >= 90) tier = 'high';
    else if (accuracy >= 70) tier = 'mid';
    else if (accuracy >= 50) tier = 'low';
    else tier = 'veryLow';
    var profile = voiceAudioProfiles[currentVoiceStyle];
    if (profile) { playVoiceAudio(currentVoiceStyle, pickRandom(profile.reward[tier])); return; }
    speak(pickRandom(rewardPhrases[tier]));
}

// 根据正确率设置奖励星星（0-3颗，以0.5为单位）
function setRewardStars(containerId, accuracy) {
    var stars;
    if (accuracy >= 95) stars = 3;
    else if (accuracy >= 85) stars = 2.5;
    else if (accuracy >= 70) stars = 2;
    else if (accuracy >= 50) stars = 1.5;
    else if (accuracy >= 30) stars = 1;
    else if (accuracy >= 10) stars = 0.5;
    else stars = 0;

    var fullStars = Math.floor(stars);
    var hasHalf = (stars % 1) !== 0;
    var emptyStars = 3 - fullStars - (hasHalf ? 1 : 0);

    var html = '';
    for (var i = 0; i < fullStars; i++) {
        html += '<span class="reward-star">&#11088;</span>';
    }
    if (hasHalf) {
        html += '<span class="reward-star half">&#11088;</span>';
    }
    for (var j = 0; j < emptyStars; j++) {
        html += '<span class="reward-star empty">&#11088;</span>';
    }

    document.getElementById(containerId).innerHTML = html;
}
