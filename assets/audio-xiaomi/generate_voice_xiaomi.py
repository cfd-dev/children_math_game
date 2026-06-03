"""
调用 MiMo-V2.5-TTS 批量生成数学学习 App 语音资源。

使用方法:
  1. 设置环境变量: set MIMO_API_KEY=your_api_key
  2. 运行: python generate_voice.py
  3. 音频文件将输出到 assets/audio-xiaomi/ 目录
"""

import base64
import os
import sys
import time

# Windows 控制台 UTF-8 输出
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

try:
    from openai import OpenAI
except ImportError:
    print("请先安装 openai 库: pip install openai")
    sys.exit(1)

# ── 配置 ──────────────────────────────────────────────────────────────────────

API_BASE_URL = "https://token-plan-cn.xiaomimimo.com/v1"
MODEL = "mimo-v2.5-tts"

# 小米冰糖（女声，语速偏快）
# VOICE = "冰糖"
# OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "xiaomi-bingtang")
# STYLE_BASE = "语速偏快，吐字清晰，声音甜美亲切，像小朋友的大姐姐。"

# 小米苏打（男声，语速较快）
# VOICE = "苏打"
# OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "xiaomi-suda")
# STYLE_BASE = "语速较快，吐字清晰，声音阳光亲切，像小朋友的大哥哥。"

# 小米茉莉（女声，语速较快）
# VOICE = "茉莉"
# OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "xiaomi-moli")
# STYLE_BASE = "语速较快，吐字清晰，声音甜美亲切，像小朋友的大姐姐。"

# 小米白桦（男声，语速较快）
VOICE = "白桦"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "xiaomi-baihua")
STYLE_BASE = "语速较快，吐字清晰，声音阳光亲切，像小朋友的大哥哥。"

MAX_RETRIES = 5
RETRY_DELAY = 5  # 秒

# ── 语音风格指令前缀 ──────────────────────────────────────────────────────────
# 通过 user 消息控制语速和情绪基调

# ── 语音清单 ──────────────────────────────────────────────────────────────────
# 每条记录: (文件名, 合成文本, 风格标签)

VOICE_PROMPTS = [
    # 一、答对鼓励（8 条）
    ("correct_01.wav", "答对啦", "开心"),
    ("correct_02.wav", "好厉害呀", "开心"),
    ("correct_03.wav", "你太棒啦", "开心"),
    ("correct_04.wav", "真聪明呀", "开心"),
    ("correct_05.wav", "太了不起啦", "开心"),
    ("correct_06.wav", "做得真好呀", "开心"),
    ("correct_07.wav", "好棒好棒", "开心"),
    ("correct_08.wav", "对啦对啦", "开心"),

    # 二、答错安慰（6 条）
    ("wrong_01.wav", "没关系哦", "温柔 安慰"),
    ("wrong_02.wav", "再试试吧", "温柔 鼓励"),
    ("wrong_03.wav", "加油呀", "温柔 鼓励"),
    ("wrong_04.wav", "别着急", "温柔 安慰"),
    ("wrong_05.wav", "差一点点啦", "温柔 安慰"),
    ("wrong_06.wav", "没关系我们再来", "温柔 鼓励"),

    # 三、结算评语 - 高分档（≥90%）
    ("reward_high_01.wav", "太厉害啦，你是小小数学家", "超级开心 激动"),
    ("reward_high_02.wav", "好棒呀，全部答对啦", "超级开心 激动"),
    ("reward_high_03.wav", "你就是小天才呀", "超级开心 激动"),

    # 四、结算评语 - 中分档（70%-89%）
    ("reward_mid_01.wav", "做得很好哦，继续加油", "肯定 鼓励"),
    ("reward_mid_02.wav", "很厉害了呢，再练练会更棒", "肯定 鼓励"),
    ("reward_mid_03.wav", "你进步好大呀", "肯定 鼓励"),

    # 五、结算评语 - 低分档（50%-69%）
    ("reward_low_01.wav", "没关系，我们再来一次", "温和 包容"),
    ("reward_low_02.wav", "慢慢来你会越来越棒", "温和 包容"),
    ("reward_low_03.wav", "加油下次一定行", "温和 包容"),

    # 六、结算评语 - 极低分档（<50%）
    ("reward_verylow_01.wav", "别灰心哦多练练就好啦", "轻快 积极"),
    ("reward_verylow_02.wav", "我们一起加油好不好", "轻快 积极"),
    ("reward_verylow_03.wav", "慢慢来不着急", "轻快 积极"),

    # 七、系统提示（1 条）
    ("system_hello.wav", "我是你的学习小助手", "自信 可爱"),
]


def create_client() -> OpenAI:
    api_key = os.environ.get("MIMO_API_KEY")
    if not api_key:
        print("错误: 请设置环境变量 MIMO_API_KEY")
        print("  Windows:  set MIMO_API_KEY=your_api_key")
        print("  Linux:    export MIMO_API_KEY=your_api_key")
        sys.exit(1)
    return OpenAI(api_key=api_key, base_url=API_BASE_URL)


def synthesize_one(client: OpenAI, filename: str, text: str, style: str) -> bool:
    """合成单条语音并保存到文件，返回是否成功。"""
    filepath = os.path.join(OUTPUT_DIR, filename)

    messages = [
        {
            "role": "user",
            "content": f"{STYLE_BASE}{style}的语气。",
        },
        {
            "role": "assistant",
            "content": text,
        },
    ]

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            completion = client.chat.completions.create(
                model=MODEL,
                messages=messages,
                audio={"format": "wav", "voice": VOICE},
            )
            audio_bytes = base64.b64decode(completion.choices[0].message.audio.data)
            with open(filepath, "wb") as f:
                f.write(audio_bytes)
            return True
        except Exception as e:
            print(f"  [重试 {attempt}/{MAX_RETRIES}] {e}")
            if attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY * attempt)

    return False


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    client = create_client()

    total = len(VOICE_PROMPTS)
    success = 0
    failed_files: list[str] = []

    print(f"开始生成 {total} 条语音 → {OUTPUT_DIR}\n")

    for i, (filename, text, style) in enumerate(VOICE_PROMPTS, 1):
        print(f"[{i}/{total}] {filename}  「{text}」 ...", end=" ", flush=True)
        if synthesize_one(client, filename, text, style):
            print("✓")
            success += 1
        else:
            print("✗ 失败")
            failed_files.append(filename)

    print(f"\n完成: {success}/{total} 成功")
    if failed_files:
        print(f"失败文件: {', '.join(failed_files)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
