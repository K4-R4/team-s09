// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  detail: async () => await ipcRenderer.invoke('detail'),
  save: async (data) => await ipcRenderer.invoke('save', data),
  updated: async (number) => await ipcRenderer.invoke("update", number),
  updateds: async (stextarea) => await ipcRenderer.invoke("updated", stextarea)
})
