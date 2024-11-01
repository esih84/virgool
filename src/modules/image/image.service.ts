import {
  Inject,
  Injectable,
  NotAcceptableException,
  Scope,
} from "@nestjs/common";
import { ImageDto } from "./dto/image.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageEntity } from "./entities/image.entity";
import { Repository } from "typeorm";
import { multerFile } from "src/common/utils/multer.util";
import { Request } from "express";
import { REQUEST } from "@nestjs/core";
import { NotFoundMessage, PublicMessage } from "src/common/enums/message.enum";

@Injectable({ scope: Scope.REQUEST })
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity)
    private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private request: Request
  ) {}
  async create(imageDto: ImageDto, image: multerFile) {
    const userId = this.request.user.id;
    const { alt, name } = imageDto;
    const location = image.path?.slice(7);
    await this.imageRepository.insert({
      alt: alt || name,
      name,
      location,
      userId,
    });
    return {
      message: PublicMessage.Created,
    };
  }

  findAll() {
    const userId = this.request.user.id;

    return this.imageRepository.find({
      where: { userId },
      order: { id: "DESC" },
    });
  }

  async findOne(id: number) {
    const userId = this.request.user.id;

    const image = await this.imageRepository.findOne({
      where: { userId, id },
      order: { id: "DESC" },
    });
    if (!image) throw new NotAcceptableException(NotFoundMessage.NotFound);
    return image;
  }

  async remove(id: number) {
    const image = await this.findOne(id);
    await this.imageRepository.remove(image);
    return {
      message: PublicMessage.Deleted,
    };
  }
}
