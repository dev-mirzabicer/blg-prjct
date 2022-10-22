import { UserRole } from "../constants";
import { Router } from "express";
import { validate } from "../middlewares";
import auth from "../middlewares/auth.middleware";
import { postValidation } from "../validations";
import { postControllers } from "../controllers";
import { ApiRouter } from "../interfaces";

const router = Router();

router
    .route("/")
    .get(validate(postValidation.getMany), postControllers.getMany)
    .post(
        auth(UserRole.AUTHOR),
        validate(postValidation.post),
        postControllers.post
    );
router
    .route("/:id")
    .get(validate(postValidation.getOne), postControllers.getOne)
    .patch(
        auth(UserRole.AUTHOR),
        validate(postValidation.patch),
        postControllers.patch
    )
    .delete(
        auth(UserRole.AUTHOR),
        validate(postValidation.patch),
        postControllers.patch
    );
router
    .route("/:id/likes")
    .get(validate(postValidation.more?.getLikes), postControllers.getLikes)
    .post(auth(), validate(postValidation.more?.like), postControllers.like)
    .delete(
        auth(),
        validate(postValidation.more?.unlike),
        postControllers.unlike
    );
router
    .route("/:id/saves")
    .get(validate(postValidation.more?.getSaves), postControllers.getSaves)
    .post(auth(), validate(postValidation.more?.save), postControllers.save)
    .delete(
        auth(),
        validate(postValidation.more?.unsave),
        postControllers.unsave
    );

router
    .route("/:id/read")
    .get(
        auth(),
        validate(postValidation.more?.getRead),
        postControllers.getRead
    )
    .post(auth(), validate(postValidation.more?.read), postControllers.read);

router
    .route("/feed") //TODO not using auth here, but may use in the future
    .get(validate(postValidation.more?.getNewFeed), postControllers.getNewFeed);

router
    .route("/feed/current")
    .get(
        auth(),
        validate(postValidation.more?.getRestFeed),
        postControllers.getRestFeed
    )
    .delete(
        auth(),
        validate(postValidation.more?.finishFeed),
        postControllers.finishFeed
    );

const postRoutes: ApiRouter = { path: "post", router };

export default postRoutes;
