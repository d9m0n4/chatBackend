export interface FileM extends Express.Multer.File {
  url: string;
  ext: string;
  name: string;
}
