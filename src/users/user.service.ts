import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async findManyByIds(ids: string[]) {
    return this.userModel.find({ _id: { $in: ids } }).select('nome foto');
  }

  async create(userData: Partial<User>): Promise<User> {
    const existing = await this.findByEmail(userData.email || '');
    if (existing) throw new Error('E-mail já está em uso');

    if (!userData.email) {
      throw new Error('E-mail é obrigatório');
    }

    let senhaCriptografada: string | undefined = undefined;
    if (userData.senha) {
      senhaCriptografada = await bcrypt.hash(userData.senha, 10);
    }

    const newUser = new this.userModel({
      ...userData,
      senha: senhaCriptografada,
      criadoEm: new Date(),
    });

    return newUser.save();
  }

  async createSocialUser(data: Partial<User>): Promise<User> {
    return this.userModel.create(data);
  }

  async updateUser(userId: string, body: Partial<UpdateProfileDto>) {
    return this.userModel.findByIdAndUpdate(userId, body, {
      new: true,
      runValidators: true,
    });
  }

  async findById(id: string) {
  return this.userModel.findById(id).select('-senha') // Remove a senha da resposta
  }
  
}
