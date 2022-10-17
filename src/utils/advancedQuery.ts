/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query as MongoQuery } from "mongoose";

const parseNested = (obj: Record<string, any>) => {
    Object.keys(obj).forEach((key) => {
        if (typeof obj[key] == "string") {
            try {
                obj[key] = JSON.parse(obj[key]);
            } catch {
                return;
            }
        }
    });
    return obj;
};

export default class AdvancedQuery {
    private mongoQuery: MongoQuery<any, any>;
    private requestQuery: Record<string, string>;

    constructor(
        mongoQuery: MongoQuery<any, any>,
        requestQuery: Record<string, string>
    ) {
        this.mongoQuery = mongoQuery;
        this.requestQuery = requestQuery;
    }

    public filter() {
        const newQuery = { ...this.requestQuery };
        const excludedFields = ["page", "limit", "sort", "fields"];
        excludedFields.forEach((el) => delete newQuery[el]);
        parseNested(newQuery);
        const queryString = JSON.stringify(newQuery).replace(
            /\b(gt|gte|lt|lte|in|eq|ne|nin|and|or|not|nor|exists|type|regex|text|search|where)\b/g,
            (match) => `$${match}`
        );
        this.mongoQuery = this.mongoQuery.find(JSON.parse(queryString));

        return this;
    }

    public sort() {
        const sortBy =
            this.requestQuery.sort?.split(",").join(" ") || "-createdAt";
        this.mongoQuery = this.mongoQuery.sort(sortBy);

        return this;
    }

    public limit() {
        const fields = this.requestQuery.fields?.split(",").join(" ") || "-__v";
        this.mongoQuery = this.mongoQuery.select(fields);

        return this;
    }

    public paginate() {
        const page = parseInt(this.requestQuery.page, 10) || 1;
        const limit = parseInt(this.requestQuery.limit, 10) || 10;
        const skip = (page - 1) * limit;

        this.mongoQuery = this.mongoQuery.skip(skip).limit(limit);

        return this;
    }

    public query(): MongoQuery<any, any> {
        return this.mongoQuery;
    }
}
