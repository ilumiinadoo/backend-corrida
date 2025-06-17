import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  loginSocial(user: any) {
    const profileIncomplete =
      !user.nome ||
      !user.idade ||
      !user.foto ||
      !user.nivelExperiencia ||
      !user.estiloCorrida;

    const payload = {
      sub: user._id,
      email: user.email,
      profileIncomplete,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(email: string, senha: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if (!user?.senha) {
      throw new UnauthorizedException('Usuário cadastrado via Google. Faça login com sua conta Google.');
    }

    const senhaCorreta = await bcrypt.compare(senha, user.senha);

    if (!senhaCorreta) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { senha: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}