type EventCallback = (...args: unknown[]) => void;

class EventBusClass {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(...args));
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export const EventBus = new EventBusClass();

// Event types for type safety
export const GameEvents = {
  HEALTH_UPDATE: 'health-update',
  ROUND_END: 'round-end',
  MATCH_END: 'match-end',
  GAME_PAUSE: 'game-pause',
  GAME_RESUME: 'game-resume',
  TIMER_UPDATE: 'timer-update',
  ROUND_START: 'round-start',
  HIT_LANDED: 'hit-landed',
  PLAYER_STATE_CHANGE: 'player-state-change',
} as const;
