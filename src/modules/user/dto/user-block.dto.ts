import { ApiProperty } from "@nestjs/swagger";

export class UserBlockDto {
  @ApiProperty()
  userId: number;
}
