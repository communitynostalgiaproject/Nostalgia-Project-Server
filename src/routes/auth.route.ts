import express from "express";
import passport from "passport";

const router = express.Router();

if (process.env.NODE_ENV === "test") {
  router.get(
    "/mock",
    passport.authenticate("mock"),
    (req, res) => {
      res.send({
        success: true,
        user: {...req.user}
      });
    }
  );
}

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    res.status(200).send("Login successful");
    // res.redirect(`${process.env.FRONTEND_URI}`);
  }
);

export default router;