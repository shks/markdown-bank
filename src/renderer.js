const dropArea = document.getElementById('dropArea');
const fileSelectBtn = document.getElementById('fileSelectBtn');
const textInput = document.getElementById('textInput');
const convertBtn = document.getElementById('convertBtn');
const saveBtn = document.getElementById('saveBtn');
const summaryOption = document.getElementById('summaryOption');
const previewContent = document.getElementById('previewContent');
const settingsBtn = document.getElementById('settingsBtn');
const apiKeyStatus = document.getElementById('apiKeyStatus');
const savePath = document.getElementById('savePath');
const selectPathBtn = document.getElementById('selectPathBtn');
const settingsModal = document.getElementById('settingsModal');
const closeBtn = document.querySelector('.close-btn');
const apiKeyInput = document.getElementById('apiKey');
const defaultSavePathInput = document.getElementById('defaultSavePath');
const browsePathBtn = document.getElementById('browsePathBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const markdownModeBtn = document.getElementById('markdownModeBtn');
const textModeBtn = document.getElementById('textModeBtn');
const textModeControls = document.getElementById('textModeControls');
const inputTitle = document.getElementById('inputTitle');

const notificationContainer = document.createElement('div');
notificationContainer.className = 'notification-container';
document.body.appendChild(notificationContainer);

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  notificationContainer.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notificationContainer.removeChild(notification);
    }, 300);
  }, 3000);
}

let appSettings = {
  apiKey: '',
  defaultSavePath: '',
  summaryPrompt: '',
  llmModel: 'gpt-3.5-turbo',
  notionApiKey: '',
  notionDatabaseId: '',
  enableNotionSync: false,
};

function loadSettings() {
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    appSettings = JSON.parse(savedSettings);
    apiKeyInput.value = appSettings.apiKey;
    defaultSavePathInput.value = appSettings.defaultSavePath;
    savePath.textContent = appSettings.defaultSavePath || '未設定';
    
    const summaryPromptInput = document.getElementById('summaryPrompt');
    if (summaryPromptInput && appSettings.summaryPrompt) {
      summaryPromptInput.value = appSettings.summaryPrompt;
    } else if (summaryPromptInput) {
      summaryPromptInput.value = '以下は音声書き起こしテキストです。このテキストを要約し、マークダウン形式で整形してください。要約は「# サマリー」セクションに、元のテキストは「# 元の書き起こし」セクションに含めてください。';
    }
    
    const llmModelSelect = document.getElementById('llmModel');
    if (llmModelSelect && appSettings.llmModel) {
      llmModelSelect.value = appSettings.llmModel;
    }
    
    const notionApiKeyInput = document.getElementById('notionApiKey');
    if (notionApiKeyInput && appSettings.notionApiKey) {
      notionApiKeyInput.value = appSettings.notionApiKey;
    }
    
    const notionDatabaseIdInput = document.getElementById('notionDatabaseId');
    if (notionDatabaseIdInput && appSettings.notionDatabaseId) {
      notionDatabaseIdInput.value = appSettings.notionDatabaseId;
    }
    
    const enableNotionSyncCheckbox = document.getElementById('enableNotionSync');
    if (enableNotionSyncCheckbox) {
      enableNotionSyncCheckbox.checked = appSettings.enableNotionSync || false;
    }
    
    if (appSettings.apiKey) {
      apiKeyStatus.textContent = 'API設定済み';
      apiKeyStatus.classList.add('connected');
      
      window.electronAPI.updateApiKey(appSettings.apiKey);
    }
  }
}

async function saveSettings() {
  appSettings.apiKey = apiKeyInput.value;
  appSettings.defaultSavePath = defaultSavePathInput.value;
  
  const summaryPromptInput = document.getElementById('summaryPrompt');
  if (summaryPromptInput) {
    appSettings.summaryPrompt = summaryPromptInput.value;
  }
  
  const llmModelSelect = document.getElementById('llmModel');
  if (llmModelSelect) {
    appSettings.llmModel = llmModelSelect.value;
  }
  
  const notionApiKeyInput = document.getElementById('notionApiKey');
  if (notionApiKeyInput) {
    appSettings.notionApiKey = notionApiKeyInput.value;
  }
  
  const notionDatabaseIdInput = document.getElementById('notionDatabaseId');
  if (notionDatabaseIdInput) {
    appSettings.notionDatabaseId = notionDatabaseIdInput.value;
  }
  
  const enableNotionSyncCheckbox = document.getElementById('enableNotionSync');
  if (enableNotionSyncCheckbox) {
    appSettings.enableNotionSync = enableNotionSyncCheckbox.checked;
  }
  
  localStorage.setItem('appSettings', JSON.stringify(appSettings));
  
  savePath.textContent = appSettings.defaultSavePath || '未設定';
  
  if (appSettings.apiKey) {
    const result = await window.electronAPI.updateApiKey(appSettings.apiKey);
    
    if (result.success) {
      apiKeyStatus.textContent = 'API設定済み';
      apiKeyStatus.classList.add('connected');
      showNotification('設定を保存しました', 'success');
    } else {
      apiKeyStatus.textContent = 'APIエラー';
      apiKeyStatus.classList.remove('connected');
      apiKeyStatus.classList.add('error');
      showNotification(`APIキーの設定に失敗しました: ${result.error}`, 'error');
    }
  } else {
    apiKeyStatus.textContent = 'API未設定';
    apiKeyStatus.classList.remove('connected');
    showNotification('設定を保存しました', 'success');
  }
  
  settingsModal.style.display = 'none';
}

function initDragAndDrop() {
  window.electronAPI.handleFileDrop((files) => {
    handleFiles(files);
  });
  
  dropArea.addEventListener('dragenter', () => {
    dropArea.classList.add('active');
  });
  
  dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('active');
  });
}

async function handleFiles(files) {
  for (const file of files) {
    try {
      const content = await window.electronAPI.readFile(file);
      
      textInput.value = content;
      
      if (isMarkdownFile(file.name)) {
        setAppMode('markdown');
        previewContent.innerHTML = '<p>マークダウンファイルを読み込みました。変換は不要です。</p>';
        previewContent.innerHTML += `<div class="markdown-preview">${marked.parse(content)}</div>`;
      } else {
        setAppMode('text');
        previewContent.innerHTML = '<p>非マークダウンファイルを読み込みました。変換が必要です。</p>';
        
        previewContent.innerHTML += '<p>「マークダウンに変換」ボタンをクリックして、マークダウンに変換できます。</p>';
      }
    } catch (error) {
      previewContent.innerHTML = `<p class="error">ファイルの読み込みに失敗しました: ${error.message}</p>`;
    }
  }
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = () => {
      previewContent.innerHTML = '<p class="error">ファイルの読み込みに失敗しました。</p>';
      resolve(null);
    };
    reader.readAsText(file);
  });
}

function isMarkdownFile(filename) {
  return /\.(md|markdown)$/i.test(filename);
}

function renderMarkdown(text) {
  return text
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gm, '<em>$1</em>')
    .replace(/\n/gm, '<br>');
}

async function convertToMarkdown(text, createSummary = false) {
  console.log('convertToMarkdown called with:', { textLength: text.length, createSummary, currentMode });
  
  if (!appSettings.apiKey) {
    previewContent.innerHTML = '<p class="error">OpenAI APIキーが設定されていません。設定から追加してください。</p>';
    showNotification('OpenAI APIキーが設定されていません', 'error');
    return null;
  }
  
  previewContent.innerHTML = '<p>変換中...</p>';
  
  try {
    console.log('Sending to main process:', { 
      textPreview: text.substring(0, 100), 
      createSummary, 
      summaryPrompt: appSettings.summaryPrompt ? appSettings.summaryPrompt.substring(0, 50) + '...' : null,
      llmModel: appSettings.llmModel,
      currentMode
    });
    
    const result = await window.electronAPI.convertText({
      text,
      createSummary,
      summaryPrompt: appSettings.summaryPrompt,
      llmModel: appSettings.llmModel,
      currentMode
    });
    
    console.log('Received from main process:', { success: result.success, resultLength: result.result ? result.result.length : 0 });
    
    if (result.success) {
      showNotification('テキストを変換しました', 'success');
      return result.result;
    } else {
      previewContent.innerHTML = `<p class="error">変換に失敗しました: ${result.error}</p>`;
      showNotification('変換に失敗しました', 'error');
      console.error('Conversion error:', result.error);
      return null;
    }
  } catch (error) {
    previewContent.innerHTML = `<p class="error">エラーが発生しました: ${error.message}</p>`;
    showNotification('エラーが発生しました', 'error');
    console.error('Exception in convertToMarkdown:', error);
    return null;
  }
}

function isTranscriptionText(text) {
  const transcriptionPatterns = [
    /\[\d{2}:\d{2}\]/,  // [00:00] timestamp format
    /\(\d{2}:\d{2}\)/,  // (00:00) timestamp format
    /話者[A-Z]:/,       // 話者A: format
    /Speaker [A-Z]:/    // Speaker A: format
  ];
  
  const result = transcriptionPatterns.some(pattern => pattern.test(text));
  console.log('isTranscriptionText check:', { text: text.substring(0, 100), result });
  return result;
}

function simulateTranscriptionSummary(text) {
  return "これは音声書き起こしテキストのサマリーです。実際の実装ではOpenAI APIを使用して要約を生成します。";
}

function simulateMarkdownConversion(text) {
  const paragraphs = text.split(/\n\s*\n/);
  
  let markdown = '# 変換されたドキュメント\n\n';
  
  paragraphs.forEach((para, index) => {
    if (index === 0) {
      markdown += `## はじめに\n\n${para}\n\n`;
    } else {
      markdown += `## セクション ${index}\n\n${para}\n\n`;
    }
  });
  
  return markdown;
}

async function saveMarkdownFile(content) {
  if (!content) {
    showNotification('保存するコンテンツがありません。', 'error');
    return;
  }
  
  try {
    const result = await window.electronAPI.saveFile({
      content,
      suggestedName: 'document.md',
      directory: appSettings.defaultSavePath,
      skipDialog: true, // Skip the save dialog and use the date-title format
      llmModel: appSettings.llmModel
    });
    
    let notionResult = { success: true };
    
    if (appSettings.enableNotionSync && appSettings.notionApiKey && appSettings.notionDatabaseId) {
      notionResult = await window.electronAPI.saveToNotion({
        content,
        notionApiKey: appSettings.notionApiKey,
        notionDatabaseId: appSettings.notionDatabaseId,
        llmModel: appSettings.llmModel
      });
      
      if (!notionResult.success) {
        showNotification(`Notionへの保存に失敗しました: ${notionResult.error}`, 'error');
      } else {
        showNotification('Notionデータベースに保存しました', 'success');
      }
    }
    
    if (result.success) {
      showNotification(`ファイルを保存しました: ${result.path.split('/').pop()}`, 'success');
      previewContent.innerHTML += `<p class="success">ファイルを保存しました: ${result.path}</p>`;
      
      if (appSettings.enableNotionSync && notionResult.success) {
        previewContent.innerHTML += `<p class="success">Notionデータベースにも保存しました</p>`;
      }
    } else {
      showNotification('保存に失敗しました', 'error');
      previewContent.innerHTML += `<p class="error">保存に失敗しました: ${result.error}</p>`;
    }
  } catch (error) {
    showNotification('エラーが発生しました', 'error');
    previewContent.innerHTML += `<p class="error">エラーが発生しました: ${error.message}</p>`;
  }
}

async function selectDirectory() {
  try {
    const result = await window.electronAPI.selectDirectory();
    
    if (result.success) {
      defaultSavePathInput.value = result.path;
    }
  } catch (error) {
    alert(`ディレクトリの選択に失敗しました: ${error.message}`);
  }
}

let currentMode = 'markdown';

function setAppMode(mode) {
  currentMode = mode;
  
  if (mode === 'markdown') {
    markdownModeBtn.classList.add('active');
    textModeBtn.classList.remove('active');
    textModeControls.style.display = 'none';
    inputTitle.textContent = 'マークダウン入力';
    textInput.placeholder = 'ここにマークダウンを入力してください...';
  } else {
    markdownModeBtn.classList.remove('active');
    textModeBtn.classList.add('active');
    textModeControls.style.display = 'flex';
    inputTitle.textContent = 'テキスト入力';
    textInput.placeholder = 'ここにテキストを入力してください...';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  
  loadSettings();
  initDragAndDrop();
  setAppMode('markdown'); // デフォルトはマークダウンモード
  
  markdownModeBtn.addEventListener('click', () => {
    setAppMode('markdown');
  });
  
  textModeBtn.addEventListener('click', () => {
    setAppMode('text');
  });
  
  fileSelectBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.markdown,text/plain,text/markdown';
    input.multiple = true;
    
    input.onchange = (event) => {
      if (event.target.files.length > 0) {
        handleFiles(Array.from(event.target.files));
      }
    };
    
    input.click();
  });
  
  convertBtn.addEventListener('click', async () => {
    console.log('Convert button clicked');
    const text = textInput.value.trim();
    if (!text) {
      previewContent.innerHTML = '<p class="error">テキストを入力してください。</p>';
      console.log('No text to convert');
      return;
    }
    
    const isTranscript = isTranscriptionText(text);
    console.log('Before conversion:', { isTranscript });
    const markdownContent = await convertToMarkdown(text, isTranscript);
    console.log('After conversion:', { success: !!markdownContent, contentLength: markdownContent ? markdownContent.length : 0 });
    
    if (markdownContent) {
      previewContent.innerHTML = `<div class="markdown-preview">${marked.parse(markdownContent)}</div>`;
      textInput.value = markdownContent; // Update text area with converted content
      console.log('Preview and text input updated with converted content');
    }
  });
  
  saveBtn.addEventListener('click', async () => {
    console.log('Save button clicked');
    const text = textInput.value.trim();
    if (!text) {
      previewContent.innerHTML = '<p class="error">保存するテキストがありません。</p>';
      console.log('No text to save');
      return;
    }
    
    console.log('Current mode:', currentMode);
    console.log('Text contains markdown:', { 
      hasHeadings: text.includes('#'), 
      hasBold: text.includes('**'), 
      hasCodeBlock: text.includes('```') 
    });
    
    if (currentMode === 'text' && !text.includes('#') && !text.includes('**') && !text.includes('```')) {
      const isTranscript = isTranscriptionText(text);
      console.log('Before save conversion:', { isTranscript });
      const markdownContent = await convertToMarkdown(text, isTranscript);
      console.log('After save conversion:', { success: !!markdownContent, contentLength: markdownContent ? markdownContent.length : 0 });
      
      if (markdownContent) {
        previewContent.innerHTML = `<div class="markdown-preview">${marked.parse(markdownContent)}</div>`;
        textInput.value = markdownContent;
        console.log('Preview and text input updated with converted content before save');
        saveMarkdownFile(markdownContent);
      }
    } else {
      console.log('Saving without conversion (already markdown or in markdown mode)');
      saveMarkdownFile(text);
    }
  });
  
  settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'block';
  });
  
  closeBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
  });
  
  window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
      settingsModal.style.display = 'none';
    }
  });
  
  browsePathBtn.addEventListener('click', selectDirectory);
  
  selectPathBtn.addEventListener('click', selectDirectory);
  
  saveSettingsBtn.addEventListener('click', saveSettings);
});
