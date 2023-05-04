import Express from 'express';
import { User } from '../models/user';
import { isValidObjectId } from 'mongoose';
import { isAuthenticated } from '../middleware/authentication';
import bcrypt from 'bcrypt';

const userRoutes = Express.Router();

// TODO: Decide if password should be removed (from the returned user obj) here or in the model

/**
 * Determine logged in status
 *
 * @route POST /admins/isloggedin
 * @returns 401 - Unathorized, 200 - OK
 */
userRoutes.get(
  '/isloggedin',
  isAuthenticated,
  function (req: Express.Request, res: Express.Response, next) {
    res.status(200).json();
  }
);

// TODO: Check for a better way to handle this
// Consider a way to handle too many incorrect login attempts

/**
 * Log in.
 *
 * @route POST /users/signin
 * @returns 304 - Found, 404 - Not found, 500 - Error
 */
userRoutes.post(
  '/signin',
  function (req: Express.Request, res: Express.Response, next) {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username)
      .then((result) => {
        if (result && bcrypt.compareSync(password, result.password)) {
          req.session.regenerate((error) => {
            if (error) {
              next(error);
            }
            req.session.user = username;
            req.session.save((error) => {
              if (error) {
                return next(error);
              }
              res.status(200).json(result);
            });
          });
        } else {
          res.status(404).json({ message: 'Incorrect credentials' });
        }
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  }
);

/**
 * Sign out.
 * @route GET /users/signout
 * @returns 200 - Signed out, 500 - Error
 */
userRoutes.get(
  '/signout',
  isAuthenticated,
  function (req: Express.Request, res: Express.Response) {
    req.session.destroy((error) => {
      if (error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(200).json({ message: 'Signed out' });
      }
    });
  }
);

/**
 * Get an array of all users.
 *
 * @route GET /users/
 * @return 200 - The quizzes, 500 - Error
 */
userRoutes.get('/', function (req: Express.Request, res: Express.Response) {
  User.getUsers()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

/**
 * Get user by id.
 *
 * @route GET /users/:id
 * @param id of the user
 * @return 200 - The user, 404 - Not found, 400 - Invalid, 500 - Error
 */
userRoutes.get('/:id', function (req: Express.Request, res: Express.Response) {
  const id: string = req.params.id;
  if (isValidObjectId(id)) {
    User.getUser(id)
      .then((result) => {
        result
          ? res.status(200).json(result)
          : res.status(404).json({ message: 'User not found' });
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
  } else {
    res.status(400).json({ error: 'Invalid user' });
  }
});

/**
 * Add a new User.
 *
 * @route POST /users/signup
 * @return 201 - The new user, 409 - Conflict, 400 - Invalid, 500 - Error
 */
userRoutes.post(
  '/signup',
  function (req: Express.Request, res: Express.Response) {
    const user = new User(req.body);
    const saltRounds: number = Number(process.env.SALT_ROUNDS);
    const salt = bcrypt.genSaltSync(saltRounds);
    user.password = bcrypt.hashSync(user.password, salt);
    User.addUser(user)
      .then((result) => {
        res.status(201).json(result);
      })
      .catch((error) => {
        if (error.name === 'MongoServerError' && error.code === 11000) {
          res
            .status(409)
            .json({ message: 'User already exists with that username.' });
        } else if (error.name === 'ValidationError') {
          res.status(400).json({ message: 'Incorrect format' });
        } else {
          res.status(500).json({ message: error.message });
        }
      });
  }
);

/**
 * Delete user.
 *
 * @route DELETE /users/:id
 * @param id of the user
 * @return 202 - The deleted user, 404 - Not found, 400 - Invalid, 500 - Error
 */
userRoutes.delete(
  '/:id',
  isAuthenticated,
  function (req: Express.Request, res: Express.Response) {
    const id: string = req.params.id;
    if (isValidObjectId(id)) {
      User.removeUser(id)
        .then((result) => {
          result
            ? res.status(202).json(result)
            : res.status(404).json({ message: 'User not found' });
        })
        .catch((error) => {
          res.status(500).json({ message: error.message });
        });
    } else {
      res.status(400).json({ error: 'Invalid user' });
    }
  }
);

export default userRoutes;
