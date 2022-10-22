import httpStatus from "http-status";
import AuthorModel, { Author } from "../models/author.model";
import UserModel from "../models/user.model";
import ApiError from "../utils/apiError";

const post = async (authorBody: Author) => {
    if (await UserModel.findById(authorBody.user))
        throw new ApiError(
            "This user is already an author",
            httpStatus.BAD_REQUEST
        );
    return AuthorModel.create(authorBody);
};

const patch = async (id: string, authorBody: Author) => {
    return AuthorModel.findByIdAndUpdate(id, authorBody, {
        new: true,
        runValidators: true,
    });
};

const getOne = async (id: string) => {
    return AuthorModel.findById(id);
};

const getOneByUser = async (userId: string) => {
    return AuthorModel.findOne({ user: userId });
};

const deleteOne = async (id: string) => {
    return AuthorModel.findByIdAndDelete(id);
};

export default { post, patch, getOne, getOneByUser, deleteOne };
