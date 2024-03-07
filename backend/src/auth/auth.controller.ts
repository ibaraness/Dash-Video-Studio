import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Request,
    Res
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, SignUpDTO } from './auth.model';
import { Response, Request as ExpressReq } from 'express';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('login')
    async signIn(@Res({ passthrough: true }) res: Response, @Body() { username, password }: LoginDTO) {
        return await this.authService.signIn(res, username, password);
    }

    @Public()
    @Post('refresh')
    async refresh(@Res({ passthrough: true }) res: Response, @Req() req: ExpressReq) {
        return await this.authService.rotateToken(res, req);
    }

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('signup')
    async signUp(@Res({ passthrough: true }) res: Response, @Body() { username, email, password }: SignUpDTO) {
        return await this.authService.signup(res, username, email, password);
    }

    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @Post('signout')
    async signOut(@Res({ passthrough: true }) res: Response){
        res.clearCookie('refreshToken')
        return {"message":"successfully signed out!"}
    }
}
