import { model, Model, Schema } from 'mongoose';

interface IUser {
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
   * @returns {Promise<IUser[]>} promise with user
   */
  getUser(id: string): Promise<IUser>;
  /**
   * Add a new user.
   *
   * @param {IUser} user to add
   * @returns {Promise<IUser>} added user
   */
  addUser(user: IUser): Promise<IUser>;
  /**
   * Remove user.
   *
   * @param {string} id user id
   * @returns {Promise<IUser>} removed user
   */
  removeUser(id: string): Promise<IUser>;
}

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6,
    immutable: true
  },
  password: {
    type: String,
    required: true
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
// TODO: Decide if password should be remove in the route or here
// Remove password example:
// return this.find({}).select('-password');

UserSchema.static('getUsers', function () {
  return this.find({});
});

UserSchema.static('getUser', function (id: string) {
  return this.findById(id);
});

UserSchema.static('addUser', function (user: IUser): Promise<IUser> {
  return this.create(user);
});

UserSchema.static('removeUser', function (id: string) {
  return this.findByIdAndDelete(id);
});

export const User = model<IUser, UserModel>('User', UserSchema);
