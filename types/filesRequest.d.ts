  import { File } from "multer";
  import { Request } from "express";

  export interface FilesRequest extends Request {
    files: {
      [fieldname: string]: File;
    };
  }