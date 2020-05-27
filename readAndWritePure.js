const fs = require('fs');
const path = require('path');

const onReadableFileOpen = function (fileToRead, fileToWrite, callback, err) {
  if (err) {
    return callback(null, fileToRead, false);
  }

  copyFile(fileToRead, fileToWrite, callback);
};

const onMkdir = function (rs, fileToWrite, callback, err) {
  if (err) {
    return callback(err);
  }
  const ws = fs.createWriteStream(fileToWrite, 'utf8');

  streamFromReadToWrite(rs, ws, callback);
};

const onWritableFileOpen = function (fileToRead, fileToWrite, callback, err) {
  const rs = fs.createReadStream(fileToRead, 'utf8');

  if (err) {
    if (err.code === 'ENOENT') {
      return fs.mkdir(
        path.dirname(fileToWrite),
        { recursive: true },
        onMkdir.bind(null, rs, fileToWrite, callback)
      );
    }

    return callback(err);
  }

  const ws = fs.createWriteStream(fileToWrite, 'utf8');
  streamFromReadToWrite(rs, ws, callback);
};

const streamFromReadToWrite = function (rs, ws, callback) {
  rs.pipe(ws)
    .on('error', callback)
    .on('finish', callback.bind(null, null, ws.path, true));
};

const copyFile = function (fileToRead, fileToWrite, callback) {
  fs.open(
    fileToWrite,
    'w',
    onWritableFileOpen.bind(null, fileToRead, fileToWrite, callback)
  );
};

module.exports = function (fileToRead, fileToWrite, callback) {
  fs.open(
    fileToRead,
    'r',
    onReadableFileOpen.bind(null, fileToRead, fileToWrite, callback)
  );
};
