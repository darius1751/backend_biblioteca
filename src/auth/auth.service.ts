import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from 'process';

@Injectable()
export class AuthService {

    constructor(private jwtService: JwtService) {}
    
    
    generateToken(roleId: string): string {
        return this.jwtService.sign({ id: roleId }, { secret: env.SECRET });
    }

    validateToken(token: string):Boolean {
        return this.jwtService.verify<Boolean>(token, { secret: env.SECRET });
    }
}
