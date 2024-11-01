export enum BadRequestMessage {
  InValidLoginData = " اطلاعات ارسال شده برای ورود صحیح نمی باشد",
  InValidRegisterData = " اطلاعات ارسال شده برای ثبت نام صحیح نمی باشد",
  InvalidCategories = "دسته بندی هارا به درستی وارد کنید",
  SomeThingWrong = "خطایی پیش آمده مجددا تلاش کنید",
  CommentAlreadyAccepted = "نظر انتخاب شده قبلا تایید شده است",
  CommentAlreadyRejected = "نظر انتخاب شده قبلا رد شده است",
}

export enum AuthMessage {
  NotFoundAccount = "حساب کاربری یافت نشد",
  TryAgain = "دوباره تلاش کنید",
  AlreadyExistAccount = "حساب کاربری با این مشخصات از قبل وجود دارد",
  ExpiredCode = "کد تایید منقضی شده است مجددا تلاش کنید",
  LoginAgain = "مجددا وارد حساب کاربری خود شوید",
  LoginIsRequired = "وارد حساب کاربری خود شوید",
  Blocked = "حساب کاربری شما مسدود می باشد است لطفا با پشتیبانی تماس بگیرید",
}

export enum NotFoundMessage {
  NotFound = "موردی یافت نشد ",
  NotFoundCategory = " دسته بندی یافت نشد ",
  NotFoundPost = " مقاله یافت نشد ",
  NotFoundUser = "  کاربر یافت نشد ",
}

export enum ValidationMessage {
  InavlidImageFormat = "فرمت تصاویر انتخاب شده باید از نوع jpg,pngیا jpeg باشد",
  InvalidEmailFormat = "ایمیل وارد شده صحیح نمی باشد",
  InvalidPhoneFormat = "شماره  موبایل وارد شده صحیح نمی باشد",
}
export enum PublicMessage {
  SentOtp = "کد یکبار مصرف با موفقیت ارسال شد",
  LoggedIn = "با موفقیت وارد حساب کاربری خود شدید",
  Created = "با موفقیت ایجاد شد",
  Deleted = "با موفقیت حذف شد",
  Updated = "با موفقیت ویرایش شد",
  Like = " مقاله با موفقیت لایک شد",
  DisLike = "لایک شما از مقاله برداشته شد",
  Bookmark = " مقاله با موفقیت ذخیره شد",
  UnBookmark = "مقاله از لیست مقالات ذخیره شده برداشته شد",
  CreatedComment = " نظر شما با موفقیت ثبت شد ",
  Followed = " کاربر مورد نظر دنبال شد",
  UnFollow = "از لیست دنبال شوندگان حذف شد",
  Blocked = "حساب کاربری با موفقیت مسدود شد",
  UnBlocked = "حساب کاربری رفع مسدودیت شد",
}

export enum ConflictMessage {
  CategoryTitle = " عنوان دسته بندی قبلا ثبت شده است ",
  InValidRegisterData = " اطلاعات ارسال شده برای ثبت نام صحیح نمی باشد",
  Email = "ایمیل توسط شخص دیگری استفاده شده",
  Phone = "شماره تلفن توسط شخص دیگری استفاده شده",
  Username = " نام کاربری توسط شخص دیگری استفاده شده",
}
