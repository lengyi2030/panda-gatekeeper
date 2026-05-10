# 熊猫监督员 / Panda Gatekeeper

[中文](#中文) | [English](#english) | [日本語](#日本語)

---

## 中文

一款浏览器扩展，帮你在社交媒体上控制使用时间。当你在指定网站上沉迷太久，一只可爱的熊猫会霸占你的整个屏幕，强制你休息。

> 基于 [Cat Gatekeeper](https://github.com/zokuzoku/cat-gatekeeper) 二次开发，特别感谢原作者 [@zokuzoku](https://github.com/zokuzoku)。

### 主要功能

- **自定义计时器** — 设置使用时长（1–480分钟）和休息时长（1–60分钟）
- **熊猫视频** — 休息期间播放可爱的熊猫动画
- **语音提醒** — 熊猫会温柔地提醒你该休息了
- **独立站点追踪** — 每个网站的浏览时间独立计算
- **一键测试** — 随时预览熊猫休息画面
- **独立测试页** — 直接在浏览器中打开 `test.html` 即可体验

### 安装方法

1. 克隆本仓库：
   ```bash
   git clone https://github.com/lengyi2030/panda-gatekeeper.git
   ```

2. 打开浏览器的扩展管理页面：
   - **Chrome/Edge**: 访问 `chrome://extensions` 或 `edge://extensions`
   - **Firefox**: 访问 `about:debugging#/runtime/this-firefox`

3. 开启**开发者模式**（Chrome/Edge）

4. 点击**加载已解压的扩展程序**，选择 `panda-gatekeeper` 文件夹

### 使用说明

1. 点击浏览器工具栏中的熊猫图标，打开设置面板
2. 配置使用时长、休息时长和需要监督的网站
3. 点击**保存设置**
4. 点击**测试熊猫**立即预览效果

### 语音合成

扩展内置了预生成的中文语音文件，优先播放该文件。若文件不可用，则自动回退到浏览器内置的 Web Speech API。

重新生成语音：
```bash
pip install edge-tts
python generate_audio.py
```

### 致谢

- 原始项目：[Cat Gatekeeper](https://github.com/zokuzoku/cat-gatekeeper) by [@zokuzoku](https://github.com/zokuzoku)

---

## English

A browser extension that helps you control your screen time on social media. When you've been doom-scrolling for too long on selected websites, a cute panda hijacks your entire screen for a mandatory rest period.

> Forked from [Cat Gatekeeper](https://github.com/zokuzoku/cat-gatekeeper). Special thanks to the original author [@zokuzoku](https://github.com/zokuzoku).

### Features

- **Customizable Timer** — Set browsing duration (1–480 min) and break duration (1–60 min)
- **Panda Animation** — Cute panda video plays during the break
- **Voice Reminder** — The panda gently reminds you to take a break
- **Per-Site Tracking** — Independent time tracking for each website
- **Instant Test** — Preview the panda break screen anytime
- **Standalone Test Page** — Open `test.html` directly in your browser to try it out

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/lengyi2030/panda-gatekeeper.git
   ```

2. Open your browser's extension management page:
   - **Chrome/Edge**: Navigate to `chrome://extensions` or `edge://extensions`
   - **Firefox**: Navigate to `about:debugging#/runtime/this-firefox`

3. Enable **Developer mode** (Chrome/Edge)

4. Click **Load unpacked** and select the `panda-gatekeeper` folder

### Usage

1. Click the panda icon in your browser toolbar to open the settings panel
2. Configure browsing duration, break duration, and target websites
3. Click **Save**
4. Click **Test Panda** to preview immediately

### TTS Audio

The extension includes a pre-generated Chinese voice clip. It plays this audio file first, then falls back to the browser's built-in Web Speech API if unavailable.

Regenerate audio:
```bash
pip install edge-tts
python generate_audio.py
```

### Acknowledgements

- Original project: [Cat Gatekeeper](https://github.com/zokuzoku/cat-gatekeeper) by [@zokuzoku](https://github.com/zokuzoku)

---

## 日本語

SNSの利用時間をコントロールするブラウザ拡張機能です。指定したサイトで長時間スクロールしていると、可愛いパンダが画面全体を占領し、強制的に休憩させます。

> [Cat Gatekeeper](https://github.com/zokuzoku/cat-gatekeeper)をベースに二次開発しました。原作者の[@zokuzoku](https://github.com/zokuzoku)さんに特別な感謝を申し上げます。

### 主な機能

- **カスタムタイマー** — 閲覧時間（1～480分）と休憩時間（1～60分）を設定
- **パンダアニメーション** — 休憩中にかわいいパンダの動画が再生されます
- **音声リマインダー** — パンダが優しく休憩を促します
- **サイト別トラッキング** — 各サイトの利用時間を独立して追跡
- **即時テスト** — いつでもパンダの休憩画面をプレビュー可能
- **スタンドアロンテストページ** — `test.html`をブラウザで直接開いて体験できます

### インストール

1. リポジトリをクローン：
   ```bash
   git clone https://github.com/lengyi2030/panda-gatekeeper.git
   ```

2. ブラウザの拡張機能管理ページを開く：
   - **Chrome/Edge**: `chrome://extensions` または `edge://extensions` にアクセス
   - **Firefox**: `about:debugging#/runtime/this-firefox` にアクセス

3. **デベロッパーモード**を有効にする（Chrome/Edge）

4. **パッケージ化されていない拡張機能を読み込む**をクリックし、`panda-gatekeeper`フォルダを選択

### 使い方

1. ブラウザツールバーのパンダアイコンをクリックして設定パネルを開く
2. 閲覧時間、休憩時間、対象サイトを設定
3. **保存**をクリック
4. **テスト**をクリックしてすぐにプレビュー

### 音声合成

拡張機能には事前生成された中国語音声ファイルが含まれています。このファイルを優先的に再生し、利用できない場合はブラウザ内蔵のWeb Speech APIにフォールバックします。

音声の再生成：
```bash
pip install edge-tts
python generate_audio.py
```

### 謝辞

- オリジナルプロジェクト：[@zokuzoku](https://github.com/zokuzoku)による[Cat Gatekeeper](https://github.com/zokuzoku/cat-gatekeeper)
