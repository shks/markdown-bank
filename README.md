# Markdown Bank

An Electron-based desktop application for converting, processing, and storing markdown files with AI-powered features.

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
