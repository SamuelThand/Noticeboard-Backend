import { model, Model, Schema } from 'mongoose';

interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  userSince: Date;
  isAdmin: boolean;
}

interface IUserMethods {}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  /**
   * Get all users.
   *
   * @returns {Promise<IUser[]>} promise with all users
   */
  getUsers(): Promise<IUser[]>;
  /**
   * Get user by id.
   *
   * @param {string} id of the user
   * @returns {Promise<IUser>} promise with user
   */
  getUser(id: string): Promise<IUser>;
  /**
   * Get user by username.
   *
   * @param {string} username of the user
   * @returns {Promise<IUser>} promise with user
   */
  getUserByUsername(username: string): Promise<IUser>;
  /**
   * Add a new user.
   *
   * @param {IUser} user to add
   * @returns {Promise<IUser>} added user
   */
  addUser(user: IUser): Promise<IUser>;
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  firstName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 60,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 60,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [6, 'Minimum length of username is 6.'],
    maxlength: [30, 'Maximum length of username is 30.'],
    immutable: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  userSince: {
    type: Date,
    required: true,
    default: Date.now(),
    immutable: true
  },
  isAdmin: {
    type: Boolean,
    default: false,
    immutable: true,
    required: true
  }
});

UserSchema.static('getUsers', function () {
  return this.find({});
});

UserSchema.static('getUser', function (id: string) {
  return this.findById(id);
});

UserSchema.static('getUserByUsername', function (username: string) {
  return this.findOne({ userName: username }).select('+password');
});

UserSchema.static('addUser', function (user: IUser): Promise<IUser> {
  return this.create(user);
});

export const User = model<IUser, UserModel>('User', UserSchema);
