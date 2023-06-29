import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy} from "passport";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){}