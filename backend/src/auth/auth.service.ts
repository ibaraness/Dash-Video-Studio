import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';
import { jwtConstants } from './constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) { }

    async signIn(
        res: Response,
        username: string,
        pass: string,
    ): Promise<{ access_token: string }> {
        const user = await this.usersService.findOne(username);

        // Check if user not exist
        if (!user) {
            throw new UnauthorizedException("Username do not exist!");
        }

        // Check if password match
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Username or password not match');
        }

        // Handle refresh token
        await this.createRefreshTokenCookie(res, user.id);

        return {
            access_token: await this.createAccessToken(user.id, user.username)//this.jwtService.signAsync(payload),
        };
    }

    async signup(res: Response, username: string, email: string, password: string) {
        try {
            // Check if user already exist
            const isUser = await this.usersService.findOne(username);
            if (isUser) {
                throw new HttpException('User with that username already exist!', 500);
            }

            const isEmail = await this.usersService.isEmailExist(email);
            if (isEmail) {
                throw new HttpException('User with that Email address already exist!', 500);
            }

            const saltOrRounds = 10;
            const hashPassword = await bcrypt.hash(password, saltOrRounds);
            const { id } = await this.usersService.createUser(username, email, hashPassword);

            // Handle refresh token
            await this.createRefreshTokenCookie(res, id);

            return {
                access_token: await this.createAccessToken(id, username)//this.jwtService.signAsync(payload),
            };

        } catch (err) {
            throw new HttpException(err?.message || 'Something went wrong!', 500);
        }
    }

    async rotateToken(res: Response, req: Request) {
        try {
            const oldRefreshToken = req.cookies['refreshToken'];

            // Validate old refresh token, if invalid, throw an error.
            const payload = await this.jwtService.verifyAsync(
                oldRefreshToken,
                {
                    secret: jwtConstants.secret
                }
            );

            const user = await this.usersService.findById(payload.id);
            if (!user) {
                throw new UnauthorizedException();
            }

            const newAccessToken = await this.createAccessToken(payload.id, user.username);
            await this.createRefreshTokenCookie(res, payload.id);

            return {
                access_token: newAccessToken,
            };
        } catch (err) {
            throw new UnauthorizedException();
        }
    }

    async createRefreshTokenCookie(res: Response, userId: string) {
        const newRefreshToken = await this.createRefreshToken(userId);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,//true,
            secure: true, //true,
            sameSite: 'strict'//'strict'
        });
    }

    async createAccessToken(userId: string, username: string) {
        return this.jwtService.signAsync({ sub: userId, username }, { expiresIn: '15m' });
    }

    async createRefreshToken(userId: string) {
        const tokenId = uuidv4();
        return this.jwtService.signAsync({ id: userId, tokenId: tokenId }, { expiresIn: '7d' });
    }
}