export interface FileM extends Express.Multer.File {
  url: string;
  ext: string;
  name: string;
  fileType: string;
}

export interface FileWithName extends Express.Multer.File {
  name: string;
}
