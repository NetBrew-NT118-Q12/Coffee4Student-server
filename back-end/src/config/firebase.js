const admin = require("firebase-admin");

let app;

if (admin.apps.length === 0) {
    const serviceAccount = require("./serviceAccountKey.json");

    app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
} else {
    app = admin.app(); // Nếu đã tồn tại, dùng lại app cũ
}

module.exports = admin;