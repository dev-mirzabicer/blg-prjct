/* eslint-disable @typescript-eslint/no-explicit-any */
import EmptyModel from "./emptyModel";
import { excludeByObj } from "../../utils/exclude";
import mongoose from "mongoose";
import Joi from "joi";

export default function modelMatchesSchema(
    model: mongoose.Model<any>,
    modelSchema: Record<any, Joi.SchemaLike>
) {
    const modelProps = Object.keys(
        excludeByObj(model.schema.paths, EmptyModel.schema.paths)
    );
    const schemaProps = Object.keys(modelSchema);

    return () => expect(modelProps).toEqual(schemaProps);
}
