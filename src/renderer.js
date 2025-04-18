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

let appSettings = {
  apiKey: '',
  defaultSavePath: '',
};

function loadSettings() {
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    appSettings = JSON.parse(savedSettings);
    apiKeyInput.value = appSettings.apiKey;
    defaultSavePathInput.value = appSettings.defaultSavePath;
    savePath.textContent = appSettings.defaultSavePath || '未設定';
    
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
  localStorage.setItem('appSettings', JSON.stringify(appSettings));
  
  savePath.textContent = appSettings.defaultSavePath || '未設定';
  
  if (appSettings.apiKey) {
    const result = await window.electronAPI.updateApiKey(appSettings.apiKey);
    
    if (result.success) {
      apiKeyStatus.textContent = 'API設定済み';
      apiKeyStatus.classList.add('connected');
    } else {
      apiKeyStatus.textContent = 'APIエラー';
      apiKeyStatus.classList.remove('connected');
      apiKeyStatus.classList.add('error');
      alert(`APIキーの設定に失敗しました: ${result.error}`);
    }
  } else {
    apiKeyStatus.textContent = 'API未設定';
    apiKeyStatus.classList.remove('connected');
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
        previewContent.innerHTML = '<p>マークダウンファイルを読み込みました。変換は不要です。</p>';
        previewContent.innerHTML += `<div class="markdown-preview">${marked.parse(content)}</div>`;
      } else {
        previewContent.innerHTML = '<p>非マークダウンファイルを読み込みました。変換が必要です。</p>';
        convertBtn.click(); // Trigger conversion
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
  if (!appSettings.apiKey) {
    previewContent.innerHTML = '<p class="error">OpenAI APIキーが設定されていません。設定から追加してください。</p>';
    return null;
  }
  
  previewContent.innerHTML = '<p>変換中...</p>';
  
  try {
    const result = await window.electronAPI.convertText({
      text,
      createSummary
    });
    
    if (result.success) {
      return result.result;
    } else {
      previewContent.innerHTML = `<p class="error">変換に失敗しました: ${result.error}</p>`;
      return null;
    }
  } catch (error) {
    previewContent.innerHTML = `<p class="error">エラーが発生しました: ${error.message}</p>`;
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
  
  return transcriptionPatterns.some(pattern => pattern.test(text));
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
    alert('保存するコンテンツがありません。');
    return;
  }
  
  try {
    const result = await window.electronAPI.saveFile({
      content,
      suggestedName: 'document.md',
      directory: appSettings.defaultSavePath
    });
    
    if (result.success) {
      previewContent.innerHTML += `<p class="success">ファイルを保存しました: ${result.path}</p>`;
    } else {
      previewContent.innerHTML += `<p class="error">保存に失敗しました: ${result.error}</p>`;
    }
  } catch (error) {
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

document.addEventListener('DOMContentLoaded', () => {
  marked.setOptions({
    breaks: true,
    gfm: true
  });
  
  loadSettings();
  initDragAndDrop();
  
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
    const text = textInput.value.trim();
    if (!text) {
      previewContent.innerHTML = '<p class="error">テキストを入力してください。</p>';
      return;
    }
    
    const createSummary = summaryOption.checked;
    const markdownContent = await convertToMarkdown(text, createSummary);
    
    if (markdownContent) {
      previewContent.innerHTML = `<div class="markdown-preview">${marked.parse(markdownContent)}</div>`;
      textInput.value = markdownContent; // Update text area with converted content
    }
  });
  
  saveBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (!text) {
      previewContent.innerHTML = '<p class="error">保存するテキストがありません。</p>';
      return;
    }
    
    saveMarkdownFile(text);
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
