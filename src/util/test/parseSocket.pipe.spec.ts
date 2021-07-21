import { BadRequestException } from '@nestjs/common';
import { ParseSocketPipe } from '../parseSocket.pipe';

describe('ParseSocketPipe', () => {
  let parseSocketPipe: ParseSocketPipe;
  const error = (socket: string) => {
    return new BadRequestException(`${socket} is not a valid socket`);
  };

  beforeEach(() => {
    parseSocketPipe = new ParseSocketPipe();
  });

  it('should be defined', () => {
    expect(parseSocketPipe).toBeDefined();
  });

  describe('should fail if fragment is invalid', () => {
    it('should fail if fragment is bigger than 255', () => {
      const socket = '127.0.256.1:5432';
      expect(() => parseSocketPipe.transform(socket)).toThrow(error(socket));
    });
    it('should fail if fragment is missing', () => {
      const socket = '127.0..1:5432';
      expect(() => parseSocketPipe.transform(socket)).toThrow(error(socket));
    });
    it('should fail if fragment is negative', () => {
      const socket = '127.0.-1.1:5432';
      expect(() => parseSocketPipe.transform(socket)).toThrow(error(socket));
    });
  });

  describe('should fail if port is invalid', () => {
    it('should fail if fragment is bigger than 65535', () => {
      const socket = '127.0.0.1:65536';
      expect(() => parseSocketPipe.transform(socket)).toThrow(error(socket));
    });
    it('should fail if port is missing', () => {
      let socket = '127.0.0.1';
      expect(() => parseSocketPipe.transform(socket)).toThrow(error(socket));
      socket = '127.0.0.1:';
      expect(() => parseSocketPipe.transform(socket)).toThrow(error(socket));
    });
    it('should fail if port is negative', () => {
      const socket = '127.0.1.1:-5432';
      expect(() => parseSocketPipe.transform(socket)).toThrow(error(socket));
    });
  });

  it('should return valid sockets', () => {
    const socket = '127.0.1.1:5432';
    expect(parseSocketPipe.transform(socket)).toBe(socket);
  });
});
