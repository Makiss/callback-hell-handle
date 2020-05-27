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

const copyFile = async function (fileToRead, fileToWrite) {
  await streamFromReadToWrite(fileToRead, fileToWrite);
};

const mkdir = async function (pathToFile) {
  await fsPromisified.mkdir(path.dirname(pathToFile), { recursive: true });
};

const openReadFile = async function (fileToRead, callback) {
  try {
    await fsPromisified.open(fileToRead, 'r');
  } catch (err) {
    callback(null, fileToRead, false);
  }
};

const openWriteFile = async function (fileToWrite) {
  try {
    await fsPromisified.open(fileToWrite, 'w');
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdir(fileToWrite);
    }
  }
};

module.exports = async function (fileToRead, fileToWrite, callback) {
  try {
    await openReadFile(fileToRead, callback);
    await openWriteFile(fileToWrite, callback);
    await copyFile(fileToRead, fileToWrite);
    callback(null, fileToWrite, true);
  } catch (err) {
    callback(err);
  }
};
