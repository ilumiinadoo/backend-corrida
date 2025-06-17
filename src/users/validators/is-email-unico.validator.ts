import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailUnicoConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UserService) {}

  async validate(email: string): Promise<boolean> {
    const existente = await this.userService.findByEmail(email);
    return !existente;
  }

  defaultMessage(args: ValidationArguments) {
    return 'E-mail já está em uso';
  }
}

export function IsEmailUnico(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsEmailUnicoConstraint,
    });
  };
}
