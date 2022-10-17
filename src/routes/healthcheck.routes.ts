import { Router } from "express";
import { healthcheckControllers } from "../controllers";
import { healthcheckValidation } from "../validations";
import { validate } from "../middlewares";
import { ApiRouter } from "../interfaces";

const router = Router();

router
    .route("/")
    .get(
        validate(healthcheckValidation.getMany),
        healthcheckControllers.getMany
    )
    .post(validate(healthcheckValidation.post), healthcheckControllers.post);

router
    .route("/:id")
    .get(validate(healthcheckValidation.getOne), healthcheckControllers.getOne)
    .delete(
        validate(healthcheckValidation.deleteOne),
        healthcheckControllers.deleteOne
    )
    .patch(validate(healthcheckValidation.patch), healthcheckControllers.patch);

const healthcheckRoutes: ApiRouter = { path: "healthcheck", router };

export default healthcheckRoutes;
