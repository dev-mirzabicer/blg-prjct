import { Router } from "express";
import { validate } from "../middlewares";
import auth from "../middlewares/auth.middleware";
import { userValidation } from "../validations";
import { userControllers } from "../controllers";
import { ApiRouter } from "../interfaces";
import { UserRole } from "../constants";

const router = Router();

router.get("/", validate(userValidation.getMany), userControllers.getMany);

router
    .route("/:id")
    .get(validate(userValidation.getOne), userControllers.getOne)
    .patch(
        auth(UserRole.ADMIN),
        validate(userValidation.more?.changeRole),
        userControllers.changeRole
    )
    .delete(
        auth(UserRole.ADMIN),
        validate(userValidation.deleteOne),
        userControllers.deleteOne
    );

router
    .route("/me")
    .get(auth(), validate(userValidation.more?.getMe), userControllers.getMe)
    .patch(
        auth(),
        validate(userValidation.more?.patchMe),
        userControllers.patchMe
    )
    .delete(
        auth(),
        validate(userValidation.more?.deleteMe),
        userControllers.deleteMe
    );

const userRoutes: ApiRouter = { path: "user", router };

export default userRoutes;
