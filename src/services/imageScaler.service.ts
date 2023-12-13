import sharp from "sharp";

export interface ImageScaler {
  scaleImage(fileBuffer: Buffer, maxWidth: number): Promise<Buffer>;
}

export class SharpImageScaler implements ImageScaler {
  scaleImage = async (fileBuffer: Buffer, maxWidth: number): Promise<Buffer> => {
    try {
      const scaledImage = await sharp(fileBuffer)
        .resize(maxWidth)
        .toBuffer();

      return scaledImage;
    } catch (error) {
      console.error('Error scaling image:', error);
      throw new Error('Image scaling failed');
    }
  }
}