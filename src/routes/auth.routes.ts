import { Router } from "express";
import { validate } from "../middlewares";
import auth from "../middlewares/auth.middleware";
import { authValidation } from "../validations";
import { authControllers } from "../controllers";
import { ApiRouter } from "../interfaces";

const router = Router();

router.post(
    "/register",
    validate(authValidation.register),
    authControllers.register
);

router.post("/login", validate(authValidation.login), authControllers.login);

router.post("/logout", validate(authValidation.logout), authControllers.logout);

router.post(
    "/refresh-tokens",
    validate(authValidation.refreshTokens),
    authControllers.refreshTokens
);

router.post(
    "/forgot-password",
    validate(authValidation.sendForgotPassword),
    authControllers.sendForgotPassword
);

router.post(
    "/reset-password",
    validate(authValidation.resetPassword),
    authControllers.resetPassword
);

router.post(
    "/send-verification-email",
    auth(),
    authControllers.sendVerificationEmail
);

router.post(
    "/verify-email",
    validate(authValidation.verifyEmail),
    authControllers.verifyEmail
);

const authRoutes: ApiRouter = { path: "auth", router };

export default authRoutes;
