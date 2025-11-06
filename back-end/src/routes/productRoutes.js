    const express = require('express');
    const router = express.Router();
    const productController = require('../controllers/productController');

    // GET /api/products
    router.get('/', productController.getAllProducts);

    // GET /api/products/category/:category_id
    router.get('/category/:category_id', productController.getProductsByCategory);

    module.exports = router;