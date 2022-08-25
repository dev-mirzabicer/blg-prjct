import Joi from "joi";
import objectId from "../validations/validateMongoID";

class Validation {
    public queryForMany = Joi.object().keys({
        page: Joi.string().regex(/^\d+$/),
        limit: Joi.string().regex(/^\d+$/),
        sort: Joi.string(),
        fields: Joi.string(),
    });

    public idParams = Joi.object().keys({
        id: Joi.string().custom(objectId),
    });

    public bodyForCU: Record<string, Joi.Schema>;

    public queryForOne = Joi.object().keys({
        fields: Joi.string(),
    });

    public getOne = {
        params: this.idParams,
        query: this.queryForOne,
    };

    public getMany = {
        query: this.queryForMany,
    };

    public post: {
        body: Joi.ObjectSchema;
    };

    public deleteOne = {
        params: this.idParams,
    };

    public patch: {
        params: Joi.ObjectSchema;
        body: Joi.ObjectSchema;
    };

    constructor(documentSchema: Record<string, Joi.Schema>) {
        this.bodyForCU = documentSchema;
        this.post = {
            body: Joi.object().keys(this.bodyForCU),
        };
        this.patch = {
            params: this.idParams,
            body: Joi.object().keys(this.bodyForCU),
        };
    }
}

export default Validation;
