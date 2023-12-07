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
        user: req.user
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

router.get(
  "/logout",
  (req, res) => {
    req.logout((err: any) => {
      if (err) {
        console.error(`Logout failed: ${err}`);
        res.status(500).send("Unable to log out");
      } else {
        res.status(200).send("Logout successful");
      }
    });
  }
)

export default router;