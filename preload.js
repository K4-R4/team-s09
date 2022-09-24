// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  detail: async () => await ipcRenderer.invoke('detail'),
  save: async (data, deadline) => await ipcRenderer.invoke('save', data, deadline),
  toggleDisplay: async (taskId) => await ipcRenderer.invoke('toggleDisplay', taskId), 
  /*TODO
  edit function*/
  edit: async (task_id) => ipcRenderer.invoke('edit', task_id),
  saveChange: async(task_id, data, deadline) => await ipcRenderer.invoke('saveChange', task_id, data, deadline),
  /*TODO
  delete function*/
  deleted: async (task_id) => await ipcRenderer.invoke("deleted", task_id),
  /*TODO
  display function*/
  displayTasks: async () => await ipcRenderer.invoke('displayTasks'),
  /*TODO
  settings function*/
  restoreOriginalWallpaper: async () => await ipcRenderer.invoke('restoreOriginalWallpaper'),
  openSettings: async () => await ipcRenderer.invoke('openSettings'),
  saveBaseWallpaper: async () => ipcRenderer.invoke('saveBaseWallpaper'),
  saveFontFile: async () => ipcRenderer.invoke('saveFontFile'),
  saveSettings: async (taskPosition, fontSize, lineSpacing) => await ipcRenderer.invoke('saveSettings', taskPosition, fontSize, lineSpacing),
  backToMainWindow: async () => await ipcRenderer.invoke('backToMainWindow'),
  on: (channel, callback) => ipcRenderer.on(channel, (event, argv) => callback(event, argv))
})
