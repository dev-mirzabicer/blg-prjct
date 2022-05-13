/* eslint indent: 0 */
import { catchAsync } from "../utils/catchAsync";
import hs from "http-status";
import pick from "../utils/pick";
import healthcheckServices from "../services/healthcheck.services";
import ApiError from "../utils/apiError";

function validQuery(query: Record<string, unknown>) {
    const validQuery = pick(query, [
        "healthcheck",
        "page",
        "limit",
        "sort",
        "fields",
    ]);
    return validQuery;
}

const getOne = catchAsync(async (req, res, next) => {
    const fields =
        typeof req.query.fields === "string"
            ? req.query.fields
            : typeof req.query.fields?.join === "function"
            ? req.query.fields.join(",")
            : undefined;

    const healthcheck = await healthcheckServices.getOne(req.params.id, fields);

    if (!healthcheck) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }

    res.status(hs.OK).json({
        status: "OK",
        data: { healthcheck },
    });
});

const getMany = catchAsync(async (req, res, next) => {
    const query = validQuery(req.query);

    const healthchecks = await healthcheckServices.getMany(query);

    res.status(hs.OK).json({
        status: "OK",
        data: { healthchecks },
    });
});

const post = catchAsync(async (req, res, next) => {
    const healthcheck = await healthcheckServices.post(req.body);

    res.status(hs.CREATED).json({
        status: "OK",
        data: { healthcheck },
    });
});

const deleteOne = catchAsync(async (req, res, next) => {
    const healthcheck = await healthcheckServices.deleteOne(req.params.id);

    if (!healthcheck) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }

    res.status(hs.NO_CONTENT).json({
        status: "OK",
    });
});

const patch = catchAsync(async (req, res, next) => {
    const healthcheck = await healthcheckServices.patch(
        req.params.id,
        req.body
    );

    if (!healthcheck) {
        return next(new ApiError("Not found", hs.NOT_FOUND));
    }

    res.status(hs.OK).json({
        status: "OK",
        data: { healthcheck },
    });
});

export default { getOne, getMany, post, deleteOne, patch };
