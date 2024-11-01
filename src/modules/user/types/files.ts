import { multerFile } from "src/common/utils/multer.util";

export type ProfileImage = {
  image_profile: multerFile[];
  bg_image: multerFile[];
};
