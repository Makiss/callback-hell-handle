const readAndWriteAsyncAwait = require('./readAndWriteAsyncAwait');
const readAndWriteGenerator = require('./readAndWriteGenerator');
const readAndWritePure = require('./readAndWritePure');
const readAndWritePromise = require('./readAndWritePromise');

const fileToRead = process.argv[2];
const fileToWrite = process.argv[3];

const onError = function (err, filename, copied) {
  if (err) {
    console.log(err);
  } else if (copied) {
    console.log(`Completed the copying of "${filename}"`);
  } else {
    console.log(`"${filename}" doesn't exist`);
  }
  process.exit(0);
};

// readAndWritePure(fileToRead, fileToWrite, onError);
// readAndWritePromise(fileToRead, fileToWrite, onError);
// readAndWriteAsyncAwait(fileToRead, fileToWrite, onError);
readAndWriteGenerator(fileToRead, fileToWrite, onError);
