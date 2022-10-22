import { Router } from "express";
import { validate } from "../middlewares";
import auth from "../middlewares/auth.middleware";
import { authorValidation } from "../validations";
import { authorControllers } from "../controllers";
import { ApiRouter } from "../interfaces";
import { UserRole } from "../constants";

const router = Router();

router
    .route("/:id")
    .patch(
        auth(UserRole.ADMIN),
        validate(authorValidation.patch),
        authorControllers.patch
    );

router
    .route("/me")
    .patch(
        auth(UserRole.AUTHOR),
        validate(authorValidation.more?.patchMe),
        authorControllers.patchMe
    )
    .get(
        auth(UserRole.AUTHOR),
        validate(authorValidation.more?.getMe),
        authorControllers.getMe
    );

const authorRoutes: ApiRouter = { path: "author", router };

export default authorRoutes;
