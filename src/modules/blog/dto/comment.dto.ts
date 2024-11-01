import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumberString, IsOptional, Length } from "class-validator";

export class CreateCommentDto {
  @ApiProperty()
  @Length(3, 300)
  text: string;
  @ApiProperty()
  @IsNumberString()
  blogId: number;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  parentId: number;
}
