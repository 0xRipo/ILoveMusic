const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  addSoundCloud: (url) => ipcRenderer.invoke('soundcloud:add', url),
  downloadTracks: (trackIds, tracks) => ipcRenderer.invoke('soundcloud:download', trackIds, tracks),
  exportRekordbox: (tracks) => ipcRenderer.invoke('exportRekordbox', tracks),
  saveTracks: (tracks) => ipcRenderer.invoke('tracks:save', tracks),
  loadTracks: () => ipcRenderer.invoke('tracks:load'),
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download:progress', (_, progress) => callback(progress));
  },
  removeDownloadProgressListener: () => {
    ipcRenderer.removeAllListeners('download:progress');
  }
});
