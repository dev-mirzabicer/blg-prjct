import Joi from "joi";
import objectId from "../validations/validateMongoID";

class Validation {
    public queryForMany = Joi.object().keys({
        page: Joi.string().regex(/^\d+$/),
        limit: Joi.string().regex(/^\d+$/),
        sort: Joi.string(),
        fields: Joi.string(),
        text: Joi.string(),
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

    public more?: Record<
        string,
        {
            params?: Joi.Schema;
            body?: Joi.Schema;
            query?: Joi.Schema;
        }
    >;

    constructor(documentSchema: Record<string, Joi.Schema> = {}) {
        this.bodyForCU = documentSchema;
        this.post = {
            body: Joi.object().keys(this.bodyForCU),
        };
        const bodyForCuOptional: Record<string, Joi.Schema> = {};
        Object.keys(this.bodyForCU).forEach((key: string) => {
            bodyForCuOptional[key] = this.bodyForCU[key].optional();
            //converting the required body fields back to optional for patch requests
        });
        this.patch = {
            params: this.idParams,
            body: Joi.object().keys(bodyForCuOptional),
        };
    }

    public addQueryForMany(queries: Record<string, Joi.StringSchema>) {
        this.queryForMany = Joi.object().keys({
            page: Joi.string().regex(/^\d+$/),
            limit: Joi.string().regex(/^\d+$/),
            sort: Joi.string(),
            fields: Joi.string(),
            ...queries,
        });
    }

    //exampleValidation.setNameOfIdParam("exampleId"); means that the param is ../:exampleId,
    //  instead of the defaukt ../:id which is set as a default value of this.idParams
    public setNameOfIdParam(name: string) {
        const obj: Record<string, Joi.Schema> = {};
        obj[name] = Joi.string().custom(objectId);
        this.idParams = Joi.object().keys(obj);
    }

    public addMore(more: {
        params: Joi.Schema;
        body: Joi.Schema;
        query: Joi.Schema;
    }) {
        this.more = {
            ...this.more,
            more,
        };
    }
}

export default Validation;
