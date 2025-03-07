const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes instead of 5

export const menuCache = {
  data: null,
  timestamp: null,
  
  isValid() {
    return this.data && (Date.now() - this.timestamp) < CACHE_DURATION;
  },
  
  set(data) {
    this.data = data;
    this.timestamp = Date.now();
  },
  
  get() {
    return this.isValid() ? this.data : null;
  }
}; 