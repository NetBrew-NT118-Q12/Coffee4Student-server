const db = require('../config/db');

const NotificationModel = {
  create: (data, callback) => {
    const query = `
      INSERT INTO notifications (user_id, title, message, created_at, type, is_read)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    db.query(
      query,
      [
        data.user_id,
        data.title,
        data.message,
        data.created_at,
        data.type,
        data.is_read
      ],
      (err, result) => {
        if (err) {
          return callback(err, null);
        }
        return callback(null, result);
      }
    );
  },

  getNotificationsByUserId: function(userId, callback) {
    const query = `
        SELECT noti_id, user_id, title, message, created_at, type, is_read 
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching notifications in model:", err);
            return callback(err, null);
        }
        
        const formattedResults = results.map(noti => {
            if (noti.created_at) {

                const vnTime = new Date(noti.created_at);
                vnTime.setHours(vnTime.getHours() + 7);

                noti.created_at = vnTime.toISOString().slice(0, 19).replace('T', ' ');
            }
            return noti;
        });

        callback(null, formattedResults);
    });
  },

  updateReadStatus: (notiId, callback) => {
    const query = "UPDATE notifications SET is_read = 1 WHERE noti_id = ?";
    db.query(query, [notiId], (err, result) => {
      callback(err, result);
    });
  },

  updateAllReadStatus: (userId, callback) => {
    const query = "UPDATE notifications SET is_read = 1 WHERE user_id = ?";
    db.query(query, [userId], (err, result) => {
      callback(err, result);
    });
  }
};

module.exports = NotificationModel;