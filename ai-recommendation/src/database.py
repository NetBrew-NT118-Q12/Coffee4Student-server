import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.host = os.getenv('DB_HOST')
        self.user = os.getenv('DB_USER')
        self.password = os.getenv('DB_PASSWORD')
        self.database = os.getenv('DB_NAME')
        self.connection = None
    
    def connect(self):
        """Kết nối đến MySQL"""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            if self.connection.is_connected():
                print("✅ Kết nối MySQL thành công")
                return True
        except Error as e:
            print(f"❌ Lỗi kết nối: {e}")
            return False
    
    def disconnect(self):
        """Ngắt kết nối"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("🔌 Đã ngắt kết nối MySQL")
    
    def execute_query(self, query, params=None):
        """Thực thi câu lệnh SQL"""
        cursor = self.connection.cursor(dictionary=True)
        try:
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            # Nếu là SELECT
            if query.strip().upper().startswith('SELECT'):
                return cursor.fetchall()
            
            # Nếu là INSERT/UPDATE/DELETE
            self.connection.commit()
            return cursor.rowcount
        
        except Error as e:
            print(f"❌ Lỗi query: {e}")
            return None
        finally:
            cursor.close()

# Test kết nối (chạy file này để test)
if __name__ == "__main__":
    db = Database()
    if db.connect():
        # Test query
        result = db.execute_query("SELECT COUNT(*) as total FROM products")
        print(f"📊 Tổng số sản phẩm: {result[0]['total']}")
        db.disconnect()