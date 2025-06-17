import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI')!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const { name, emails, photos, id } = profile;
    const email = emails?.[0]?.value;

    let user = await this.userService.findByEmail(email);

    if (!user) {
      user = await this.userService.createSocialUser({
        email,
        nome: name?.givenName,
        foto: photos?.[0]?.value,
        googleId: id,
      });
    }

    done(null, user);
  }
}
