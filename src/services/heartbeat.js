const DEFAULT_TIMEOUT = 6_000;

// Set VITE_HEARTBEAT_URL to a lightweight, unauthenticated backend health route in production.
export async function heartbeat(url = import.meta.env.VITE_HEARTBEAT_URL || '/') {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  const startedAt = performance.now();
  const separator = url.includes('?') ? '&' : '?';
  try {
    const response = await fetch(`${url}${separator}_network=${Date.now()}`, {
      method: 'HEAD', cache: 'no-store', headers: { 'x-network-heartbeat': '1' }, signal: controller.signal,
    });
    return { reachable: response.ok, latency: Math.round(performance.now() - startedAt) };
  } catch {
    return { reachable: false, latency: null };
  } finally { window.clearTimeout(timeout); }
}
