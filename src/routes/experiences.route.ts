import { Router } from "express";
import { isAuthenticated, createAuthorizationMiddleware, checkBanStatus } from "../middleware/authChecks";
import multer from "multer";
import { MongoDBConfigurationService } from "../services/configuration.service";
import { MockFileStorage, FileStorage } from "../services/fileStorage.service";
import { MockFileUploader } from "../services/fileUploader.service";
import { MockVirusScanner } from "../services/virusScanner.service";
import { MockImageScaler } from "../services/imageScaler.service";
import {
  SharpImageScalerFactory,
  VirusTotalScannerFactory,
  ImgurStorageFactory,
  ImageUploaderFactory,
  S3StorageFactory
} from "../services/serviceFactory.service";
import { ExperienceController} from "../controllers/experiences.controller";
import ExperienceModel from "../models/experience.model";

const setupRouter = async () => {
  const router = Router();
  const upload = multer({ dest: "/tmp", limits: { fieldSize: 10 * 1024 * 1024 } });
  const isAuthorized = createAuthorizationMiddleware(ExperienceModel, (user, document) => {
    return user._id.equals(document.creatorId) || user.isModerator || user.isAdmin;
  });
  const testing = process.env.NODE_ENV === "test";
  let imgStorage: FileStorage;
  
  if (process.env.IMGUR_CLIENT_ID && process.env.IMGUR_CLIENT_SECRET) {
    imgStorage = await new ImgurStorageFactory().create(new MongoDBConfigurationService());
  } else if (process.env.AWS_REGION && process.env.AWS_S3_BUCKET_NAME) {
    imgStorage = await new S3StorageFactory().create(
      process.env.AWS_S3_BUCKET_NAME,
      process.env.AWS_REGION
    );
  } else {
    imgStorage = new MockFileStorage();
  }

  const virusScanner = (testing || process.env.BYPASS_IMAGE_VIRUS_SCAN) ? new MockVirusScanner() : await new VirusTotalScannerFactory().create();
  const imageScaler = (testing || process.env.BYPASS_IMAGE_SCALING) ? new MockImageScaler() : await new SharpImageScalerFactory().create();
  const imgUploader = testing ? new MockFileUploader() : await new ImageUploaderFactory().create(
    virusScanner,
    imageScaler,
    imgStorage,
    10000
  );
  const experienceController = new ExperienceController(imgUploader, imgStorage);

  router.post(
    "/",
    isAuthenticated,
    checkBanStatus,
    upload.fields([{ name: "foodPhoto", maxCount: 1 }, { name: "personPhoto", maxCount: 1 }]),
    experienceController.create
  );
  router.get("/", experienceController.read)
  router.get("/:documentId", experienceController.readById);
  router.patch("/:documentId", isAuthorized, upload.fields([{ name: "foodPhoto", maxCount: 1 }, { name: "personPhoto", maxCount: 1 }]), experienceController.update);
  router.delete("/:documentId", isAuthorized, experienceController.delete);

  return router;
};

export default setupRouter;  
