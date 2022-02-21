export interface IUser {
  username: string;
  fullName: string;
  email: string;
  password: string;
  resetPasswordToken: string;
  resetPasswordExpires: Date;
  google: IGoogle;
  role: string;
  active: boolean;
  pictureUrl: string;
  pictureBlob: string;
}

export interface IGoogle {
  id: string;
  sync: boolean;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface IUserQueryFilter extends IUser {
  q?: string;
}

export interface CurrentUserPayload {
  id: string;
  email: string;
  active: boolean;
  role: string;
  // deleted: boolean;
}
