import { Router } from "express";
import { createAuthorizationMiddleware, isModerator, isAuthenticated } from "../middleware/authChecks";
import UserModel from "../models/user.model";
import UserController from "../controllers/users.controller";

const router = Router();
const isUser = createAuthorizationMiddleware(UserModel, (user, document) => {
  return user._id.equals(document._id);
});

router.get("/", isModerator, UserController.read);
router.get("/fetchData", isAuthenticated, UserController.fetchUserData);
router.get("/:documentId", isModerator, UserController.readById);
router.delete("/:documentId", isUser, UserController.delete);

export default router;