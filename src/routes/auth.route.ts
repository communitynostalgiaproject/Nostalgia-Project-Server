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
    if (process.env.REDIRECT_URI){
      res.redirect(`${process.env.REDIRECT_URI}`);
    } else {
      res.status(200).send("Login successful");
    }  
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