import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { TripService } from './trip.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for prototype
  },
  namespace: '/v1/trips/tracking',
})
export class TripGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TripGateway.name);

  constructor(private readonly tripService: TripService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTrip')
  handleJoinTrip(
    @MessageBody() data: { tripId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `trip_${data.tripId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'joined', data: room };
  }

  @SubscribeMessage('pingLocation')
  async handlePingLocation(
    @MessageBody()
    data: {
      tripId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
    },
  ) {
    try {
      // Save the ping to the database using existing service method
      const savedPing = await this.tripService.addLocationPing({
        tripId: data.tripId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
      });

      const room = `trip_${data.tripId}`;
      // Broadcast the saved ping to all clients in the trip room
      this.server.to(room).emit('locationUpdate', savedPing);

      return { event: 'pingSaved', data: savedPing };
    } catch (error) {
      this.logger.error(
        `Failed to handle pingLocation for trip ${data.tripId}`,
        error,
      );
      return { event: 'error', data: error.message };
    }
  }
}
