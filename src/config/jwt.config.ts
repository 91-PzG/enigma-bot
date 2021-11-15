import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  ignoreExpiration: process.env.IGNORE_EXPIRATION,
  debugMode: process.env.DEBUG_MODE,
}));
