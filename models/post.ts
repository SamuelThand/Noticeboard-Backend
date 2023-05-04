import { model, Model, Schema } from 'mongoose';

interface IPost {
  creator: Schema.Types.ObjectId;
  title: string;
  content: string;
  date: Date;
  lastEdited: Date;
  tag?: string;
}

interface IPostMethods {}

interface PostModel extends Model<IPost, {}, IPostMethods> {
  getPosts(): Promise<IPost[]>;
  getPost(id: string): Promise<IPost>;
  getPostsByUser(username: string): Promise<IPost[]>;
  addPost(post: IPost): Promise<IPost>;
  editPost(post: IPost): Promise<IPost>;
  removePost(post: IPost): Promise<IPost>;
}

const PostSchema = new Schema<IPost, PostModel, IPostMethods>({
  creator: {
    type: Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 50
  },
  content: {
    type: String,
    required: true,
    maxlength: 1500
  },
  date: {
    type: Date,
    default: Date.now()
  },
  lastEdited: {
    type: Date
  },
  tag: {
    type: String
  }
});

PostSchema.static('getPosts', function () {
  return this.find({});
});

PostSchema.static('getPost', function (id: string) {
  return this.findById(id);
});

PostSchema.static('getPostsByUser', function () {
  // TODO: Implement solution
  return this.find({});
});

PostSchema.static('addPost', function () {
  return undefined;
});

PostSchema.static('editPost', function () {
  return undefined;
});

PostSchema.static('removePost', function () {
  return undefined;
});

export const Post = model<IPost, PostModel>('Post', PostSchema);
