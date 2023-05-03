import Express from 'express';
import { Test } from '../models/test';

const testRoutes = Express.Router();

testRoutes.get('/', function (req: Express.Request, res: Express.Response) {
  Test.getTests()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

testRoutes.get(
  '/static',
  function (req: Express.Request, res: Express.Response) {
    res.status(200).json({ status: 'ok' });
  }
);

testRoutes.post('/', function (req: Express.Request, res: Express.Response) {
  const test = new Test(req.body);
  Test.addTest(test)
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      res.status(500).json({ message: error.message });
    });
});

export default testRoutes;
