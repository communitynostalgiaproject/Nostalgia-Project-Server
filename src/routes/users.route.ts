import { Router } from "express";
import { createAuthorizationMiddleware, isModerator, isAuthenticated } from "../middleware/authChecks";
import { UserController } from "../controllers/users.controller";
import UserModel from "../models/user.model";

const router = Router();
const isUser = createAuthorizationMiddleware(UserModel, (user, document) => {
  return user._id.equals(document._id);
});
const userController = new UserController();

router.get("/", isModerator, userController.read);
router.get("/fetchData", isAuthenticated, userController.fetchUserData);
router.get("/:documentId", isModerator, userController.readById);
router.delete("/:documentId", isUser, userController.delete);

export default router;