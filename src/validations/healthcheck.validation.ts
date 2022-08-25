import Joi from "joi";
import { Validation } from "../interfaces";

export const healthcheckSchema = {
    healthcheck: Joi.string().required(),
};

const healthcheckValidation = new Validation(healthcheckSchema);

export default healthcheckValidation;
