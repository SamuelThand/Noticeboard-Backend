// TODO review

import Express from 'express';

export function isAuthenticated(
  req: Express.Request,
  res: Express.Response,
  next: Function
) {
  req.session.user ? next() : res.status(401).json();
}

export function isAuthorized(
  req: Express.Request,
  res: Express.Response,
  next: Function
) {
  req.session.user === req.params.username ? next() : res.status(401).json();
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
  req.session.user === req.body.username ? next() : res.status(401).json();
}
