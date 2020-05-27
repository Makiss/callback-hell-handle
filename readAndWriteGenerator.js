const fs = require('fs');
const path = require('path');
const fsPromisified = fs.promises;

const asyncFlowWithPromises = function (err, generator) {
  const traverseGenerator = (yieldedObj) => {
    const result = yieldedObj.value;
    if (result) {
      return result.then
        ? result
            .then(() => asyncFlowWithPromises(null, generatorObj))
            .catch((err) => asyncFlowWithPromises(err, generatorObj))
        : asyncFlowWithPromises(null, result);
    }
  };

  const generatorObj = typeof generator === 'object' ? generator : generator();

  traverseGenerator(err ? generator.throw(err) : generatorObj.next());
};

const streamFromReadToWrite = function* (fileToRead, fileToWrite) {
  const rs = fs.createReadStream(fileToRead, 'utf8');
  const ws = fs.createWriteStream(fileToWrite, 'utf8');

  rs.pipe(ws);

  yield new Promise((resolve, reject) => {
    ws.on('finish', () => resolve());
    ws.on('error', (error) => reject(error));
  });
};

const copyFile = function* (fileToRead, fileToWrite) {
  yield* streamFromReadToWrite(fileToRead, fileToWrite);
};

const mkdir = function* (pathToFile) {
  yield fsPromisified.mkdir(path.dirname(pathToFile), { recursive: true });
};

const openReadFile = function* (fileToRead, callback) {
  try {
    yield fsPromisified.open(fileToRead, 'r');
  } catch (err) {
    yield callback(null, fileToRead, false);
  }
};

const openWriteFile = function* (fileToWrite) {
  try {
    yield fsPromisified.open(fileToWrite, 'w');
  } catch (err) {
    if (err.code === 'ENOENT') {
      yield* mkdir(fileToWrite);
    }
  }
};

module.exports = function (fileToRead, fileToWrite, callback) {
  return asyncFlowWithPromises(
    null,
    function* (fileToRead, fileToWrite, callback) {
      try {
        yield* openReadFile(fileToRead, callback);
        yield* openWriteFile(fileToWrite, callback);
        yield* copyFile(fileToRead, fileToWrite);
        yield callback(null, fileToWrite, true);
      } catch (err) {
        yield callback(err);
      }
    }.bind(null, fileToRead, fileToWrite, callback)
  );
};
