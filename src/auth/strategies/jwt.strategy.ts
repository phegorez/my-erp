import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    return request?.cookies?.access_token;
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') as string,
        });
    }

    async validate(payload: any) {
        return { user_id: payload.sub, email: payload.email, role: payload.role }; // Attach to req.user
    }
}