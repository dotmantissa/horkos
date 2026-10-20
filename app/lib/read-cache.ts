/** Shares in-flight work, caches successful reads, and cools down failed reads. */
export class ReadCache<T> {
  private values = new Map<string, { until: number; value: T }>();
  private pending = new Map<string, Promise<T>>();
  private failures = new Map<string, { until: number; error: unknown }>();
  private ttl: number;
  private cooldown: number;
  private now: () => number;
  constructor(ttl: number, cooldown = 30000, now = Date.now) {
    this.ttl = ttl; this.cooldown = cooldown; this.now = now;
  }
  get(key: string, read: () => Promise<T>): Promise<T> {
    const value = this.values.get(key);
    if (value && value.until > this.now()) return Promise.resolve(value.value);
    const failure = this.failures.get(key);
    if (failure && failure.until > this.now()) return Promise.reject(failure.error);
    const pending = this.pending.get(key);
    if (pending) return pending;
    const request = Promise.resolve().then(read).then(value => {
      if (this.values.size >= 200) this.values.clear();
      this.values.set(key, { until: this.now() + this.ttl, value });
      this.failures.delete(key); return value;
    }, error => {
      if (this.failures.size >= 200) this.failures.clear();
      this.failures.set(key, { until: this.now() + this.cooldown, error }); throw error;
    }).finally(() => { this.pending.delete(key); });
    this.pending.set(key, request); return request;
  }
}
