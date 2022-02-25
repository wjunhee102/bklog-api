import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  public canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const requsetToken = request.headers.authorization.replace("Bearer ", "");

    if (requsetToken === undefined) {
      return;
    }
    
    // const decodedToken = this.validateToken(requsetToken);
    // if (decodedToken) {
    //   request.user = decodedToken;
    //   return true;
    // } else {
    //   return false;
    // }
  }
}