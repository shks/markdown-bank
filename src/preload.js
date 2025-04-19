const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  updateApiKey: (apiKey) => ipcRenderer.invoke('update-api-key', apiKey),
  convertText: (data) => ipcRenderer.invoke('convert-text', data),
  saveToNotion: (data) => ipcRenderer.invoke('save-to-notion', data),
  
  handleFileDrop: (callback) => {
    document.addEventListener('drop', (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      if (event.dataTransfer.files.length > 0) {
        callback(Array.from(event.dataTransfer.files));
      }
    });
    
    document.addEventListener('dragover', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  },
  
  readFile: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }
});
