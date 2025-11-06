// models/productVariantModel.js
const db = require('../config/db');

exports.getAllProductVariants = (callback) => {
  const sql = 'SELECT * FROM productvariants';
  db.query(sql, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};