const { promises: fs } = require('fs');
const jpex = require('./dist/cjs/jpex');

const expectedFiles = [
  'dist/cjs/jpex.js',
  'dist/es/jpex.js',
  'dist/ts/index.d.ts',
  'dist/ts/types/index.d.ts',
];
const expectedExports = [
  ['default', '[object Object]'],
  ['jpex', '[object Object]'],
];

const run = async () => {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < expectedFiles.length; i++) {
    const target = expectedFiles[i];

    try {
      await fs.stat(target);
    } catch (e) {
      throw new Error(`Unable to verify file ${target}`);
    }
  }

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < expectedExports.length; i++) {
    const [key, type] = expectedExports[i];
    if (jpex[key] === void 0) {
      throw new Error(`${key} was not exported`);
    }
    const actualType = Object.prototype.toString.call(jpex[key]);
    if (actualType !== type) {
      throw new Error(
        `Expected type of ${key} to be ${type} but it was ${actualType}`,
      );
    }
  }

  console.log('Everything looks good to me');
};

run();
