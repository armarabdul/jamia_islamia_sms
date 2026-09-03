import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

const QUEUE_STORAGE_KEY = 'jamia_offline_mutation_queue';
const CACHE_STORAGE_KEY = 'jamia_offline_read_cache';

export interface QueuedAction {
  id: string; // Idempotency key
  actionType: 'MARK_ATTENDANCE' | 'SUBMIT_GRADES' | 'SUBMIT_HOMEWORK';
  endpoint: string;
  payload: any;
  timestamp: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'SYNCED';
  retryCount: number;
  errorMessage?: string;
}

export type NetworkSyncState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNC_ERROR';

export class OfflineSyncManager {
  private static isSyncing = false;

  /**
   * Enqueues a mutation locally when offline or in low-connectivity conditions.
   */
  static async enqueueAction(actionType: QueuedAction['actionType'], endpoint: string, payload: any): Promise<QueuedAction> {
    const action: QueuedAction = {
      id: `mut_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      actionType,
      endpoint,
      payload,
      timestamp: Date.now(),
      status: 'PENDING',
      retryCount: 0,
    };

    const queue = await this.getQueue();
    queue.push(action);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return action;
  }

  /**
   * Retrieves pending mutations from persistent storage.
   */
  static async getQueue(): Promise<QueuedAction[]> {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Processes all pending mutations in FIFO order against the backend API.
   */
  static async processSyncQueue(): Promise<{ synced: number; failed: number }> {
    if (this.isSyncing) return { synced: 0, failed: 0 };
    this.isSyncing = true;

    let queue = await this.getQueue();
    let syncedCount = 0;
    let failedCount = 0;

    const remainingQueue: QueuedAction[] = [];

    for (const item of queue) {
      if (item.status === 'SYNCED') continue;

      try {
        await apiClient.post(item.endpoint, item.payload, {
          headers: {
            'X-Idempotency-Key': item.id,
          },
          timeout: 10000,
        });

        syncedCount++;
      } catch (err: any) {
        // If 400 or server error, retain with failure status for retry
        item.retryCount += 1;
        item.status = 'FAILED';
        item.errorMessage = err.response?.data?.message || err.message || 'Sync error';
        remainingQueue.push(item);
        failedCount++;
      }
    }

    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
    this.isSyncing = false;

    return { synced: syncedCount, failed: failedCount };
  }

  /**
   * Caches read-only responses (Timetable, Homework, Results, Profile) for offline viewing.
   */
  static async cacheReadData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`${CACHE_STORAGE_KEY}_${key}`, JSON.stringify({
        cachedAt: Date.now(),
        data,
      }));
    } catch (e) {
      console.warn('Cache write failed:', e);
    }
  }

  static async getCachedReadData<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(`${CACHE_STORAGE_KEY}_${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data as T;
    } catch {
      return null;
    }
  }
}
