import Express from 'express';
import { Post } from '../models/post';
import { isValidObjectId } from 'mongoose';
import {
  isAuthenticated,
  isPostCreator,
  isAdmin
} from '../middleware/authentication';

const postRoutes = Express.Router();

postRoutes.get(
  '/',
  function (req: Express.Request, res: Express.Response, next) {
    Post.getPosts()
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        next(error);
      });
  }
);

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

postRoutes.get(
  '/:username',
  function (req: Express.Request, res: Express.Response, next) {
    const username = req.params.username;

    Post.getPostsByUser(username)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((error) => {
        next(error);
      });
  }
);

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

postRoutes.put(
  '/:id',
  isAuthenticated,
  isPostCreator || isAdmin,
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

postRoutes.delete(
  '/:id',
  isAuthenticated,
  isPostCreator || isAdmin,
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
          res.status(500).send({ error: error.message });
        });
    } else {
      res.status(400).json({ message: 'Invalid ID' });
    }
  }
);

export default postRoutes;
