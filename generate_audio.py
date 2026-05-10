"""
Generate TTS audio for Panda Gatekeeper.
Says "主人，你该休息了" in a warm, panda-like voice.

Usage:
    pip install edge-tts
    python generate_audio.py

Output: assets/panda_speech.mp3
"""

import asyncio
import os
import sys

# Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(SCRIPT_DIR, "assets")
OUTPUT_FILE = os.path.join(ASSETS_DIR, "panda_speech_元气少女.mp3")

# The message the panda says
TEXT = "主人，你该休息了"

# Voice: zh-CN-XiaoyiNeural - cute, lively female voice ("元气少女" vibe)
VOICE = "zh-CN-XiaoyiNeural"

# Alternative voices you can try:
# zh-CN-YunxiNeural - warm male voice
# zh-CN-XiaoyiNeural - cute female voice (closer to panda vibe)
# zh-CN-YunjianNeural - deep male voice


async def generate_with_edge_tts():
    try:
        import edge_tts
    except ImportError:
        print("Error: edge-tts not installed. Run: pip install edge-tts")
        sys.exit(1)

    print(f"Generating TTS audio with voice: {VOICE}")
    print(f"Text: {TEXT}")
    print(f"Output: {OUTPUT_FILE}")

    communicate = edge_tts.Communicate(TEXT, VOICE)
    await communicate.save(OUTPUT_FILE)

    size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"Done! Generated {size_kb:.1f} KB audio file.")
    print(f"File: {OUTPUT_FILE}")


async def generate_with_stepaudio():
    """
    Generate TTS using StepAudio-2.5-TTS API.

    Set environment variables:
        STEPAUDIO_API_KEY - Your StepAudio API key
        STEPAUDIO_API_URL - API endpoint (default: https://api.stepfun.com/v1/audio/speech)
    """
    api_key = os.environ.get("STEPAUDIO_API_KEY", "")
    api_url = os.environ.get(
        "STEPAUDIO_API_URL",
        "https://api.stepfun.com/v1/audio/speech"
    )

    if not api_key:
        print("Error: STEPAUDIO_API_KEY not set.")
        print("Set your StepAudio API key as an environment variable:")
        print("  export STEPAUDIO_API_KEY=your-key-here")
        sys.exit(1)

    import requests

    print(f"Calling StepAudio TTS API: {api_url}")
    print(f"Text: {TEXT}")

    payload = {
        "model": "stepaudio-2.5-tts",
        "input": TEXT,
        "voice": "panda",  # Adjust based on available voices
        "response_format": "mp3",
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    response = requests.post(api_url, json=payload, headers=headers, timeout=30)
    response.raise_for_status()

    with open(OUTPUT_FILE, "wb") as f:
        f.write(response.content)

    size_kb = len(response.content) / 1024
    print(f"Done! Generated {size_kb:.1f} KB audio file.")
    print(f"File: {OUTPUT_FILE}")


if __name__ == "__main__":
    os.makedirs(ASSETS_DIR, exist_ok=True)

    # Try stepaudio first if API key is set, otherwise use edge-tts
    if os.environ.get("STEPAUDIO_API_KEY"):
        asyncio.run(generate_with_stepaudio())
    else:
        print("No STEPAUDIO_API_KEY set. Using edge-tts (free Microsoft TTS).")
        print("For StepAudio TTS, set STEPAUDIO_API_KEY and re-run.")
        print()
        asyncio.run(generate_with_edge_tts())
