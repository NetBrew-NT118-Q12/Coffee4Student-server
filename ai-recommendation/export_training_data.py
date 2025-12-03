"""
Script export dữ liệu training từ MySQL sang CSV
File: ml-scripts/export_training_data.py
"""

import mysql.connector
import pandas as pd
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Kết nối MySQL
conn = mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME')
)

print("✅ Kết nối MySQL thành công")

# Query lấy dữ liệu training
query = """
SELECT 
    o.order_id,
    o.user_id,
    o.store_id,
    o.created_at,
    o.delivery_type,
    oi.product_id,
    oi.quantity,
    p.name as product_name,
    p.category_id,
    c.name as category_name,
    pa.drink_type,
    pa.temperature,
    pa.has_caffeine,
    pa.has_milk,
    COALESCE(ow.temperature, 28) as weather_temp,
    COALESCE(ow.weather_condition, 'Unknown') as weather_condition,
    COALESCE(ow.humidity, 75) as humidity
FROM orders o
JOIN orderitems oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
JOIN categories c ON p.category_id = c.category_id
LEFT JOIN product_attributes pa ON p.product_id = pa.product_id
LEFT JOIN order_weather ow ON o.order_id = ow.order_id
WHERE o.status = 'completed'
ORDER BY o.created_at DESC
"""

# Load data
df = pd.read_sql(query, conn)
conn.close()

print(f"📊 Đã load {len(df)} records")

# Xử lý dữ liệu
df['created_at'] = pd.to_datetime(df['created_at'])
df['hour'] = df['created_at'].dt.hour
df['day_of_week'] = df['created_at'].dt.dayofweek
df['month'] = df['created_at'].dt.month

# Fill missing values
df['drink_type'].fillna('unknown', inplace=True)
df['temperature'].fillna('cold', inplace=True)
df['has_caffeine'].fillna(0, inplace=True)
df['has_milk'].fillna(0, inplace=True)

# Export
output_file = f"training_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
df.to_csv(output_file, index=False)

print(f"✅ Đã export: {output_file}")
print(f"📈 Columns: {list(df.columns)}")
print(f"📦 Shape: {df.shape}")