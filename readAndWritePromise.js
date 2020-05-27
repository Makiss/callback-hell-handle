const fs = require('fs');
const path = require('path');
const fsPromisified = fs.promises;

const streamFromReadToWrite = function (fileToRead, fileToWrite) {
  const rs = fs.createReadStream(fileToRead, 'utf8');
  const ws = fs.createWriteStream(fileToWrite, 'utf8');

  rs.pipe(ws);

  return new Promise((resolve, reject) => {
    ws.on('finish', () => resolve());
    ws.on('error', (error) => reject(error));
  });
};

module.exports = function (fileToRead, fileToWrite, callback) {
  fsPromisified
    .open(fileToRead, 'r')
    .catch(callback.bind(null, null, fileToRead, false))
    .then(() => fsPromisified.open(fileToWrite, 'w'))
    .catch((err) => {
      if (err.code === 'ENOENT') {
        return fsPromisified.mkdir(path.dirname(fileToWrite));
      }
    })
    .then(() =>
      streamFromReadToWrite(fileToRead, fileToWrite).then(
        callback.bind(null, null, fileToWrite, true)
      )
    )
    .catch(callback);
};
