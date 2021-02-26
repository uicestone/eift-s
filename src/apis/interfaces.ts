import { Post } from "../models/Post";
import { User } from "../models/User";

export interface AuthLoginPostBody {
  login: string;
  password: string;
  fingerprint: string;
}

export interface AuthLoginResponseBody {
  token: string;
  user: User;
}

export interface ListQuery {
  order?: string;
  limit?: number;
  skip?: number;
}

export interface AuthTokenUserIdResponseBody extends AuthLoginResponseBody {}

export interface PostPostBody extends Post {}

export interface PostPutBody extends Post {}

export interface PostQuery extends ListQuery {
  slug?: string;
  tag?: string;
}

export interface UserPostBody extends User {}

export interface UserPutBody extends User {}

export interface UserQuery extends ListQuery {
  role?: string;
}

export interface StatQuery {}
