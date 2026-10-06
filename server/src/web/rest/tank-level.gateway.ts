import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

// No sensor source is integrated. Never generate operational measurements.
@WebSocketGateway({ namespace: '/tank' })
export class TankLevelGateway implements OnGatewayConnection {
  handleConnection(client: Socket): void {
    client.emit('tank-status', {
      status: 'unavailable', source: null, quality: 'unverified',
      level: null, measuredAt: null,
    });
  }
}
