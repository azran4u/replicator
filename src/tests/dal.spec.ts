import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { DatabaseConnector, dbDal } from '../database';
import { perf } from '../performance';
import { s3Instance } from '../s3';

chai.use(chaiAsPromised);
const expect = chai.expect;

// runs globally BEFORE ALL tests
before(async function () {
});

// runs globally AFTER ALL tests
after(async function () {
  await DatabaseConnector.getInstance().disconnect();
  const filename = `perf.csv`;  
  await perf.export(filename);
  await s3Instance.upload(filename);
  await s3Instance.upload(`logs.log`);
});

describe('database connection', async () => {

  beforeEach(async function () {
  });

  afterEach(async function () {
  });

  it('get time from db', async () => {
    const time = await dbDal.getTime();
    expect(time).to.be.exist;
  });
});