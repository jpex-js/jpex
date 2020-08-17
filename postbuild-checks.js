const { promises: fs } = require('fs');

const expectedFiles = [
  'dist/cjs/jpex.js',
  'dist/es/jpex.js',
  'dist/es/index.d.ts',
  'dist/es/types/index.d.ts',
];

const run = async() => {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < expectedFiles.length; i++) {
    const target = expectedFiles[i];

    try {
      await fs.stat(target);
    } catch (e) {
      throw new Error(`Unable to verify file ${target}`);
    }
  }
};

run();
