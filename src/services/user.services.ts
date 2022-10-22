import { UserRole } from "../constants";
import httpStatus from "http-status";
import UserModel, { User } from "../models/user.model";
import AuthorModel from "../models/author.model";
import { authorServices } from "../services";
import AdvancedQuery from "../utils/advancedQuery";
import ApiError from "../utils/apiError";

const post = async (userBody: User) => {
    if (await UserModel.findOne({ email: userBody.email })) {
        throw new ApiError("This email is taken", httpStatus.BAD_REQUEST);
    }
    const user = await UserModel.create(userBody);
    if (userBody.role == UserRole.AUTHOR)
        await AuthorModel.create({ user: user.id, bio: "New author" });
    return user;
};

const getOne = async (id: string) => {
    return UserModel.findById(id);
};

const getMany = async (query: Record<string, any>) => {
    return new AdvancedQuery(UserModel.find(), query)
        .filter()
        .sort()
        .paginate()
        .limit()
        .query();
};

const getOneByEmail = async (email: string) => {
    return UserModel.findOne({ email });
};

const patch = async (id: string, userBody: Record<any, any>) => {
    const { role } = userBody;
    const userDoc = await UserModel.findById(id);
    if (!userDoc) throw new ApiError("User not found", httpStatus.NOT_FOUND);
    if (role === UserRole.AUTHOR && userDoc.role != UserRole.AUTHOR)
        await authorServices.post({
            user: id,
            bio: "New author",
        });
    // Object.assign(userDoc, userBody);
    // userDoc.save();
    await userDoc.update(userBody, { runValidators: true });
    Object.assign(userDoc, userBody);
    return userDoc;
};

const deleteOne = async (id: string) => {
    await AuthorModel.findOneAndDelete({ user: id });
    return UserModel.findByIdAndDelete(id);
};

export default { getOne, getMany, getOneByEmail, post, deleteOne, patch };
