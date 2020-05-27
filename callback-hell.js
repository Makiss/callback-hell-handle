const fs = require('fs'); 
const path = require('path'); 

function readAndWrite(fileToRead, fileToWrite, callback) { 
  fs.exists(fileToRead, exists => {
    if(exists) {
      console.log(`Reading from ${fileToRead}`); 
      fs.readFile(fileToRead, (err, content) => {
        if(err) {
          callback(err); 
        } else { 
          fs.exists(path.dirname(fileToWrite), exists => {
            if(!exists) { 
              fs.mkdir(path.dirname(fileToWrite), err => {    
                if(err) { 
                  callback(err); 
                } else { 
                  fs.writeFile(fileToWrite, content, err => {
                    if(err) { 
                      callback(err); 
                    } else { 
                      callback(null, fileToWrite, true); 
                    } 
                  }); 
                } 
              });
            } else {
              fs.writeFile(fileToWrite, content, err => {
                if(err) { 
                  callback(err); 
                } else { 
                  callback(null, fileToWrite, true); 
                } 
              });
            }
          }) 
        } 
      }); 
    } else { 
      callback(null, fileToRead, false); 
    } 
  }); 
}

const fileToRead = process.argv[2];
const fileToWrite = process.argv[3];

readAndWrite(fileToRead, fileToWrite, (err, filename, copied) => { 
  if(err) { 
    console.log(err); 
  } else if(copied){ 
    console.log(`Completed the copying of "${filename}"`); 
  } else { 
    console.log(`"${filename}" doesn't exist`); 
  } 
});