import { model, Model, Schema } from 'mongoose';

interface ITest {
  status: string;
  number: number;
  note?: string;
}

interface ITestMethods {}

interface TestModel extends Model<ITest, {}, ITestMethods> {
  getTests(): Promise<ITest[]>;
  addTest(test: ITest): Promise<ITest>;
}

const testSchema = new Schema<ITest, TestModel, ITestMethods>({
  status: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    unique: true,
    required: true
  },
  note: {
    type: String,
    required: false
  }
});

testSchema.static('getTests', function () {
  return this.find({});
});

testSchema.static('addTest', function (test: ITest) {
  return this.create(test);
});

export const Test = model<ITest, TestModel>('test', testSchema);
