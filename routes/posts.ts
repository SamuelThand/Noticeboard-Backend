import Express from 'express';
import { Post } from '../models/post';
import { isValidObjectId } from 'mongoose';
import {
  isAuthenticated,
  isPostCreatorOrAdmin
} from '../middleware/authentication';

const postRoutes = Express.Router();

/**
 * Get all posts.
 * @route GET /posts/
 * @returns 200 - all posts, 500 - Error
 */
postRoutes.get(
  '/',
  function (req: Express.Request, res: Express.Response, next) {
    Post.getPosts()
      .then((result) => {
        result.forEach((post) => {
          // Set *status to true if current user in session is in likes or hates
          post.likeStatus = post.likes.includes(req.session.user);
          post.hateStatus = post.hates.includes(req.session.user);
        });
        res.status(200).json(result);
      })
      .catch((error) => {
        next(error);
      });
  }
);

/**
 * Get a post by id.
 * @route GET /posts/:id
 * @returns 200 - post, 400 - Invalid ID, 404 - Not found
 */
postRoutes.get(
  '/:id',
  function (req: Express.Request, res: Express.Response, next) {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid ID' });
    }

    Post.getPost(id)
      .then((result) => {
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: 'Post not found' });
        }
      })
      .catch((error) => {
        next(error);
      });
  }
);

/**
 * Add a new post.
 * @route POST /posts/
 * @returns 200 - post
 */
postRoutes.post(
  '/',
  isAuthenticated,
  function (req: Express.Request, res: Express.Response, next) {
    const post = req.body;
    post.creator = req.session.user;

    Post.addPost(post)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        next(error);
      });
  }
);

/**
 * Update a post.
 * @route PUT /posts/
 * @returns 200 - post, 400 - Invalid ID
 */
postRoutes.put(
  '/:id',
  isAuthenticated,
  isPostCreatorOrAdmin,
  function (req: Express.Request, res: Express.Response, next) {
    const id = req.params.id;
    const post = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid ID' });
    }

    Post.editPost(id, post)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        next(error);
      });
  }
);

/**
 * Add current user to likes.
 * @route PUT /posts/like/:id
 * @returns 200 - post, 400 - Invalid ID
 */
postRoutes.put(
  '/like/:id',
  isAuthenticated,
  function (req: Express.Request, res: Express.Response, next) {
    const id = req.params.id;
    const user = req.session.user;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid ID' });
    }

    Post.likePost(id, user)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        next(error);
      });
  }
);

/**
 * Add current user to hates.
 * @route PUT /posts/hate/:id
 * @returns 200 - post, 400 - Invalid ID
 */
postRoutes.put(
  '/hate/:id',
  isAuthenticated,
  function (req: Express.Request, res: Express.Response, next) {
    const id = req.params.id;
    const user = req.session.user;

    if (!isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid ID' });
    }

    Post.hatePost(id, user)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        next(error);
      });
  }
);

/**
 * Remove post.
 * @route DELETE /posts/:id
 * @returns 200 - post, 404 - Not found, 500 - Error, 400 - Invalid ID
 */
postRoutes.delete(
  '/:id',
  isAuthenticated,
  isPostCreatorOrAdmin,
  function (req: Express.Request, res: Express.Response, next) {
    const id: string = req.params.id;

    if (isValidObjectId(id)) {
      Post.removePost(id)
        .then((result) => {
          result
            ? res.status(200).json(result)
            : res.status(404).json({ message: 'Post not found' });
        })
        .catch((error) => {
          console.log(error.message);
          res.status(500).send({ error: 'Something unexpected happened' });
        });
    } else {
      res.status(400).json({ message: 'Invalid ID' });
    }
  }
);

export default postRoutes;
