const fs = require('fs');
const path = require('path');

// webApp下需要编译到dist目录的文件
const pageName = ['eduLogin.html'];

pageName.map(item => toWriteFile(path.resolve(__dirname, '../', item), path.resolve(__dirname, '../', 'dist', item)));

function toWriteFile(filePath, targetFilePath){

   if(!filePath && !targetFilePath) throw err;

   fs.readFile(filePath, 'utf-8', (err, data) => {

     if(err) throw err;

     fs.writeFile(targetFilePath, data, (err) => {
       if (err) throw err;
     });

   });

}

