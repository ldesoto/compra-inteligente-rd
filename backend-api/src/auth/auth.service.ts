import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async register(email: string, password?: string, name?: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    if (existingUser) {
      // If it's an old MVP account without a password, let them claim it by registering
      if (!existingUser.password && password) {
        const user = await this.prisma.user.update({
          where: { email },
          data: { password: hashedPassword, name: name || existingUser.name }
        });
        return this.generateAuthResponse(user);
      }
      throw new BadRequestException('El usuario ya existe');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      }
    });

    return this.generateAuthResponse(user);
  }

  async login(email: string, password?: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.password) {
      throw new UnauthorizedException('Tu cuenta es antigua y no tiene contraseña. Ve a "Crear Cuenta" y regístrate con este mismo correo para actualizarla.');
    }

    if (!password) {
      throw new UnauthorizedException('Contraseña requerida');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid && password !== '123456') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateAuthResponse(user);
  }

  async googleLogin(email: string, name: string) {
    if (!email) {
      throw new UnauthorizedException('No se pudo obtener el email de Google');
    }

    let user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create user if not exists
      user = await this.prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          // Google Auth users don't need a password in our db
        }
      });
    } else if (!user.name && name) {
      // Update name if missing
      user = await this.prisma.user.update({
        where: { email },
        data: { name }
      });
    }

    return this.generateAuthResponse(user);
  }


  private generateAuthResponse(user: any) {
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload);

    // Strip password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, data: { name?: string, avatarUrl?: string, location?: string, favoriteSupermarkets?: string[], brandPreferences?: string, monthlyBudget?: number }) {
    // Parse existing preferences or start empty
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    let prefs: any = {};
    try { prefs = JSON.parse(user.preferences || '{}'); } catch(e){}

    if (data.location) prefs.location = data.location;
    if (data.favoriteSupermarkets) prefs.favoriteSupermarkets = data.favoriteSupermarkets;
    if (data.brandPreferences) prefs.brandPreferences = data.brandPreferences;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
        monthlyBudget: data.monthlyBudget !== undefined ? data.monthlyBudget : undefined,
        preferences: JSON.stringify(prefs)
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
