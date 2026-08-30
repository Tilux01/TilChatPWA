import { useCallback } from 'react';


let dbInstance = null;
let isOpening = false;
let openPromise = null;

export const chatDB = {
  async openDB() {
    if (dbInstance) return dbInstance;
    
    if (openPromise) {
      return openPromise;
    }
    
    openPromise = (async () => {
      if (isOpening) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.openDB();
      }

      isOpening = true;
      try {
        dbInstance = await new Promise((resolve, reject) => {
          const request = indexedDB.open('ChatDB', 2); // Version 2 for schema updates
          
          request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const oldVersion = event.oldVersion;
            
            if (!db.objectStoreNames.contains('chats')) {
              const store = db.createObjectStore('chats', { 
                keyPath: 'id',
                autoIncrement: false 
              });
              store.createIndex('directory', 'directory', { unique: false });
              store.createIndex('timestamp', 'timestamp', { unique: false });
              store.createIndex('directory_timestamp', ['directory', 'timestamp'], { unique: false });
              
              console.log('Created new chats store');
            } else if (oldVersion < 2) {
              const transaction = event.target.transaction;
              const store = transaction.objectStore('chats');
              
              if (!store.indexNames.contains('directory_timestamp')) {
                store.createIndex('directory_timestamp', ['directory', 'timestamp'], { unique: false });
              }
            }
          };

          request.onsuccess = (event) => {
            const db = event.target.result;
            
            db.onerror = (errorEvent) => {
              console.error('Database error:', errorEvent.target.error);
            };
            
            db.onversionchange = () => {
              console.log('Database version changed, closing connection');
              db.close();
              dbInstance = null;
            };
            
            if (navigator.storage?.persist) {
              navigator.storage.persist().then(granted => {
                if (!granted) {
                  console.log('Storage may be cleared by browser under storage pressure');
                }
              });
            }
            
            resolve(db);
          };

          request.onerror = (event) => {
            console.error('Failed to open database:', event.target.error);
            
            if (event.target.error.name === 'InvalidStateError' || 
                event.target.error.name === 'VersionError') {
              console.log('Attempting to recover from corrupted database...');
              try {
                indexedDB.deleteDatabase('ChatDB');
              } catch (e) {
                console.error('Failed to delete corrupted database:', e);
              }
            }
            
            reject(event.target.error);
          };

          request.onblocked = () => {
            console.warn('Database is blocked by other tabs');
            reject(new Error('Please close other tabs with this app open'));
          };
        });
        
        return dbInstance;
      } catch (error) {
        console.error('Database opening failed:', error);
        dbInstance = null;
        throw error;
      } finally {
        isOpening = false;
        openPromise = null;
      }
    })();
    
    return openPromise;
  },

  async saveChat(directory, data) {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['chats'], 'readwrite');
      const store = tx.objectStore('chats');
      
      const chatRecord = {
        id: `chat_${directory}_${Date.now()}`,
        directory,
        data,
        timestamp: Date.now(),
        version: 1
      };
      
      const request = store.put(chatRecord);
      
      const timeoutId = setTimeout(() => {
        if (tx.mode !== 'finished') {
          tx.abort();
          reject(new Error('Save operation timed out after 30 seconds'));
        }
      }, 30000);
      
      request.onsuccess = () => {
        clearTimeout(timeoutId);
        resolve({
          success: true,
          id: chatRecord.id,
          directory,
          timestamp: chatRecord.timestamp
        });
      };
      
      request.onerror = (event) => {
        clearTimeout(timeoutId);
        const error = event.target.error;
        
        if (error?.name === 'QuotaExceededError') {
          reject(new Error(
            `Storage is full. Chat not saved.\n\n` +
            `You can:\n` +
            `1. Clear old chats using cleanupOldChats()\n` +
            `2. Export important chats to files\n` +
            `3. The browser will manage space automatically`
          ));
        } else {
          reject(error || new Error('Failed to save chat'));
        }
      };
      
      tx.oncomplete = () => {
        clearTimeout(timeoutId);
      };
      
      tx.onerror = (event) => {
        clearTimeout(timeoutId);
        reject(event.target.error);
      };
    });
  },

  async getChat(directory) {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['chats'], 'readonly');
      const store = tx.objectStore('chats');
      const index = store.index('directory');
      
      const request = index.openCursor(directory, 'prev');
      
      const timeoutId = setTimeout(() => {
        reject(new Error('Load operation timed out'));
      }, 10000);
      
      request.onsuccess = (event) => {
        clearTimeout(timeoutId);
        const cursor = event.target.result;
        if (cursor) {
          resolve(cursor.value.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = (event) => {
        clearTimeout(timeoutId);
        reject(event.target.error);
      };
    });
  },


  async getChatHistory(directory, limit = 50) {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['chats'], 'readonly');
      const store = tx.objectStore('chats');
      const index = store.index('directory');
      
      const request = index.getAll(directory);
      
      request.onsuccess = (event) => {
        const results = event.target.result;
        const sorted = results
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit)
          .map(item => item.data);
        resolve(sorted);
      };
      
      request.onerror = reject;
    });
  },

  async getAllDirectories() {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['chats'], 'readonly');
      const store = tx.objectStore('chats');
      const index = store.index('directory');
      
      const request = index.getAllKeys();
      
      request.onsuccess = (event) => {
        const directories = [...new Set(event.target.result)];
        resolve(directories);
      };
      
      request.onerror = reject;
    });
  },

  async cleanupOldChats(daysOld = 30, maxToDelete = 1000) {
    const db = await this.openDB();
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['chats'], 'readwrite');
      const store = tx.objectStore('chats');
      const index = store.index('timestamp');
      
      const range = IDBKeyRange.upperBound(cutoff);
      const request = index.openCursor(range);
      let deleted = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && deleted < maxToDelete) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve({
            deleted,
            message: `Cleaned up ${deleted} old chats (older than ${daysOld} days)`
          });
        }
      };
      
      request.onerror = (event) => {
        reject(event.target.error);
      };
      
      tx.oncomplete = () => {
        if (deleted > 0) {
          console.log(`Cleaned ${deleted} old chats`);
        }
      };
    });
  },

  async clearAllChats() {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['chats'], 'readwrite');
      const store = tx.objectStore('chats');
      
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve({
          success: true,
          message: 'All chats cleared successfully'
        });
      };
      
      request.onerror = reject;
    });
  },

  async deleteChat(directory) {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['chats'], 'readwrite');
      const store = tx.objectStore('chats');
      const index = store.index('directory');
      
      const request = index.openCursor(directory);
      let deleted = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve({
            deleted,
            success: true,
            message: `Deleted ${deleted} chat(s) for directory: ${directory}`
          });
        }
      };
      
      request.onerror = reject;
    });
  },

  async getStats() {
    try {
      const db = await this.openDB();
      const tx = db.transaction(['chats'], 'readonly');
      const store = tx.objectStore('chats');
      
      const count = await new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = reject;
      });
      
      let storageInfo = null;
      if (navigator.storage?.estimate) {
        try {
          storageInfo = await navigator.storage.estimate();
        } catch (e) {
          console.warn('Could not get storage estimate:', e);
        }
      }
      
      const directories = await this.getAllDirectories();
      
      return {
        chatCount: count,
        directoryCount: directories.length,
        directories,
        storageInfo,
        databaseSize: 'auto-managed by browser'
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        chatCount: 0,
        directoryCount: 0,
        directories: [],
        storageInfo: null,
        error: error.message
      };
    }
  },

  async healthCheck() {
    try {
      const db = await this.openDB();
      
      const tx = db.transaction(['chats'], 'readonly');
      const store = tx.objectStore('chats');
      
      await new Promise((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => resolve();
        request.onerror = reject;
      });
      
      return {
        healthy: true,
        message: 'Database is working correctly',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Database error: ${error.message}`,
        timestamp: new Date().toISOString(),
        error: error.toString()
      };
    }
  },

  closeDB() {
    if (dbInstance) {
      dbInstance.close();
      dbInstance = null;
      console.log('Database connection closed');
    }
  },

  isOpen() {
    return !!dbInstance;
  }
};

export function useChatDB() {
  const saveChat = useCallback(chatDB.saveChat.bind(chatDB), []);
  const getChat = useCallback(chatDB.getChat.bind(chatDB), []);
  const getChatHistory = useCallback(chatDB.getChatHistory.bind(chatDB), []);
  const getAllDirectories = useCallback(chatDB.getAllDirectories.bind(chatDB), []);
  const cleanupOldChats = useCallback(chatDB.cleanupOldChats.bind(chatDB), []);
  const clearAllChats = useCallback(chatDB.clearAllChats.bind(chatDB), []);
  const deleteChat = useCallback(chatDB.deleteChat.bind(chatDB), []);
  const getStats = useCallback(chatDB.getStats.bind(chatDB), []);
  const healthCheck = useCallback(chatDB.healthCheck.bind(chatDB), []);
  const closeDB = useCallback(chatDB.closeDB.bind(chatDB), []);

  return {
    saveChat,
    getChat,
    getChatHistory,
    getAllDirectories,
    cleanupOldChats,
    clearAllChats,
    deleteChat,
    getStats,
    healthCheck,
    closeDB,
    isOpen: chatDB.isOpen()
  };
}

export default chatDB;