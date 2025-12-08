"""
Script tạo dữ liệu giả THỰC TẾ cho hệ thống Coffee Shop
File: 02_generate_realistic_data.py

Chạy: python3 02_generate_realistic_data.py
"""

import random
import csv
from datetime import datetime, timedelta
from collections import defaultdict

# =====================================================
# CẤU HÌNH
# =====================================================
NUM_NEW_USERS = 150  # Số user mới thêm
NUM_ORDERS = 1500    # Số đơn hàng trong 6 tháng
START_DATE = datetime.now() - timedelta(days=180)  # 6 tháng trước

EXISTING_USER_IDS = [8, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22]
STORE_IDS = list(range(1, 16))  # 15 cửa hàng

# Danh sách sản phẩm theo category (từ CSV của bạn)
PRODUCTS = {
    # Cafe (có caffeine)
    'coffee_hot': [1, 4, 6, 11, 16, 22, 23, 24, 46],  # Espresso, Latte nóng, Phin nóng
    'coffee_cold': [2, 3, 5, 7, 8, 9, 10, 12, 13, 14, 15, 19, 20, 21, 25, 26, 27, 28, 45],
    
    # Trà & Matcha (ít caffeine/không caffeine)
    'tea_hot': [30, 31, 35, 37, 41],
    'tea_cold': [29, 32, 33, 34, 36, 38, 39, 40, 42, 43, 44],
    
    # Chocolate & Frappe (không caffeine, ngọt)
    'sweet_drinks': [17, 18, 45, 46],
    
    # Đồ ăn
    'food_sweet': [47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57],  # Bánh ngọt
    'food_savory': [58, 59, 60, 61, 62, 63],  # Bánh mặn
    'food_meal': [64, 65, 66, 67, 68, 69, 70],  # Pasta, Pizza, Salad
}

# Giá sản phẩm (VND)
PRODUCT_PRICES = {
    1: 45000, 2: 49000, 3: 55000, 4: 55000, 5: 65000, 6: 69000,
    7: 39000, 8: 49000, 9: 49000, 10: 49000, 11: 45000,
    12: 59000, 13: 55000, 14: 49000, 15: 59000, 16: 59000,
    17: 65000, 18: 65000, 19: 45000, 20: 45000, 21: 39000, 22: 39000,
    23: 39000, 24: 39000, 25: 39000, 26: 39000, 27: 45000, 28: 49000,
    29: 45000, 30: 49000, 31: 55000, 32: 55000, 33: 55000, 34: 49000,
    35: 59000, 36: 49000, 37: 59000, 38: 49000, 39: 55000, 40: 55000,
    41: 55000, 42: 55000, 43: 55000, 44: 39000, 45: 55000, 46: 55000,
    47: 35000, 48: 55000, 49: 55000, 50: 20000, 51: 19000, 52: 19000,
    53: 19000, 54: 19000, 55: 19000, 56: 35000, 57: 39000, 58: 29000,
    59: 22000, 60: 22000, 61: 19000, 62: 39000, 63: 39000, 64: 59000,
    65: 59000, 66: 39000, 67: 39000, 68: 39000, 69: 49000, 70: 49000,
}

# Thời tiết HCM theo tháng (thực tế)
WEATHER_PATTERNS = {
    1: {'temp': (22, 28), 'conditions': ['Cool', 'Sunny', 'Cloudy'], 'humidity': (65, 75)},
    2: {'temp': (24, 30), 'conditions': ['Sunny', 'Hot', 'Cloudy'], 'humidity': (60, 70)},
    3: {'temp': (26, 32), 'conditions': ['Hot', 'Sunny', 'Cloudy'], 'humidity': (60, 75)},
    4: {'temp': (27, 34), 'conditions': ['Hot', 'Sunny'], 'humidity': (65, 80)},
    5: {'temp': (26, 33), 'conditions': ['Rainy', 'Hot', 'Cloudy'], 'humidity': (75, 85)},
    6: {'temp': (25, 31), 'conditions': ['Rainy', 'Cloudy', 'Hot'], 'humidity': (78, 88)},
    7: {'temp': (25, 31), 'conditions': ['Rainy', 'Cloudy'], 'humidity': (78, 88)},
    8: {'temp': (25, 31), 'conditions': ['Rainy', 'Cloudy'], 'humidity': (78, 88)},
    9: {'temp': (25, 31), 'conditions': ['Rainy', 'Cloudy', 'Sunny'], 'humidity': (75, 85)},
    10: {'temp': (25, 30), 'conditions': ['Rainy', 'Cloudy', 'Sunny'], 'humidity': (75, 83)},
    11: {'temp': (24, 29), 'conditions': ['Sunny', 'Cloudy', 'Cool'], 'humidity': (70, 80)},
    12: {'temp': (22, 28), 'conditions': ['Cool', 'Sunny', 'Cloudy'], 'humidity': (65, 75)},
}

# =====================================================
# HÀM LOGIC CHỌN SẢN PHẨM THÔNG MINH
# =====================================================
def get_weather_for_date(order_date):
    """Tạo thời tiết thực tế theo mùa HCM"""
    month = order_date.month
    pattern = WEATHER_PATTERNS[month]
    
    temp = round(random.uniform(*pattern['temp']), 1)
    condition = random.choice(pattern['conditions'])
    humidity = random.randint(*pattern['humidity'])
    
    return {
        'temperature': temp,
        'weather_condition': condition,
        'humidity': humidity
    }

def select_products_by_weather(weather, num_items=None):
    """Chọn sản phẩm phù hợp với thời tiết"""
    if num_items is None:
        num_items = random.choices([1, 2, 3, 4], weights=[40, 35, 20, 5])[0]
    
    selected = []
    temp = weather['temperature']
    condition = weather['weather_condition']
    
    # Logic chọn đồ uống chính
    if condition == 'Rainy' or temp < 25:
        # Trời mưa/lạnh -> ưu tiên đồ nóng, chocolate
        drink_pool = PRODUCTS['coffee_hot'] + PRODUCTS['tea_hot'] + PRODUCTS['sweet_drinks']
        weights = [3] * len(PRODUCTS['coffee_hot']) + [2] * len(PRODUCTS['tea_hot']) + [2] * len(PRODUCTS['sweet_drinks'])
    elif temp > 30 or condition == 'Hot':
        # Trời nóng -> ưu tiên đồ lạnh
        drink_pool = PRODUCTS['coffee_cold'] + PRODUCTS['tea_cold']
        weights = [2] * len(PRODUCTS['coffee_cold']) + [1] * len(PRODUCTS['tea_cold'])
    else:
        # Trời dễ chịu -> cân bằng
        drink_pool = PRODUCTS['coffee_cold'] + PRODUCTS['tea_cold'] + PRODUCTS['coffee_hot']
        weights = None
    
    # Chọn 1 đồ uống chính
    main_drink = random.choices(drink_pool, weights=weights)[0]
    selected.append(main_drink)
    
    # Thêm món phụ nếu order nhiều item
    if num_items > 1:
        # 60% thêm đồ ăn
        if random.random() < 0.6:
            if random.random() < 0.5:
                selected.append(random.choice(PRODUCTS['food_sweet']))
            else:
                selected.append(random.choice(PRODUCTS['food_savory']))
        
        # 30% thêm đồ uống khác
        if num_items > 2 and random.random() < 0.3:
            other_drinks = [p for p in drink_pool if p != main_drink]
            if other_drinks:
                selected.append(random.choice(other_drinks))
        
        # 10% thêm món ăn chính
        if num_items > 3 and random.random() < 0.1:
            selected.append(random.choice(PRODUCTS['food_meal']))
    
    return selected[:num_items]

# =====================================================
# TẠO DỮ LIỆU
# =====================================================
def generate_new_users():
    """Tạo 150 user mới"""
    print("\n📝 Tạo users mới...")
    users = []
    start_id = 23
    
    first_names = ['Minh', 'Hương', 'Nam', 'Lan', 'Tuấn', 'Nga', 'Hùng', 'Linh', 'Đức', 'Trang']
    last_names = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ']
    
    for i in range(NUM_NEW_USERS):
        user_id = start_id + i
        full_name = f"{random.choice(last_names)} {random.choice(first_names)}"
        email = f"user{user_id}@coffee.test"
        phone = f"0{random.randint(300000000, 999999999)}"
        
        users.append({
            'user_id': user_id,
            'full_name': full_name,
            'email': email,
            'phone': phone,
            'password': '$2b$10$dummyhashedpassword',  # Password giả
            'image_url': 'https://netbrew.s3.ap-southeast-1.amazonaws.com/public/default_avatar.jpg',
            'created_at': (datetime.now() - timedelta(days=random.randint(30, 180))).strftime('%Y-%m-%d %H:%M:%S')
        })
    
    print(f"✅ Tạo xong {len(users)} users")
    return users

def generate_orders_and_items():
    """Tạo orders + orderitems + order_weather + interactions"""
    print("\n📝 Tạo orders, items, weather & interactions...")
    
    all_user_ids = EXISTING_USER_IDS + list(range(23, 23 + NUM_NEW_USERS))
    
    # User có xu hướng order nhiều hơn
    active_users = random.sample(all_user_ids, k=int(len(all_user_ids) * 0.3))
    casual_users = [u for u in all_user_ids if u not in active_users]
    
    orders = []
    items = []
    weather_records = []
    interactions = []
    
    order_id = 13  # Bắt đầu từ ID tiếp theo
    item_id = 18
    
    for i in range(NUM_ORDERS):
        # Chọn user (user active có tỷ lệ cao hơn)
        user_id = random.choices(
            active_users + casual_users,
            weights=[3] * len(active_users) + [1] * len(casual_users)
        )[0]
        
        # Thời gian order (phân bố thực tế)
        order_date = START_DATE + timedelta(
            days=random.randint(0, 180),
            hours=random.randint(7, 21),
            minutes=random.randint(0, 59)
        )
        
        # Tạo thời tiết
        weather = get_weather_for_date(order_date)
        
        # Chọn sản phẩm phù hợp thời tiết
        selected_products = select_products_by_weather(weather)
        
        # Tạo order
        total = sum(PRODUCT_PRICES.get(p, 50000) * random.randint(1, 2) for p in selected_products)
        
        orders.append({
            'order_id': order_id,
            'user_id': user_id,
            'store_id': random.choice(STORE_IDS),
            'total_price': total,
            'status': random.choices(['completed', 'pending', 'cancelled'], weights=[85, 10, 5])[0],
            'delivery_type': random.choices(['takeaway', 'dine-in', 'delivery'], weights=[50, 30, 20])[0],
            'created_at': order_date.strftime('%Y-%m-%d %H:%M:%S'),
            'updated_at': (order_date + timedelta(minutes=random.randint(5, 30))).strftime('%Y-%m-%d %H:%M:%S')
        })
        
        # Tạo order items
        for product_id in selected_products:
            qty = random.randint(1, 2)
            price = PRODUCT_PRICES.get(product_id, 50000)
            
            items.append({
                'order_item_id': item_id,
                'order_id': order_id,
                'product_id': product_id,
                'quantity': qty,
                'unit_price': price,
                'subtotal': price * qty,
                'variant_selection': '[{"name":"Vừa","variant_id":59,"price_adjustment":0}]' if random.random() < 0.7 else 'NULL',
                'note': random.choice(['NULL', 'Ít đá', 'Ít đường', 'Nhiều đá']) if random.random() < 0.3 else 'NULL'
            })
            item_id += 1
        
        # Tạo weather record
        weather_records.append({
            'order_id': order_id,
            'temperature': weather['temperature'],
            'weather_condition': weather['weather_condition'],
            'humidity': weather['humidity'],
            'recorded_at': order_date.strftime('%Y-%m-%d %H:%M:%S')
        })
        
        # Tạo interactions (70% user có view trước khi order)
        if random.random() < 0.7:
            for product_id in selected_products:
                interactions.append({
                    'user_id': user_id,
                    'product_id': product_id,
                    'interaction_type': 'view',
                    'duration_seconds': random.randint(10, 120),
                    'created_at': (order_date - timedelta(minutes=random.randint(1, 30))).strftime('%Y-%m-%d %H:%M:%S')
                })
        
        order_id += 1
        
        if (i + 1) % 300 == 0:
            print(f"  Đã tạo {i + 1}/{NUM_ORDERS} orders...")
    
    print(f"✅ Tạo xong {len(orders)} orders, {len(items)} items, {len(weather_records)} weather, {len(interactions)} interactions")
    return orders, items, weather_records, interactions

# =====================================================
# GHI FILE CSV
# =====================================================
def write_csv(filename, data, fieldnames):
    """Ghi dữ liệu ra file CSV"""
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    print(f"✅ Đã ghi {filename} ({len(data)} rows)")

# =====================================================
# MAIN
# =====================================================
def main():
    print("=" * 60)
    print("🚀 BẮT ĐẦU TẠO DỮ LIỆU GIẢ THỰC TẾ")
    print("=" * 60)
    
    # 1. Tạo users
    users = generate_new_users()
    write_csv('fake_users.csv', users, 
              ['user_id', 'full_name', 'email', 'phone', 'password', 'image_url', 'created_at'])
    
    # 2. Tạo orders + items + weather + interactions
    orders, items, weather, interactions = generate_orders_and_items()
    
    write_csv('fake_orders.csv', orders,
              ['order_id', 'user_id', 'store_id', 'total_price', 'status', 
               'delivery_type', 'created_at', 'updated_at'])
    
    write_csv('fake_orderitems.csv', items,
              ['order_item_id', 'order_id', 'product_id', 'quantity', 
               'unit_price', 'subtotal', 'variant_selection', 'note'])
    
    write_csv('fake_order_weather.csv', weather,
              ['order_id', 'temperature', 'weather_condition', 'humidity', 'recorded_at'])
    
    write_csv('fake_user_interactions.csv', interactions,
              ['user_id', 'product_id', 'interaction_type', 'duration_seconds', 'created_at'])
    
    print("\n" + "=" * 60)
    print("✅ HOÀN THÀNH! Các file CSV đã được tạo:")
    print("   - fake_users.csv")
    print("   - fake_orders.csv")
    print("   - fake_orderitems.csv")
    print("   - fake_order_weather.csv")
    print("   - fake_user_interactions.csv")
    print("=" * 60)

if __name__ == "__main__":
    main()