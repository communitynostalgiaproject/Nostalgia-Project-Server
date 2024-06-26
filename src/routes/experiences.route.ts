import { Router } from "express";
import { isAuthenticated, createAuthorizationMiddleware, checkBanStatus } from "../middleware/authChecks";
import multer from "multer";
import { MongoDBConfigurationService } from "../services/configuration.service";
import { FileStorage } from "../services/fileStorage";
import { MockFileUploader } from "../services/fileUploader.service";
import { MockVirusScanner } from "../services/virusScanner.service";
import { MockImageScaler } from "../services/imageScaler.service";
import {
  LocalStorageFactory,
  SharpImageScalerFactory,
  VirusTotalScannerFactory,
  ImgurStorageFactory,
  ImageUploaderFactory,
  S3StorageFactory
} from "../services/serviceFactory.service";
import { ExperienceController} from "../controllers/experiences.controller";
import ExperienceModel from "../models/experience.model";
import path from "path";

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
    imgStorage = await new LocalStorageFactory().create(
      path.resolve(__dirname, "../../uploads"),
      "http://localhost:5000/files"
    );
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
    experienceController.create
  );
  router.post("/images", isAuthenticated, checkBanStatus, upload.single("image"), experienceController.uploadPhoto);
  router.post("/images/update", isAuthenticated, checkBanStatus, upload.single("image"), experienceController.updatePhoto)
  router.get("/", experienceController.read)
  router.get("/:documentId", experienceController.readById);
  router.patch("/:documentId", isAuthorized, experienceController.update);
  router.delete("/:documentId", isAuthorized, experienceController.delete);

  return router;
};

export default setupRouter;  
