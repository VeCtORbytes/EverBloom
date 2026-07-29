export interface EngineEventMap {
  threadStart: { point: [number, number]; mode: string };
  threadMove: { point: [number, number]; velocity: number };
  threadEnd: { pointsCount: number };
  sigilCast: { sigilId: string; score: number };
  sigilFailed: { sigilId?: string; attempts: number };
  interactableActivated: { id: string };
  memoryCollected: { memoryId: string };
  secretFound: { secretId: string; worldId: string };
  worldEntered: { worldId: string };
  worldCompleted: { worldId: string };
  sigilAcquired: { sigilId: string };
  lanternChosen: { lanternId: string };
  hintEscalated: { level: number; targetId: string };
  beatFired: { beatId: string };
  transitionStarted: { from: string; to: string };
  transitionFinished: { from: string; to: string };
  qualityChanged: { from: string; to: string };
  saveWritten: { timestamp: string };
}

export type EngineEventKey = keyof EngineEventMap;
export type EventListener<K extends EngineEventKey> = (payload: EngineEventMap[K]) => void;

type ListenerStore = {
  [K in EngineEventKey]?: Set<EventListener<K>>;
};

export class TypedEventBus {
  private listeners: ListenerStore = {};

  public on<K extends EngineEventKey>(event: K, listener: EventListener<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set() as Set<EventListener<K>> as unknown as ListenerStore[K];
    }
    const set = this.listeners[event] as Set<EventListener<K>>;
    set.add(listener);

    return () => this.off(event, listener);
  }

  public off<K extends EngineEventKey>(event: K, listener: EventListener<K>): void {
    const set = this.listeners[event] as Set<EventListener<K>> | undefined;
    if (set) {
      set.delete(listener);
    }
  }

  public emit<K extends EngineEventKey>(event: K, payload: EngineEventMap[K]): void {
    const set = this.listeners[event] as Set<EventListener<K>> | undefined;
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in EventBus listener for event "${event}":`, error);
        }
      });
    }
  }

  public clear(): void {
    this.listeners = {};
  }
}

export const globalEventBus = new TypedEventBus();
