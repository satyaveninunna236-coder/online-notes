const KEY = 'network-request-queue:v1';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
const write = (items) => localStorage.setItem(KEY, JSON.stringify(items));

/** Persists serializable, idempotent mutation descriptors for a registered dispatcher. */
export const networkQueue = {
  count: () => read().length,
  enqueue(item) { const entry = { id: crypto.randomUUID(), attempts: 0, createdAt: Date.now(), ...item }; write([...read(), entry]); return entry.id; },
  async flush(dispatch) {
    const failed = [];
    for (const item of read()) { try { await dispatch(item); } catch { failed.push({ ...item, attempts: item.attempts + 1 }); } }
    write(failed); return failed.length;
  },
};
