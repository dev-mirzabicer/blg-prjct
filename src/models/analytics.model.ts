import { getModelForClass, index, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";

@index({ postId: 1, user: 1 }, { unique: true })
@index({ postId: 1 }, { unique: false })
class Analytics {
    @prop({ required: true })
    public postId!: string;

    @prop({ required: true })
    public clicked!: boolean;

    @prop({ required: true })
    public likesRatio!: number;

    @prop({ required: true })
    public savesRatio!: number;

    @prop({ required: true })
    public freshness!: number;

    @prop({ required: true })
    public trending!: number;

    @prop()
    public relation?: number;

    @prop({ ref: () => User, type: () => [String] })
    public user?: Ref<User, string>[];
}

const AnalyticsModel = getModelForClass(Analytics);

export default AnalyticsModel;
