import {
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Enrolment } from '../typeorm/entities';
import { CreateSquadDto, DeleteSquadDto, MoveSoldierDto, RenameSquadDto } from './dto/socket.dto';
import { EnrolmentsService } from './enrolments.service';

@WebSocketGateway({ cors: true })
export class EnrolmentsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  constructor(private service: EnrolmentsService) {}

  handleConnection(client: any, ...args: any[]) {
    const eventId: string = client.handshake.query.eventId;
    client.join(eventId);
  }

  @SubscribeMessage('create-squad')
  async createSquad(client: Socket, data: CreateSquadDto) {
    const squad = await this.service.createSquad(
      data,
      parseInt(client.handshake.query.eventId as string, 10),
    );
    this.server.to(squad.eventId.toString()).emit('create-squad', {
      id: squad.id,
      name: squad.name,
      position: squad.position,
    });
  }

  @SubscribeMessage('delete-squad')
  async deleteSquad(client: Socket, data: DeleteSquadDto) {
    await this.service.deleteSquad(data.id);
    this.server.to(client.handshake.query.eventId).emit('delete-squad', data);
  }

  @SubscribeMessage('rename-squad')
  async renameSquad(client: Socket, data: RenameSquadDto) {
    await this.service.renameSquad(data);
    this.server.to(client.handshake.query.eventId).emit('rename-squad', data);
  }

  @SubscribeMessage('move-soldier')
  async moveSoldier(client: Socket, data: MoveSoldierDto) {
    await this.service.moveSoldier(data.oldSoldier, data.newSoldier);
    this.server.to(client.handshake.query.eventId).emit('move-soldier', data);
  }

  @SubscribeMessage('set-attendance')
  async setAttendance(client: Socket, data: Enrolment) {
    await this.service.setAttendance(data);
    data.isPresent = !data.isPresent;
    this.server.to(client.handshake.query.eventId).emit('set-attendance', data);
  }
}
