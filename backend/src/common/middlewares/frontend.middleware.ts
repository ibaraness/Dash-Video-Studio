import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response } from "express";

@Injectable()
export class FrontendMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: (error?: any) => void) {
        // const pattern = /^\/?(sign-up|login)+(\/.*)?.*/gm;
        // if(pattern.test(req.path)){
        //     req.url = "/";
        // }
        console.log("path", req.path);
        next();
    }
}