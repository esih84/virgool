import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export function FilterBlog() {
  //* applyDecorators for create custom decorator
  return applyDecorators(
    ApiQuery({ name: "category", required: false }),
    ApiQuery({ name: "search", required: false })
  );
}
