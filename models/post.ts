import { model, Model, Schema } from 'mongoose';

interface IPost {
  creator: Schema.Types.ObjectId;
  title: string;
  content: string;
  date: Date;
  likes: Schema.Types.ObjectId[];
  hates: Schema.Types.ObjectId[];
  likeStatus?: boolean;
  hateStatus?: boolean;
  lastEdited: Date;
  tag?: string;
}

interface IPostMethods {
  updateEditDate(): void;
}

interface PostModel extends Model<IPost, {}, IPostMethods> {
  /**
   * Get all posts.
   *
   * @returns {Promise<IPost[]>}
   */
  getPosts(): Promise<IPost[]>;
  /**
   * Get promise by id.
   *
   * @param {string} id of the post
   * @returns {Promise<IPost>} promise with user
   */
  getPost(id: string): Promise<IPost>;
  /**
   * Get all posts made by user.
   *
   * @param {string} username of the creator.
   * @returns {Promise<IPost[]>}
   */
  getPostsByUser(username: string): Promise<IPost[]>;
  /**
   * Add a new post to database.
   *
   * @param {IPost} post to insert.
   * @returns {Promise<IPost>} promise with new post
   */
  addPost(post: IPost): Promise<IPost>;
  /**
   * Change an existing post.
   *
   * @param id of the post
   * @returns {Promise<IPost>} promise with the updated post
   */
  editPost(id: string, editedPost: IPost): Promise<IPost>;
  likePost(id: string, userId: string): Promise<IPost>;
  hatePost(id: string, userId: string): Promise<IPost>;
  /**
   * Remove a post from the database.
   *
   * @param id of the post
   * @returns {Promise<IPost>} promise with the removed post
   */
  removePost(id: string): Promise<IPost>;
}

const PostSchema = new Schema<IPost, PostModel, IPostMethods>({
  creator: {
    type: Schema.Types.ObjectId,
    required: true,
    immutable: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    maxlength: [50, 'Title is too long, max length is 50.']
  },
  content: {
    type: String,
    required: true,
    maxlength: [1500, 'Maximum length of the content is 1500.']
  },
  date: {
    type: Date,
    immutable: true
  },
  likes: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  hates: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  lastEdited: {
    type: Date
  },
  tag: {
    type: String,
    maxlength: [10, 'Maximum length of tag is 10.']
  }
});

PostSchema.static('getPosts', function () {
  return this.find({}).populate('creator', 'userName');
});

PostSchema.static('getPost', function (id: string) {
  return this.findById(id);
});

PostSchema.static('getPostsByUser', function (username: string) {
  return this.find({ username });
});

PostSchema.static('addPost', function (post: IPost) {
  post.date = new Date();
  return this.create(post);
});

PostSchema.static('editPost', function (id: string, editedPost: IPost) {
  editedPost.lastEdited = new Date();
  return this.findByIdAndUpdate(id, editedPost, { new: true });
});

// TODO: Check if user has already liked/disliked the post.
PostSchema.static('likePost', function (id: string, userId: string) {
  return this.findByIdAndUpdate(
    id,
    { $addToSet: { likes: userId }, $pull: { hates: userId } },
    { new: true }
  );
});

PostSchema.static('hatePost', function (id: string, userId: string) {
  return this.findByIdAndUpdate(
    id,
    { $addToSet: { hates: userId }, $pull: { likes: userId } },
    { new: true }
  );
});

PostSchema.static('removePost', function (id: string) {
  return this.findByIdAndDelete(id);
});

export const Post = model<IPost, PostModel>('Post', PostSchema);
