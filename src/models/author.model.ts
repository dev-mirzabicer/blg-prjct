import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";

class Social {
    @prop({ required: true })
    public name!: string;

    @prop({ required: true })
    public link!: string;
}

class Author {
    @prop({ required: true, ref: () => User, type: () => String })
    public user!: Ref<User, string>;

    @prop({ required: true })
    public bio!: string;

    @prop({ type: () => [Social], required: false })
    public socials?: Social[];
}

const AuthorModel = getModelForClass(Author);

export default AuthorModel;

export { Author };
