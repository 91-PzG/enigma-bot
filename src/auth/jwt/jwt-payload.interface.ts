export class JwtWrapper {
  accessToken: JwtPayload;
}

export class JwtPayload {
  userId: string;
  username: string;
  roles: string[];
  avatar?: string;
}
