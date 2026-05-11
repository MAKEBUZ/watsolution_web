import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

export interface TankLevelEvent {
  level: number;
  alert: boolean;
  timestamp: string;
}

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/tank' })
export class TankLevelGateway implements OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger('TankLevelGateway');
  private intervalHandle: ReturnType<typeof setTimeout> | null = null;
  private currentLevel = 75;

  onModuleInit(): void {
    this.scheduleNext();
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) clearTimeout(this.intervalHandle);
  }

  private scheduleNext(): void {
    // random interval 3-5 seconds
    const delay = 3000 + Math.random() * 2000;
    this.intervalHandle = setTimeout(() => {
      this.emitLevel();
      this.scheduleNext();
    }, delay);
  }

  private emitLevel(): void {
    // Drift ±3% each tick, clamp to [20, 100]
    const delta = (Math.random() - 0.5) * 6;
    this.currentLevel = Math.min(100, Math.max(20, this.currentLevel + delta));
    const level = parseFloat(this.currentLevel.toFixed(1));
    const payload: TankLevelEvent = {
      level,
      alert: level < 65,
      timestamp: new Date().toISOString(),
    };
    this.server.emit('tank-level', payload);
    if (payload.alert) {
      this.logger.warn(`Tank level LOW: ${level}%`);
    }
  }
}
