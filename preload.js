// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  detail: async () => await ipcRenderer.invoke('detail'),
  save: async (data) => await ipcRenderer.invoke('save', data),
  /*TODO
  toggle display function*/
  toggleDisplay: async (taskId) => await ipcRenderer.invoke('toggleDisplay', taskId),
  /*TODO
  edit function*/
  updated: async (number) => await ipcRenderer.invoke("update", number),
  updatedbtn: async (stextarea) => await ipcRenderer.invoke("updatedbtn", stextarea)
  /*TODO
  delete function*/
})
