import { 
  getDoc,
  DocumentReference,
  DocumentSnapshot,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../firebase';

interface FetchOptions {
  maxRetries?: number;
  retryDelay?: number;
  allowCached?: boolean;
}

const defaultOptions: FetchOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  allowCached: true
};

export const getDocumentWithRetry = async <T>(
  docRef: DocumentReference,
  options: FetchOptions = defaultOptions
): Promise<DocumentSnapshot<T>> => {
  let lastError;
  const { maxRetries = 3, retryDelay = 1000, allowCached = true } = options;

  // Try to get from cache first if allowed
  if (allowCached) {
    try {
      const cachedDoc = await getDoc(docRef);
      if (cachedDoc.exists() && !cachedDoc.metadata.hasPendingWrites) {
        return cachedDoc as DocumentSnapshot<T>;
      }
    } catch (error) {
      console.warn('Failed to get document from cache:', error);
    }
  }

  // Try to fetch from server with retries
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Enable network for fresh fetch
      await enableNetwork(db);
      
      const snapshot = await getDoc(docRef);
      
      if (!snapshot.exists()) {
        throw new Error('Document does not exist');
      }

      return snapshot as DocumentSnapshot<T>;
    } catch (error: any) {
      lastError = error;
      
      if (error.code === 'unavailable' || error.code === 'failed-precondition') {
        // If offline, wait and retry
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      throw error; // Re-throw other errors
    }
  }

  // If all retries failed and we allow cached data
  if (allowCached) {
    try {
      // Disable network to force cache usage
      await disableNetwork(db);
      const cachedDoc = await getDoc(docRef);
      if (cachedDoc.exists()) {
        // Re-enable network after getting cached data
        enableNetwork(db).catch(console.error);
        return cachedDoc as DocumentSnapshot<T>;
      }
    } catch (error) {
      console.error('Failed to get document from cache after retries:', error);
    } finally {
      // Make sure network is re-enabled
      enableNetwork(db).catch(console.error);
    }
  }

  throw lastError || new Error('Failed to fetch document');
};

// Connection state management
export const getConnectionState = async (): Promise<boolean> => {
  try {
    await enableNetwork(db);
    return true;
  } catch {
    return false;
  }
};

// Cache management
export const clearCache = async () => {
  try {
    // Clear IndexedDB data
    const dbName = `firestore/${db.app.options.projectId}/(default)`;
    const request = indexedDB.deleteDatabase(dbName);
    
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(new Error('Failed to clear cache'));
      request.onsuccess = () => resolve(true);
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
};

// Network state management
export const forceOnline = () => enableNetwork(db);
export const forceOffline = () => disableNetwork(db);