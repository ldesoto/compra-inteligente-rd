import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly adminEmails = ['luismanuelj27@gmail.com', 'ldesotoflota@gmail.com'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Solo permitimos el acceso a los usuarios especificados como admin
    if (user && user.email) {
      const userEmail = user.email.toLowerCase().trim();
      if (this.adminEmails.includes(userEmail)) {
        return true;
      }
    }
    
    throw new ForbiddenException('Acceso denegado: Se requieren privilegios de administrador.');
  }
}
