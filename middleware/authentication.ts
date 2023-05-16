// TODO review

import Express from 'express';
import { Post } from '../models/post';

export function isAuthenticated(
  req: Express.Request,
  res: Express.Response,
  next: Function
) {
  req.session.user ? next() : res.status(401).json();
}

export function isAdmin(
  req: Express.Request,
  res: Express.Response,
  next: Function
) {
  req.session.isAdmin ? next() : res.status(401).json();
}

export function isPostCreator(
  req: Express.Request,
  res: Express.Response,
  next: Function
) {
  const id: string = req.params.id;
  const user: string = req.session.user;
  Post.findById(id)
    .then((result) => {
      if (user === result?.creator.toString()) {
        next();
      } else {
        res.status(401).json({ message: 'Post creator validation failed' });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(404).send({ message: 'Something unexpected happened.' });
    });
}
