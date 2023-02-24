// import AdmZip from 'adm-zip';
const fs = require('fs');
const zipdir = require('zip-dir');
const path = require('path');

const timeStamp = () => {
  const event = new Date();
  return (
    event.toLocaleDateString().split('.').reverse().join('-') +
    '-' +
    event.toTimeString().slice(0, 8).replace(/:/g, '')
  );
};

// Backup directory
const backupDirectory = '../_backups';

const zipName = `${backupDirectory}/backup_${timeStamp()}.zip`;
const zipDir = path.resolve(__dirname, '../');

if (false === fs.existsSync(backupDirectory)) {
  fs.mkdirSync(backupDirectory);
}

zipdir(
  zipDir,
  {
    saveTo: zipName,
    filter: (path, stat) => !/(.*node_modules|.*dist|.*_backups)/.test(path),
  },
  function (err, buffer) { },
);
