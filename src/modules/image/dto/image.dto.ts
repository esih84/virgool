import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ImageDto {
  @ApiProperty({ format: "binary" })
  image: string;
  @ApiPropertyOptional()
  alt: string;
  @ApiProperty()
  name: string;
}
