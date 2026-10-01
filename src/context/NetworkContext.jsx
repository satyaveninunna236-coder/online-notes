import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { heartbeat } from '../services/heartbeat';
import { networkQueue } from '../services/networkQueue';
import { NetworkContext } from './network-context';

export function NetworkProvider({ children, heartbeatUrl, onFlushQueue }) {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [wasOffline, setWasOffline] = useState(false);
  const [serverReachable, setServerReachable] = useState(true);
  const [queuedCount, setQueuedCount] = useState(() => networkQueue.count());

  const checking = useRef(false);

  const checkServer = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Do not attempt or claim server is down when the user is simply offline
      return;
    }
    if (checking.current) return;

    // Only test heartbeat if an explicit URL is provided
    const targetUrl = heartbeatUrl || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HEARTBEAT_URL);
    if (!targetUrl) {
      setServerReachable(true);
      return;
    }

    checking.current = true;
    try {
      const result = await heartbeat(targetUrl);
      setServerReachable(Boolean(result?.reachable));
      if (result?.reachable && onFlushQueue) {
        await networkQueue.flush(onFlushQueue);
        setQueuedCount(networkQueue.count());
      }
    } catch {
      setServerReachable(false);
    } finally {
      checking.current = false;
    }
  }, [heartbeatUrl, onFlushQueue]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      checkServer();
    };

    const handleOffline = () => {
      setIsOnline(false);
      // User lost connection. Do NOT mark server as offline.
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check only if online
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      checkServer();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkServer]);

  const value = useMemo(() => {
    const status = !isOnline ? 'offline' : wasOffline ? 'reconnected' : 'online';
    return {
      isOnline,
      wasOffline,
      serverReachable,
      queuedCount,
      status: !isOnline ? 'offline' : 'online',
      internetStatus: status,
      retryConnection: () => checkServer(),
      enqueueRequest: (item) => {
        const id = networkQueue.enqueue(item);
        setQueuedCount(networkQueue.count());
        return id;
      },
    };
  }, [isOnline, wasOffline, serverReachable, queuedCount, checkServer]);

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}
