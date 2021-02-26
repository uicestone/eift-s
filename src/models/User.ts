import { prop, getModelForClass, plugin } from "@typegoose/typegoose";
import updateTimes from "./plugins/updateTimes";

@plugin(updateTimes)
export class User {
  @prop({ default: "customer" })
  role!: string;

  @prop({ unique: true, sparse: true })
  login?: string;

  @prop({ select: false })
  password?: string;

  @prop({ select: false })
  fingerprint?: string;

  @prop({ type: String })
  name?: string;

  @prop({
    type: String,
    get: (v) => v,
    set: (v) => {
      const genderIndex = ["未知", "男", "女"];
      return genderIndex[v] || v;
    },
  })
  gender?: string;

  @prop({
    unique: true,
    sparse: true,
    validate: {
      validator: function (v) {
        return (
          v.length === 11 || v.match(/^\+/) || process.env.SUPPRESS_VALIDATOR
        );
      },
      message: (props: { value: any }) =>
        `手机号必须是11位数或“+”开头的国际号码，输入的是${JSON.stringify(
          props.value
        )}`,
    },
  })
  mobile?: string;

  @prop()
  avatarUrl?: string;

  @prop()
  region?: string;

  @prop()
  country?: string;

  @prop()
  birthday?: string;

  @prop()
  idCardNo?: string;

  @prop()
  openid?: string;

  @prop()
  openidMp?: string;

  @prop()
  unionid?: string;
}

const userModel = getModelForClass(User, {
  schemaOptions: {
    strict: false,
    toJSON: {
      getters: true,
      transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
      },
    },
  },
});

export default userModel;
