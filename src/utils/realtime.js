// src/utils/realtime.js
class RealtimeSystem {
  constructor() {
    this.subscribers = [];
    this.events = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  broadcast(event) {
    const newEvent = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      ...event
    };
    this.events = [newEvent, ...this.events].slice(0, 50);
    this.subscribers.forEach(callback => callback(newEvent));
    
    // Also save to shared storage if available
    if (window.storage) {
        window.storage.setItem('wakkany_last_event', JSON.stringify(newEvent), { shared: true });
    }
  }

  getEvents() {
    return this.events;
  }
}

export const realtime = new RealtimeSystem();
