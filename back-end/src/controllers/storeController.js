const Store = require("../models/storeModel");

exports.getStores = (req, res) => {
    Store.getAll((err, stores) => {
        if (err) return res.status(500).json({ message: "DB error" });
        return res.json(stores);
    });
};