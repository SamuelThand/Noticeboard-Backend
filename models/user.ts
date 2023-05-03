import { model, Model, Schema } from 'mongoose';

interface IUser {
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
}

interface IUserMethods {}

interface UserModel extends Model<IUser, {}, IUserMethods> {
  getUsers(): Promise<IUser[]>;
  getUser(id: Schema.Types.ObjectId): Promise<IUser>;
  addUser(User: IUser): Promise<IUser>;
  removeUser(User: IUser): Promise<IUser>;
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
  }
});

/**
 * Get all users.
 *
 * @returns {Promise<IUser[]>} promise with all users
 */
UserSchema.static('getUsers', function () {
  return this.find({});
});

/**
 * Get user by id.
 *
 * @param {Schema.Types.ObjectId} id of the user
 * @returns {Promise<IUser[]>} promise with user
 */
UserSchema.static('getUser', function (id: Schema.Types.ObjectId) {
  return this.find({ id });
});

/**
 * Add a new user.
 *
 * @param {IUser} user to add
 * @returns {Promise<IUser>} added user
 */
UserSchema.static('addUser', function (user: IUser) {
  return this.create(user);
});

/**
 * Remove user.
 *
 * @param {Schema.Types.ObjectId} id user id
 * @returns {Promise<IUser>} removed user
 */
UserSchema.static('removeUser', function (id: Schema.Types.ObjectId) {
  return this.remove(id);
});

export const User = model<IUser, UserModel>('User', UserSchema);
