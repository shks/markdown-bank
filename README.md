# Markdown Bank

An Electron-based desktop application for converting, processing, and storing markdown files with AI-powered features.

[日本語版はこちら](#マークダウンバンク)

## Features

### Core Functionality
- **Dual Mode Interface**: Switch between Markdown Mode and Text Mode
- **Drag & Drop Support**: Easily import files by dragging them into the application
- **Markdown Conversion**: Convert plain text to markdown format
- **Automatic Transcription Detection**: Identifies speech transcription text and offers summarization
- **AI-Powered Title Generation**: Creates descriptive titles based on content
- **Preview**: Real-time markdown preview with syntax highlighting

### AI Integration
- **OpenAI API Integration**: Uses AI for content analysis and conversion
- **Multiple LLM Models**: Choose between GPT-3.5 Turbo, GPT-4o, GPT-4 Turbo, and GPT-4
- **Customizable Summary Prompts**: Edit prompts used for transcription summarization
- **Intelligent Content Analysis**: Detects markdown structure and transcription patterns

### Storage Options
- **Local File Storage**: Save files with automatic naming (YYYYMMDD-Title.md)
- **Notion Database Integration**: Sync markdown content to Notion databases
- **Smart Content Chunking**: Handles Notion's character limits while preserving content structure

## Installation

```bash
# Clone the repository
git clone https://github.com/shks/markdown-bank.git
cd markdown-bank

# Install dependencies
npm install

# Create and configure .env file
```

Create a `.env` file in the root directory with the following content:

```
# OpenAI API Configuration
OPENAI_API_KEY=your_api_key_here

# Default save directory (optional)
DEFAULT_SAVE_DIR=

# Notion Integration (optional)
NOTION_API_KEY=
NOTION_DATABASE_ID=
```

## Usage

```bash
# Start the application
npm start
```

### Application Settings

Configure the following settings in the application:
1. **OpenAI API Key**: Required for AI-powered features
2. **Default Save Path**: Where markdown files will be saved
3. **Transcription Summary Prompt**: Customize how transcriptions are summarized
4. **LLM Model Selection**: Choose which OpenAI model to use
5. **Notion Integration**: Optional API key and database ID for Notion sync

### Workflow

1. **Select Mode**:
   - Markdown Mode: For direct markdown editing
   - Text Mode: For converting plain text to markdown

2. **Input Content**:
   - Drag & drop files
   - Select files using the file browser
   - Type or paste text directly

3. **Process Content**:
   - In Text Mode, click "Convert to Markdown" to transform text
   - Preview the markdown rendering in real-time

4. **Save Content**:
   - Click the "Save" button to store locally
   - If Notion integration is enabled, content will also be saved to Notion

## Development

```bash
# Run in development mode
npm run dev
```

## License

MIT

---

# マークダウンバンク

AIを活用したマークダウンファイルの変換、処理、保存のためのElectronデスクトップアプリケーションです。

## 機能

### 基本機能
- **デュアルモードインターフェース**: マークダウンモードとテキストモードを切り替え
- **ドラッグ＆ドロップ対応**: ファイルをアプリケーションにドラッグするだけで簡単にインポート
- **マークダウン変換**: プレーンテキストをマークダウン形式に変換
- **自動書き起こし検出**: 音声書き起こしテキストを識別し、要約機能を提供
- **AI駆動のタイトル生成**: コンテンツに基づいた説明的なタイトルを作成
- **プレビュー**: シンタックスハイライト付きのリアルタイムマークダウンプレビュー

### AI統合
- **OpenAI API統合**: コンテンツ分析と変換にAIを使用
- **複数のLLMモデル**: GPT-3.5 Turbo、GPT-4o、GPT-4 Turbo、GPT-4から選択可能
- **カスタマイズ可能な要約プロンプト**: 書き起こしの要約に使用するプロンプトを編集可能
- **インテリジェントなコンテンツ分析**: マークダウン構造と書き起こしパターンを検出

### ストレージオプション
- **ローカルファイル保存**: 自動命名（YYYYMMDD-タイトル.md）でファイルを保存
- **Notionデータベース連携**: マークダウンコンテンツをNotionデータベースに同期
- **スマートコンテンツ分割**: Notionの文字数制限に対応しながらコンテンツ構造を保持

## インストール方法

```bash
# リポジトリをクローン
git clone https://github.com/shks/markdown-bank.git
cd markdown-bank

# 依存関係のインストール
npm install

# .envファイルを作成して設定
```

ルートディレクトリに以下の内容で`.env`ファイルを作成します：

```
# OpenAI API設定
OPENAI_API_KEY=あなたのAPIキーをここに入力

# デフォルト保存ディレクトリ（オプション）
DEFAULT_SAVE_DIR=

# Notion連携（オプション）
NOTION_API_KEY=
NOTION_DATABASE_ID=
```

## 使用方法

```bash
# アプリケーションの起動
npm start
```

### アプリケーション設定

アプリケーションで以下の設定を行います：
1. **OpenAI APIキー**: AI機能に必要
2. **デフォルト保存パス**: マークダウンファイルの保存先
3. **書き起こし要約プロンプト**: 書き起こしの要約方法をカスタマイズ
4. **LLMモデル選択**: 使用するOpenAIモデルを選択
5. **Notion連携**: NotionのAPIキーとデータベースID（オプション）

### ワークフロー

1. **モード選択**:
   - マークダウンモード: 直接マークダウン編集用
   - テキストモード: プレーンテキストをマークダウンに変換

2. **コンテンツ入力**:
   - ファイルをドラッグ＆ドロップ
   - ファイルブラウザでファイルを選択
   - テキストを直接入力またはペースト

3. **コンテンツ処理**:
   - テキストモードで「マークダウンに変換」をクリックしてテキストを変換
   - リアルタイムでマークダウンレンダリングをプレビュー

4. **コンテンツ保存**:
   - 「保存」ボタンをクリックしてローカルに保存
   - Notion連携が有効な場合、Notionにも保存

## 開発

```bash
# 開発モードでの実行
npm run dev
```

## ライセンス

MIT
