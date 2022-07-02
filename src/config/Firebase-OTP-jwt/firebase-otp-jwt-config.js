const fbAdmin = require('firebase-admin');

const serviceAccount = require('./serviceAccount.json');

fbAdmin.initializeApp({
  credential: fbAdmin.credential.cert(serviceAccount)
});
module.exports = fbAdmin;