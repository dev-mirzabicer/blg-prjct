import Joi from "joi";
import objectId from "./validateMongoID";
import { Validation } from "../interfaces";

export const healthcheckSchema = {
    healthcheck: Joi.string().required(),
};

class HealthcheckValidation implements Validation {
    private queryForMany = Joi.object().keys({
        healthcheck: Joi.string(),
        page: Joi.string().regex(/^\d+$/),
        limit: Joi.string().regex(/^\d+$/),
        sort: Joi.string(),
        fields: Joi.string(),
    });

    private idParams = Joi.object().keys({
        id: Joi.string().custom(objectId),
    });

    private bodyForCU = Joi.object().keys({
        ...healthcheckSchema,
    });

    private queryForOne = Joi.object().keys({
        fields: Joi.string(),
    });

    public getOne = {
        params: this.idParams,
        query: this.queryForOne,
    };

    public getMany = {
        query: this.queryForMany,
    };

    public post = {
        body: this.bodyForCU,
    };

    public deleteOne = {
        params: this.idParams,
    };

    public patch = {
        params: this.idParams,
        body: this.bodyForCU,
    };
}

export default HealthcheckValidation;
