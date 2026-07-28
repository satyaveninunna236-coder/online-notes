import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { heartbeat } from '../services/heartbeat';
import { networkQueue } from '../services/networkQueue';
import { NetworkContext } from './network-context';

const details = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const type = connection?.effectiveType || connection?.type || 'unknown';
  return { connectionType: type, networkQuality: !connection ? 'unknown' : connection.downlink < 1 || connection.rtt > 800 ? 'slow' : 'good' };
};

export function NetworkProvider({ children, heartbeatUrl, onFlushQueue }) {
  const [state, setState] = useState(() => ({ status: navigator.onLine ? 'reconnecting' : 'offline', serverReachable: false, lastOnlineAt: null, lastOfflineAt: navigator.onLine ? null : new Date().toISOString(), queuedCount: networkQueue.count(), ...details() }));
  const checking = useRef(false); const retryTimer = useRef(); const retryAttempt = useRef(0);
  const verify = useCallback(async ({ retry = false } = {}) => {
    if (checking.current) return false;
    if (!navigator.onLine) { setState(s => ({ ...s, status: 'offline', serverReachable: false, lastOfflineAt: new Date().toISOString() })); return false; }
    checking.current = true; setState(s => ({ ...s, status: 'reconnecting' }));
    const result = await heartbeat(heartbeatUrl); checking.current = false;
    if (result.reachable) {
      retryAttempt.current = 0;
      setState(s => ({ ...s, status: 'online', serverReachable: true, latency: result.latency, lastOnlineAt: new Date().toISOString(), ...details() }));
      if (onFlushQueue) { await networkQueue.flush(onFlushQueue); setState(s => ({ ...s, queuedCount: networkQueue.count() })); }
      return true;
    }
    setState(s => ({ ...s, status: 'server-unreachable', serverReachable: false, ...details() }));
    // 1s, 2s, 4s, 8s; then wait for an explicit retry or a browser network event.
    if (retry && retryAttempt.current < 4) {
      const delay = 1_000 * (2 ** retryAttempt.current++);
      retryTimer.current = window.setTimeout(() => verify({ retry: true }), delay);
    }
    return false;
  }, [heartbeatUrl, onFlushQueue]);
  useEffect(() => {
    const online = () => verify({ retry: true }); const offline = () => setState(s => ({ ...s, status: 'offline', serverReachable: false, lastOfflineAt: new Date().toISOString() }));
    // Tab focus/visibility does not mean the network changed. Rechecking there caused
    // distracting "reconnecting" and "back online" messages while simply switching tabs.
    window.addEventListener('online', online); window.addEventListener('offline', offline);
    const interval = window.setInterval(() => document.visibilityState === 'visible' && verify(), 30_000); verify({ retry: true });
    return () => { window.removeEventListener('online', online); window.removeEventListener('offline', offline); window.clearInterval(interval); window.clearTimeout(retryTimer.current); };
  }, [verify]);
  const value = useMemo(() => ({ ...state, isOnline: state.status === 'online', isOffline: state.status === 'offline', isReconnecting: state.status === 'reconnecting', retryConnection: () => { retryAttempt.current = 0; return verify({ retry: true }); }, reportRequestFailure: () => navigator.onLine && setState(s => ({ ...s, status: 'server-unreachable', serverReachable: false })), enqueueRequest: item => { const id = networkQueue.enqueue(item); setState(s => ({ ...s, queuedCount: networkQueue.count() })); return id; } }), [state, verify]);
  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}
