import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        '58c0cc0e0cb3319da1e95094873eec724907ccc54b337099aa7ef60ff7f2fe1f',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    // Đảm bảo userId là số
    const userId = typeof payload.sub === 'number' ? payload.sub : parseInt(payload.sub, 10);
    
    if (isNaN(userId)) {
      console.error('Invalid userId in token payload:', payload.sub);
      throw new Error('Invalid userId in token');
    }

    console.log('JWT Strategy - Validated userId:', userId);

    // Trả về thông tin user từ JWT payload
    return {
      userId,
      email: payload.email,
      roles: payload.roles
    };
  }
}
