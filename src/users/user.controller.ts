import { 
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Put,
  Get,
  Param } from '@nestjs/common'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';


@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('register')
  async register(@Body() body) {
    return this.userService.create(body);
  }

  @Post('multiple')
  async getMultipleUsers(@Body('ids') ids: string[]) {
    return this.userService.findManyByIds(ids);
  }

  /*Função referente a upload de foto que está temporariamente desabilitada
  @Post('upload-foto')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/fotos',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
      fileFilter: (req: Request, file: Express.Multer.File, cb: (error: Error | null, acceptFile: boolean) => void) => {
        const allowedTypes = /jpeg|jpg|png/;
        const isValid = allowedTypes.test(extname(file.originalname).toLowerCase());

        if (isValid) {
          cb(null, true);
        } else {
          cb(new Error('Apenas imagens JPEG e PNG são permitidas.'), false);
        }
      },
    })
  )
  uploadFoto(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Arquivo inválido. Envie uma imagem .jpg, .jpeg ou .png de até 2MB.');
    }

    return { url: `http://localhost:3000/uploads/fotos/${file.filename}` };
  }*/

  @UseGuards(JwtAuthGuard)
  @Put('update')
  async updateProfile(@Request() req, @Body() body) {
    const userId = req.user.userId
    return this.userService.updateUser(userId, body)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const userId = req.user.userId
    return this.userService.findById(userId)
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }
  
}

