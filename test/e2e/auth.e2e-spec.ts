import jwt_decode from 'jwt-decode';
import { AuthCredentialsDto } from '../../src/auth/dtos/auth-credentials.dto';
import { ChangePasswordDto } from '../../src/auth/dtos/change-password.dto';
import { JwtPayload } from '../../src/auth/jwt/jwt-payload.interface';
import request from './request';

describe('AuthController (e2e)', () => {
  describe('log In', () => {
    it('should throw a 401 if user is not found', async () => {
      const data: AuthCredentialsDto = {
        username: 'Zero',
        password: 'Test123as',
      };
      await request.post('/auth/signin').send(data).expect(401);
    });
    it('should throw a 401 if password is wrong', async () => {
      const data: AuthCredentialsDto = {
        username: 'One',
        password: 'Test123as',
      };
      await request.post('/auth/signin').send(data).expect(401);
    });
    it('should throw a 401 if member is honorary member', async () => {
      const data: AuthCredentialsDto = {
        username: 'Five',
        password: 'Test123',
      };
      await request.post('/auth/signin').send(data).expect(401);
    });
    it('should throw a 401 if member isnt a member anymore', async () => {
      const data: AuthCredentialsDto = {
        username: 'Four',
        password: 'Test123',
      };
      await request.post('/auth/signin').send(data).expect(401);
    });
    it('should throw a 403 if user has to change password', async () => {
      const data: AuthCredentialsDto = {
        username: 'Two',
        password: 'Test123',
      };
      return await request.post('/auth/signin').send(data).expect(403);
    });
    it("should throw a 409 if user hasn't registered yet", async () => {
      const data: AuthCredentialsDto = {
        username: 'Three',
        password: 'Test123as',
      };
      return await request.post('/auth/signin').send(data).expect(409);
    });
    it('should return jwt token', async () => {
      const data: AuthCredentialsDto = {
        username: 'One',
        password: 'Test123',
      };
      const { body } = await request
        .post('/auth/signin')
        .send(data)
        .expect(201);

      const jwtData: JwtPayload = jwt_decode(body.accessToken);

      expect(jwtData).toMatchObject({
        userId: '1',
        username: 'One',
        roles: ['member', 'eventorga'],
      });
    });
  });
  describe('change Password', () => {
    it('should throw a 401 if credentials are wrong', async () => {
      const data: ChangePasswordDto = {
        username: 'One',
        oldPassword: 'Test123as',
        newPassword: 'Pa$$w0rd',
      };
      return await request.post('/auth/password').send(data).expect(401);
    });
    it('should return 201 if credentials are correct', async () => {
      const data: ChangePasswordDto = {
        username: 'Two',
        oldPassword: 'Test123',
        newPassword: 'Pa$$w0rd',
      };
      const { body } = await request
        .post('/auth/password')
        .send(data)
        .expect(201);

      const jwtData: JwtPayload = jwt_decode(body.accessToken);

      expect(jwtData).toMatchObject({
        userId: '2',
        username: 'Two',
        roles: ['member'],
      });
    });
    it('password should have been updated', async () => {
      const data: AuthCredentialsDto = {
        username: 'Two',
        password: 'Pa$$w0rd',
      };
      return await request.post('/auth/signin').send(data).expect(201);
    });
  });
});
