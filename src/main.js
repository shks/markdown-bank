const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const { Client } = require('@notionhq/client');
require('dotenv').config();

let mainWindow;
let openai;

function initializeOpenAI(apiKey) {
  try {
    openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY
    });
    return { success: true };
  } catch (error) {
    console.error('OpenAI initialization error:', error);
    return { success: false, error: error.message };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  initializeOpenAI();

  app.on('activate', () => {
    if (mainWindow === null) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('save-file', async (event, { content, suggestedName, directory, skipDialog, llmModel }) => {
  try {
    let filePath;
    
    if (skipDialog) {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      
      let title = await generateTitleWithAI(content, llmModel);
      
      if (!title) {
        console.log('Falling back to heading or first line for local file title');
        const headingMatch = content.match(/^#\s+(.+)$/m);
        if (headingMatch && headingMatch[1]) {
          title = headingMatch[1].trim().substring(0, 30); // Limit title length
        } else {
          const firstLine = content.split('\n')[0];
          title = firstLine.substring(0, 30);
        }
      }
      
      title = title.replace(/[\\/:*?"<>|]/g, '-');
      
      const filename = `${dateStr}-${title}.md`;
      filePath = path.join(directory || app.getPath('documents'), filename);
      
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, content);
      return { success: true, path: filePath };
    } else {
      const { filePath: selectedPath } = await dialog.showSaveDialog({
        defaultPath: path.join(directory || app.getPath('documents'), suggestedName || 'untitled.md'),
        filters: [
          { name: 'Markdown', extensions: ['md'] }
        ]
      });
      
      if (selectedPath) {
        fs.writeFileSync(selectedPath, content);
        return { success: true, path: selectedPath };
      }
      return { success: false, error: 'No file path selected' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-directory', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    
    if (filePaths && filePaths.length > 0) {
      return { success: true, path: filePaths[0] };
    }
    return { success: false, error: 'No directory selected' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-api-key', async (event, apiKey) => {
  return initializeOpenAI(apiKey);
});

ipcMain.handle('convert-text', async (event, { text, createSummary, summaryPrompt, llmModel, currentMode }) => {
  console.log('convert-text IPC handler called with:', { 
    textLength: text.length, 
    createSummary, 
    hasSummaryPrompt: !!summaryPrompt,
    llmModel,
    currentMode
  });
  
  if (!openai) {
    console.error('OpenAI API not initialized');
    return { 
      success: false, 
      error: 'OpenAI API not initialized. Please check your API key.' 
    };
  }
  
  try {
    const isMarkdown = currentMode === 'markdown' && (
                       text.includes('#') || 
                       text.includes('**') || 
                       text.includes('__') ||
                       text.includes('```') ||
                       text.includes('- ') ||
                       text.includes('1. '));
    
    const isTranscription = /(\[\d{2}:\d{2}\]|\(\d{2}:\d{2}\)|話者[A-Z]:|Speaker [A-Z]:)/.test(text);
    
    console.log('Text analysis:', { isMarkdown, isTranscription, createSummary, currentMode });
    
    let prompt;
    
    if (isMarkdown) {
      console.log('Text is already markdown, returning as-is');
      return { 
        success: true, 
        result: text,
        isMarkdown: true
      };
    } else if (isTranscription && createSummary) {
      console.log('Creating summary for transcription text');
      if (summaryPrompt) {
        prompt = `${summaryPrompt}\n\nテキスト:\n${text}`;
        console.log('Using custom summary prompt');
      } else {
        prompt = `
          以下は音声書き起こしテキストです。このテキストを要約し、マークダウン形式で整形してください。
          要約は「# サマリー」セクションに、元のテキストは「# 元の書き起こし」セクションに含めてください。
          
          テキスト:
          ${text}
        `;
        console.log('Using default summary prompt');
      }
    } else {
      console.log('Converting regular text to markdown');
      prompt = `
        以下のテキストをマークダウン形式に変換してください。
        適切な見出し、箇条書き、強調などを使用して、読みやすく構造化されたマークダウンにしてください。
        
        テキスト:
        ${text}
      `;
    }
    
    const modelToUse = llmModel || "gpt-3.5-turbo";
    console.log(`Using LLM model: ${modelToUse}`);
    
    const completion = await openai.chat.completions.create({
      model: modelToUse,
      messages: [
        { role: "system", content: "あなたはテキストをマークダウン形式に変換する専門家です。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });
    
    return { 
      success: true, 
      result: completion.choices[0].message.content,
      isMarkdown: true,
      isTranscription: isTranscription
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return { 
      success: false, 
      error: `OpenAI API エラー: ${error.message}` 
    };
  }
});
async function generateTitleWithAI(content, llmModel = "gpt-3.5-turbo") {
  if (!openai) {
    console.error('OpenAI API not initialized for title generation');
    return null;
  }
  
  try {
    console.log('Generating title with AI...');
    
    const prompt = `
      以下のマークダウンテキストの内容を適切に表現する、簡潔で分かりやすいタイトルを生成してください。
      タイトルは30文字以内で、内容を一目で理解できるものにしてください。
      タイトルのみを返してください。

      テキスト:
      ${content.substring(0, 1500)} /* 長すぎる場合は先頭部分のみ使用 */
    `;
    
    const completion = await openai.chat.completions.create({
      model: llmModel,
      messages: [
        { role: "system", content: "あなたは文章の内容を適切に表現するタイトルを生成する専門家です。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 50
    });
    
    const generatedTitle = completion.choices[0].message.content.trim();
    console.log('AI generated title:', generatedTitle);
    return generatedTitle;
  } catch (error) {
    console.error('Title generation error:', error);
    return null;
  }
}

ipcMain.handle('save-to-notion', async (event, { content, notionApiKey, notionDatabaseId, llmModel }) => {
  try {
    if (!notionApiKey || !notionDatabaseId) {
      return { 
        success: false, 
        error: 'Notion API key or database ID is missing.' 
      };
    }
    
    const notion = new Client({ 
      auth: notionApiKey 
    });
    
    let title = await generateTitleWithAI(content, llmModel);
    
    if (!title) {
      console.log('Falling back to heading or first line for title');
      const headingMatch = content.match(/^#\s+(.+)$/m);
      if (headingMatch && headingMatch[1]) {
        title = headingMatch[1].trim().substring(0, 100); // Limit title length
      } else {
        const firstLine = content.split('\n')[0];
        title = firstLine.substring(0, 100);
      }
    }
    
    const MAX_BLOCK_SIZE = 1900; // Leave some buffer
    const blocks = [];
    
    const paragraphs = content.split('\n\n');
    
    for (const paragraph of paragraphs) {
      if (paragraph.length <= MAX_BLOCK_SIZE) {
        blocks.push(paragraph);
      } else {
        let remainingText = paragraph;
        
        while (remainingText.length > 0) {
          if (remainingText.length <= MAX_BLOCK_SIZE) {
            blocks.push(remainingText);
            break;
          }
          
          let splitIndex = MAX_BLOCK_SIZE;
          
          const sentenceEndMarkers = ['. ', '。', '! ', '? ', '！ ', '？ '];
          let bestEndIndex = -1;
          
          for (const marker of sentenceEndMarkers) {
            let lastIndex = -1;
            let tempIndex = -1;
            
            while ((tempIndex = remainingText.indexOf(marker, tempIndex + 1)) !== -1 && tempIndex < MAX_BLOCK_SIZE) {
              lastIndex = tempIndex;
            }
            
            if (lastIndex > bestEndIndex) {
              bestEndIndex = lastIndex + marker.length;
            }
          }
          
          if (bestEndIndex > 0) {
            splitIndex = bestEndIndex;
          }
          
          blocks.push(remainingText.substring(0, splitIndex));
          remainingText = remainingText.substring(splitIndex);
        }
      }
    }
    
    console.log(`Split content into ${blocks.length} blocks for Notion API compatibility`);
    
    const children = blocks.map(block => ({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: block
            }
          }
        ]
      }
    }));
    
    const response = await notion.pages.create({
      parent: {
        database_id: notionDatabaseId
      },
      properties: {
        'Name': {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        }
      },
      children: children
    });
    
    console.log('Notion page created:', response.id);
    return { 
      success: true, 
      pageId: response.id,
      pageUrl: `https://notion.so/${response.id.replace(/-/g, '')}`
    };
  } catch (error) {
    console.error('Notion API error:', error);
    return { 
      success: false, 
      error: `Notion API error: ${error.message}` 
    };
  }
});
