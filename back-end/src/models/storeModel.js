const db = require("../config/db");

const Store = {
    getAll: (callback) => {
        db.query("SELECT * FROM stores", callback);
    }
};

module.exports = Store;