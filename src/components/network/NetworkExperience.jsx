import { CloudOff, LoaderCircle, RotateCw, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNetwork } from '../../context/useNetwork';

export function ConnectionBanner() {
  const { status, queuedCount } = useNetwork();
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => { if (status !== 'online') return; setShowSuccess(true); const timer = setTimeout(() => setShowSuccess(false), 2800); return () => clearTimeout(timer); }, [status]);
  const visible = status !== 'online' || showSuccess || queuedCount > 0;
  if (!visible) return null;
  const reconnecting = status === 'reconnecting'; const success = status === 'online';
  return <div className={`network-banner ${success ? 'network-success' : reconnecting ? 'network-warn' : 'network-danger'}`} role="status" aria-live="polite">
    {success ? <Wifi size={16} /> : reconnecting ? <LoaderCircle className="animate-spin" size={16} /> : <WifiOff size={16} />}
    <span>{queuedCount > 0 && success ? 'Syncing changes…' : success ? 'Back online' : reconnecting ? 'Reconnecting…' : status === 'offline' ? 'No internet connection' : 'Server temporarily unavailable'}</span>
  </div>;
}

// Deliberately a modal, not a page replacement: unsaved note state stays visible and mounted.
export function OfflineScreen() {
  const { status, retryConnection } = useNetwork();
  const [retrying, setRetrying] = useState(false);
  const visible = status === 'offline' || status === 'server-unreachable';
  if (!visible) return null;
  const serverUnavailable = status === 'server-unreachable';
  const retry = async () => { setRetrying(true); await retryConnection(); setRetrying(false); };
  return <div className="network-offline-modal" role="dialog" aria-modal="true" aria-labelledby="network-offline-title" aria-describedby="network-offline-description">
    <div className="network-offline-card">
      <div className="network-offline-icon"><CloudOff size={25} /></div>
      <div>
        <h2 id="network-offline-title">{serverUnavailable ? 'Server unavailable' : 'You’re offline'}</h2>
        <p id="network-offline-description">{serverUnavailable ? 'We can’t reach the service right now. Your notes are still safe on this device.' : 'No internet connection. Check your connection and try again.'}</p>
      </div>
      <button className="network-retry" type="button" onClick={retry} disabled={retrying}>
        <RotateCw className={retrying ? 'animate-spin' : ''} size={16} /> {retrying ? 'Checking…' : 'Try again'}
      </button>
    </div>
  </div>;
}
