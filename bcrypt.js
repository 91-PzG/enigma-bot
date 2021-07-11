const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync();
const pw = bcrypt.hashSync('Pa$$w0rd', salt);
console.log(`Salt: ${salt}`);
console.log(`PW: ${pw}`);
