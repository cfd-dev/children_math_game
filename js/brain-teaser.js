// 脑筋急转弯游戏模块
var btState = {
    totalQuestions: 20,
    currentQuestion: 0,
    viewedCount: 0,
    startTime: null,
    timerInterval: null,
    currentRiddle: null,
    usedIndices: [],
    isRevealed: false
};

// 按年级的题目配置
var btGradeConfig = {
    'k-small':  { description: '简单趣味谜语' },
    'k-medium': { description: '生活常识谜语' },
    'k-large':  { description: '趣味常识问答' },
    'grade-1':  { description: '趣味谜语' },
    'grade-2':  { description: '思维小谜语' },
    'grade-3':  { description: '谐音双关谜语' },
    'grade-4':  { description: '逻辑推理谜语' },
    'grade-5':  { description: '抽象思维谜语' },
    'grade-6':  { description: '高难度趣味谜语' }
};

// 题库：按年级分组
var btRiddles = {
    'k-small': [
        { q: '什么有耳朵听不见？', a: '玉米' },
        { q: '什么有嘴不会说话？', a: '茶壶' },
        { q: '什么有脸没有嘴？', a: '钟表' },
        { q: '什么越洗越脏？', a: '水' },
        { q: '什么房子没人住？', a: '蜂巢' },
        { q: '什么鸡不会下蛋？', a: '田鸡（青蛙）' },
        { q: '什么花不能摘？', a: '火花' },
        { q: '什么船最安全？', a: '停在岸上的船' },
        { q: '什么蛋不能吃？', a: '笨蛋' },
        { q: '什么光没有亮？', a: '时光' },
        { q: '什么帽不能戴？', a: '螺帽' },
        { q: '什么桥不能走？', a: '鼻梁' },
        { q: '什么锁打不开？', a: '密码锁（不知道密码时）' },
        { q: '什么碗打不破？', a: '铁饭碗' },
        { q: '什么糖不甜？', a: '血糖' },
        { q: '什么路不能走？', a: '电路' },
        { q: '什么书买不到？', a: '遗书' },
        { q: '什么水取之不尽？', a: '口水' },
        { q: '什么头不能摸？', a: '石头' },
        { q: '什么瓜不能吃？', a: '傻瓜' },
        { q: '什么鞋不能穿？', a: '轮胎' },
        { q: '什么笔不能写字？', a: '电笔' }
    ],
    'k-medium': [
        { q: '什么东西天气越热它爬得越高？', a: '温度计' },
        { q: '什么路最窄？', a: '冤家路窄' },
        { q: '什么东西越擦越小？', a: '橡皮擦' },
        { q: '什么东西越热越爱出来？', a: '汗水' },
        { q: '什么东西有头没有脚？', a: '砖头' },
        { q: '什么东西有脚却走不了？', a: '桌椅' },
        { q: '什么东西打破了才好？', a: '纪录' },
        { q: '什么东西能吃不能拿？', a: '亏（吃亏）' },
        { q: '什么东西越拉越长？', a: '橡皮筋' },
        { q: '什么东西看不见摸不着？', a: '空气' },
        { q: '什么牛不会耕田？', a: '蜗牛' },
        { q: '什么虎不会咬人？', a: '壁虎' },
        { q: '什么鼠用两条腿走路？', a: '米老鼠' },
        { q: '什么鸭用两条腿走路？', a: '所有的鸭子' },
        { q: '什么鱼不能吃？', a: '木鱼' },
        { q: '什么蛋不能吃？', a: '脸蛋' },
        { q: '什么网不能打鱼？', a: '互联网' },
        { q: '什么灯不会亮？', a: '绿灯（等人的"等"）' },
        { q: '什么表不能戴？', a: '课程表' },
        { q: '什么纸不能写字？', a: '面巾纸' },
        { q: '什么门关不上？', a: '球门' },
        { q: '什么车不能开？', a: '风车' }
    ],
    'k-large': [
        { q: '什么东西越长越短？', a: '蜡烛' },
        { q: '什么东西越热越爱出来？', a: '鼻涕（天冷才流鼻涕的反面）' },
        { q: '什么东西有风不动无风动？', a: '扇子' },
        { q: '什么人不怕太阳晒？', a: '雪人（反语）' },
        { q: '什么船从来不下水？', a: '宇宙飞船' },
        { q: '什么海里没有水？', a: '辞海' },
        { q: '什么池不能有水？', a: '电池' },
        { q: '什么狗不会叫？', a: '热狗' },
        { q: '什么猫不抓老鼠？', a: '熊猫' },
        { q: '什么马不会跑？', a: '木马' },
        { q: '什么羊不会吃草？', a: '替罪羊' },
        { q: '什么龙不会飞？', a: '恐龙' },
        { q: '什么鸡不会叫？', a: '田鸡' },
        { q: '什么猪不会拱地？', a: '野猪（住在森林里）' },
        { q: '什么象最大？', a: '气象（万象更新）' },
        { q: '什么花最小？', a: '火花' },
        { q: '什么树最小？', a: '圣诞树（盆栽）' },
        { q: '什么山最大？', a: '书山（书山有路勤为径）' },
        { q: '什么海最大？', a: '苦海（苦海无边）' },
        { q: '什么天最短？', a: '半天（形容很短的时间）' },
        { q: '什么床不能睡？', a: '河床' },
        { q: '什么刀不能切菜？', a: '手术刀' }
    ],
    'grade-1': [
        { q: '什么动物最爱贴墙上？', a: '海豹（海报）' },
        { q: '什么球身上长毛？', a: '羽毛球' },
        { q: '什么帽不能戴？', a: '笔帽' },
        { q: '什么头最大？', a: '前头（前面最大的部分）' },
        { q: '什么人天天去医院？', a: '医生' },
        { q: '什么人最不怕冷？', a: '雪人' },
        { q: '什么人一年只工作一天？', a: '圣诞老人' },
        { q: '什么照片看不出照的是谁？', a: 'X光片' },
        { q: '什么布剪不断？', a: '瀑布' },
        { q: '什么水不能喝？', a: '薪水' },
        { q: '什么桥下没有水？', a: '立交桥' },
        { q: '什么花开了看不见？', a: '浪花' },
        { q: '什么果不能吃？', a: '结果（后果）' },
        { q: '什么书书店买不到？', a: '秘书' },
        { q: '什么票不能坐车？', a: '选票' },
        { q: '什么表不能戴在手上？', a: '课程表' },
        { q: '什么笔不能写字？', a: '试电笔' },
        { q: '什么碗打不烂？', a: '铁饭碗' },
        { q: '什么门打不开？', a: '窍门' },
        { q: '什么锁没有孔？', a: '拉锁' },
        { q: '什么鞋不能穿？', a: '刹车' },
        { q: '什么眼不会眨？', a: '针眼' }
    ],
    'grade-2': [
        { q: '两个人掉进陷阱，死的人叫死人，活的人叫什么？', a: '救命！' },
        { q: '什么东西越生气越大？', a: '脾气' },
        { q: '什么东西有风不动无风动？', a: '扇子' },
        { q: '什么东西不怕布，只怕石头？', a: '剪刀' },
        { q: '什么东西你能用左手拿，不能用右手拿？', a: '右手肘' },
        { q: '什么水永远用不完？', a: '泪水' },
        { q: '什么人每天靠运气赚钱？', a: '煤气工人（运气=运送气体）' },
        { q: '什么比赛输了比赢了更高兴？', a: '减肥比赛' },
        { q: '什么蛋最有营养？', a: '脸蛋（夸人的话）' },
        { q: '什么老鼠两条腿走路？', a: '米老鼠' },
        { q: '什么鸭子两条腿走路？', a: '所有的鸭子都是两条腿' },
        { q: '什么鸡两条腿走路？', a: '所有的鸡都是两条腿' },
        { q: '什么椅子不能坐？', a: '电椅' },
        { q: '什么笔没有墨水？', a: '电笔' },
        { q: '什么船最轻？', a: '帆船（帆=翻）' },
        { q: '什么火没有烟？', a: '怒火' },
        { q: '什么山没有石头？', a: '冰山' },
        { q: '什么树没有叶子？', a: '圣诞树（假的）' },
        { q: '什么纸不能折？', a: '砂纸' },
        { q: '什么线不能缝衣服？', a: '电线' },
        { q: '什么锅不能做饭？', a: '黑锅（背黑锅）' },
        { q: '什么票不能买？', a: '绑票' }
    ],
    'grade-3': [
        { q: '什么动物最没有方向感？', a: '麋鹿（迷路）' },
        { q: '什么动物最懒？', a: '猪（懒猪）' },
        { q: '什么动物最容易摔倒？', a: '狐狸（狐狸=糊里糊涂）' },
        { q: '什么鸡没有翅膀？', a: '田鸡' },
        { q: '什么猪没有嘴？', a: '豪猪（好猪=豪猪的谐音）' },
        { q: '什么狗不会咬人？', a: '热狗' },
        { q: '什么猫不抓老鼠？', a: '熊猫' },
        { q: '什么牛最大？', a: '吹牛（吹牛皮）' },
        { q: '什么蛇最长？', a: '人心不足蛇吞象' },
        { q: '什么马最难骑？', a: '驸马' },
        { q: '什么鱼最重？', a: '鲸鱼' },
        { q: '什么鸟不会飞？', a: '鸵鸟' },
        { q: '什么人最不诚实？', a: '骗子' },
        { q: '什么人不怕太阳？', a: '影子（人）' },
        { q: '什么房子最便宜？', a: '茅草屋' },
        { q: '什么书最厚？', a: '百科全书' },
        { q: '什么路最长？', a: '人生路' },
        { q: '什么海没有水？', a: '辞海' },
        { q: '什么天最热？', a: '三伏天' },
        { q: '什么天最冷？', a: '三九天' },
        { q: '什么雨不能淋？', a: '泪雨' },
        { q: '什么风最大？', a: '台风' }
    ],
    'grade-4': [
        { q: '什么东西有5个头但不觉得奇怪？', a: '手（5根手指）' },
        { q: '什么东西有牙齿却不能吃东西？', a: '梳子' },
        { q: '什么东西有城市却没有房子？', a: '地图' },
        { q: '什么东西有河流却没有水？', a: '地图' },
        { q: '什么东西有眼睛却看不见？', a: '针' },
        { q: '什么东西有翅膀却不会飞？', a: '鸡' },
        { q: '什么东西有尾巴却不会摇？', a: '彗星' },
        { q: '什么东西有脖子却没有头？', a: '瓶子' },
        { q: '什么东西有脚却不会走路？', a: '桌子' },
        { q: '什么东西有口却不会说话？', a: '河（河口）' },
        { q: '什么东西有耳却不会听？', a: '木耳' },
        { q: '什么东西有心却没有肺？', a: '铅笔芯' },
        { q: '什么人一年到头只工作一天？', a: '圣诞老人' },
        { q: '什么东西早上四条腿，中午两条腿，晚上三条腿？', a: '人（斯芬克斯之谜）' },
        { q: '什么东西你越是追赶它，它跑得越快？', a: '时间' },
        { q: '什么东西越是分享就越多？', a: '快乐' },
        { q: '什么东西越是洗就越脏？', a: '水' },
        { q: '什么东西越是关就越开？', a: '心扉' },
        { q: '什么东西越是拉就越短？', a: '橡皮筋' },
        { q: '什么东西越是吹就越大？', a: '气球' },
        { q: '什么东西越是烧就越少？', a: '蜡烛' },
        { q: '什么东西越是挖就越深？', a: '坑' }
    ],
    'grade-5': [
        { q: '有一个字，所有人见了都会念错，这是什么字？', a: '"错"字' },
        { q: '什么东西越热越爱出来？', a: '汗' },
        { q: '什么东西你不借别人也没人借你？', a: '眼睫毛' },
        { q: '什么东西做的人知道，买的人知道，用的人不知道？', a: '棺材' },
        { q: '什么东西你越生气它就越大？', a: '脾气' },
        { q: '什么东西越洗越脏，不洗有人吃，洗了没人吃？', a: '水' },
        { q: '有一个字大家都会念错，它是什么？', a: '错' },
        { q: '小明的妈妈有三个儿子，老大叫大毛，老二叫二毛，老三叫什么？', a: '小明' },
        { q: '什么东西打碎了人人都叫好？', a: '世界纪录' },
        { q: '什么东西打碎了却没人说好？', a: '花瓶' },
        { q: '什么东西打破了才好？', a: '纪录' },
        { q: '什么东西你有，别人也有，虽然是身外之物却不能交换？', a: '名字' },
        { q: '什么东西只能加不能减？', a: '年龄' },
        { q: '什么东西天越热它爬得越高？', a: '温度计的水银柱' },
        { q: '什么东西有头无脚？', a: '砖' },
        { q: '什么东西有尾无头？', a: '流星' },
        { q: '什么东西有身无腿？', a: '衣服' },
        { q: '什么东西有眼无眉？', a: '针' },
        { q: '什么东西有翅无毛？', a: '飞机' },
        { q: '什么东西有嘴无舌？', a: '茶壶' },
        { q: '什么东西有口无心？', a: '刀（刀口）' },
        { q: '什么东西有面无口？', a: '鼓' }
    ],
    'grade-6': [
        { q: '什么水取之不尽用之不竭？', a: '口水' },
        { q: '什么光没有亮度？', a: '时光' },
        { q: '什么人每天靠运气赚钱？', a: '送煤气的工人' },
        { q: '什么比赛是往后跑的？', a: '拔河' },
        { q: '什么虎不会吃人？', a: '壁虎' },
        { q: '什么官不发工资却有人愿意当？', a: '新郎官' },
        { q: '什么人是不用电的？', a: '缅甸人（免电人）' },
        { q: '什么书中毛病最多？', a: '医书' },
        { q: '什么瓜不能吃？', a: '傻瓜' },
        { q: '什么球不能踢？', a: '地球' },
        { q: '什么锁没有孔？', a: '拉锁' },
        { q: '什么灯不会亮？', a: '绿灯（谜面的双关）' },
        { q: '什么帽不能戴？', a: '螺丝帽' },
        { q: '什么鞋不能穿？', a: '刹车（制动鞋）' },
        { q: '什么锅不能做饭？', a: '黑锅' },
        { q: '什么票不能坐车？', a: '选票' },
        { q: '什么路最窄？', a: '冤家路窄' },
        { q: '什么桥不能走？', a: '鼻梁' },
        { q: '什么床不能睡？', a: '河床' },
        { q: '什么床最硬？', a: '冰床' },
        { q: '什么枪把人打跑却不伤人？', a: '发令枪' },
        { q: '什么炮弹能发射却不会爆炸？', a: '糖衣炮弹' }
    ]
};

// 获取当前配置
function getBTConfig() {
    return btGradeConfig[currentGrade] || btGradeConfig['grade-1'];
}

// 获取当前年级题库
function getBTRiddles() {
    return btRiddles[currentGrade] || btRiddles['grade-1'];
}

// 开始游戏
function startBTGame() {
    btState.totalQuestions = parseInt(document.getElementById('bt-question-count').value);
    btState.currentQuestion = 0;
    btState.viewedCount = 0;
    btState.usedIndices = [];
    btState.startTime = Date.now();
    btState.isRevealed = false;

    document.getElementById('brainteaser-setup').style.display = 'none';
    document.getElementById('brainteaser-result').style.display = 'none';
    document.getElementById('brainteaser-quiz').style.display = 'block';

    if (btState.timerInterval) clearInterval(btState.timerInterval);
    btState.timerInterval = setInterval(updateBTTimer, 1000);

    playStartSound();
    showNextBTRiddle();
}

// 显示下一题
function showNextBTRiddle() {
    btState.currentQuestion++;
    if (btState.currentQuestion > btState.totalQuestions) {
        finishBTGame();
        return;
    }

    var riddles = getBTRiddles();

    // 随机抽取未出过的题目
    var available = [];
    for (var i = 0; i < riddles.length; i++) {
        if (btState.usedIndices.indexOf(i) < 0) {
            available.push(i);
        }
    }

    // 如果题库用完了，重置
    if (available.length === 0) {
        btState.usedIndices = [];
        for (var i = 0; i < riddles.length; i++) {
            available.push(i);
        }
    }

    var randIdx = available[Math.floor(Math.random() * available.length)];
    btState.usedIndices.push(randIdx);
    btState.currentRiddle = riddles[randIdx];
    btState.isRevealed = false;

    // 更新显示
    document.getElementById('bt-question-num').textContent =
        '第 ' + btState.currentQuestion + ' / ' + btState.totalQuestions + ' 题';
    document.getElementById('bt-riddle-text').textContent = btState.currentRiddle.q;
    document.getElementById('bt-answer-text').textContent = '';
    document.getElementById('bt-answer-box').style.display = 'none';
    document.getElementById('bt-reveal-btn').style.display = 'block';
    document.getElementById('bt-reveal-btn').textContent = '看答案';
    document.getElementById('bt-next-btn').style.display = 'none';
    document.getElementById('bt-feedback').textContent = '';
    document.getElementById('bt-feedback').className = 'feedback';
}

// 揭示答案
function revealBTAnswer() {
    if (btState.isRevealed) return;
    btState.isRevealed = true;
    btState.viewedCount++;

    playClickSound();

    document.getElementById('bt-answer-text').textContent = btState.currentRiddle.a;

    // 隐藏"看答案"，显示答案框和"下一题"
    document.getElementById('bt-reveal-btn').style.display = 'none';

    var answerBox = document.getElementById('bt-answer-box');
    answerBox.classList.add('bt-reveal-animate');
    answerBox.style.display = 'block';

    document.getElementById('bt-next-btn').style.display = 'block';

    setTimeout(function() {
        answerBox.classList.remove('bt-reveal-animate');
    }, 500);
}

// 更新计时器
function updateBTTimer() {
    var elapsed = Math.floor((Date.now() - btState.startTime) / 1000);
    document.getElementById('bt-timer').textContent = '用时：' + elapsed + '秒';
}

// 完成游戏
function finishBTGame() {
    if (btState.timerInterval) clearInterval(btState.timerInterval);

    var totalTime = Math.floor((Date.now() - btState.startTime) / 1000);
    var completionRate = Math.round((btState.viewedCount / btState.totalQuestions) * 100);

    document.getElementById('bt-result-viewed').textContent = btState.viewedCount;
    document.getElementById('bt-result-total').textContent = btState.totalQuestions;
    document.getElementById('bt-result-rate').textContent = completionRate + '%';
    document.getElementById('bt-result-time').textContent = totalTime + '秒';

    saveBTRecord(completionRate, totalTime, btState.totalQuestions, btState.viewedCount);

    document.getElementById('brainteaser-quiz').style.display = 'none';
    document.getElementById('brainteaser-result').style.display = 'block';
}
