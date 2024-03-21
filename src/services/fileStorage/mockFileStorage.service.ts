import { FileStorage } from ".";

export class MockFileStorage implements FileStorage {
  storeFile = async (fileBuffer: Buffer, fileId: string): Promise<string> => {
    return `https://mockstorage.com/${fileId}`;
  };

  getFileId = async (filePath: string): Promise<string> => {
    return "mockId";
  };

  deleteFile = async (fileName: string): Promise<void> => {
    return;
  };
};