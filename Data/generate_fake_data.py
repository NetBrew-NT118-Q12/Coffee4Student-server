"""
Script tạo dữ liệu giả lập cho hệ thống recommendation
Chạy: python generate_fake_data.py
"""
import random
import csv
from datetime import datetime, timedelta

# ========== CẤU HÌNH ==========
NUM_USERS = 150  # Tạo 150 users
NUM_ORDERS = 1500  # 1500 đơn hàng
START_DATE = datetime(2024, 1, 1)
END_DATE = datetime(2025, 11, 30)

# Danh sách sản phẩm (81 products từ CSV)
PRODUCTS = list(range(1, 82))

# Phân loại sản phẩm theo nhóm (để tạo user behavior patterns)
COFFEE_PRODUCTS = list(range(1, 29))  # Espresso, Americano, Latte, etc.
TEA_PRODUCTS = list(range(29, 45))    # Matcha, Trà trái cây, Trà sữa
FOOD_PRODUCTS = list(range(47, 71))   # Bánh, Pasta, Pizza, Salad
TOPPING_PRODUCTS = list(range(71, 82)) # Topping

# User personas (để tạo behavior patterns)
PERSONAS = {
    'coffee_lover': {'main': COFFEE_PRODUCTS, 'secondary': FOOD_PRODUCTS, 'weight': 0.7},
    'tea_fan': {'main': TEA_PRODUCTS, 'secondary': TOPPING_PRODUCTS, 'weight': 0.6},
    'food_hunter': {'main': FOOD_PRODUCTS, 'secondary': COFFEE_PRODUCTS, 'weight': 0.5},
    'mixed': {'main': PRODUCTS, 'secondary': [], 'weight': 0.3}
}

# ========== HÀM TẠO DỮ LIỆU ==========

def random_date(start, end):
    """Tạo ngày giờ ngẫu nhiên"""
    delta = end - start
    random_days = random.randint(0, delta.days)
    random_seconds = random.randint(0, 86400)
    return start + timedelta(days=random_days, seconds=random_seconds)

def create_users():
    """Tạo users với personas khác nhau"""
    users = []
    for i in range(8, NUM_USERS + 8):  # Bắt đầu từ user_id=8
        persona = random.choice(list(PERSONAS.keys()))
        gender = random.choice(['Nam', 'Nữ', None])
        
        users.append({
            'user_id': i,
            'full_name': f"User {i}",
            'email': f"user{i}@test.com",
            'phone': f"09{str(i).zfill(8)}",
            'password': '$2b$10$fake_hashed_password',
            'date_of_birth': None,
            'gender': gender,
            'image_url': 'https://netbrew.s3.ap-southeast-1.amazonaws.com/public/default_avatar.jpg',
            'persona': persona  # Dùng để tạo orders sau
        })
    return users

def create_orders(users):
    """Tạo orders dựa trên personas"""
    orders = []
    order_items = []
    order_id = 13  # Bắt đầu từ 13 (đã có 12 orders)
    
    for user in users:
        # Mỗi user order 5-15 lần
        num_orders = random.randint(5, 15)
        persona_data = PERSONAS[user['persona']]
        
        for _ in range(num_orders):
            order_date = random_date(START_DATE, END_DATE)
            store_id = random.randint(1, 15)  # 15 stores
            
            # Chọn sản phẩm theo persona
            if random.random() < persona_data['weight']:
                products = persona_data['main']
            else:
                products = persona_data['secondary'] if persona_data['secondary'] else PRODUCTS
            
            # Mỗi đơn có 1-4 items
            num_items = random.randint(1, 4)
            selected_products = random.sample(products, min(num_items, len(products)))
            
            total_price = 0
            for product_id in selected_products:
                quantity = random.randint(1, 3)
                unit_price = random.randint(25000, 75000)
                subtotal = unit_price * quantity
                total_price += subtotal
                
                order_items.append({
                    'order_item_id': len(order_items) + 18,  # Bắt đầu từ 18
                    'order_id': order_id,
                    'product_id': product_id,
                    'quantity': quantity,
                    'unit_price': unit_price,
                    'subtotal': subtotal,
                    'variant_selection': '[{"name":"Vừa","variant_id":59,"price_adjustment":0}]',
                    'note': None
                })
            
            # Status: 80% completed, 15% pending, 5% cancelled
            rand = random.random()
            if rand < 0.8:
                status = 'completed'
            elif rand < 0.95:
                status = 'pending'
            else:
                status = 'cancelled'
            
            orders.append({
                'order_id': order_id,
                'user_id': user['user_id'],
                'store_id': store_id,
                'total_price': total_price,
                'status': status,
                'created_at': order_date.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': order_date.strftime('%Y-%m-%d %H:%M:%S'),
                'delivery_type': random.choice(['takeaway', 'delivery', 'dine-in']),
                'shipping_address': None
            })
            
            order_id += 1
    
    return orders, order_items

def write_csv(filename, data, fieldnames):
    """Ghi dữ liệu ra CSV"""
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in data:
            # Chỉ ghi các field trong fieldnames
            filtered_row = {k: v for k, v in row.items() if k in fieldnames}
            writer.writerow(filtered_row)

# ========== MAIN ==========
if __name__ == "__main__":
    print("🚀 Bắt đầu tạo dữ liệu giả lập...")
    
    # 1. Tạo users
    print(f"📝 Tạo {NUM_USERS} users...")
    users = create_users()
    write_csv('users_fake.csv', users, [
        'user_id', 'full_name', 'email', 'phone', 'password',
        'date_of_birth', 'gender', 'image_url', 'created_at', 'updated_at', 'firebase_uid'
    ])
    
    # 2. Tạo orders & order items
    print(f"📝 Tạo {NUM_ORDERS} orders...")
    orders, order_items = create_orders(users)
    
    write_csv('orders_fake.csv', orders, [
        'order_id', 'user_id', 'store_id', 'total_price', 'status',
        'created_at', 'updated_at', 'delivery_type', 'shipping_address'
    ])
    
    write_csv('orderitems_fake.csv', order_items, [
        'order_item_id', 'order_id', 'product_id', 'quantity',
        'unit_price', 'subtotal', 'variant_selection', 'note'
    ])
    
    print("\n✅ Hoàn thành!")
    print(f"   - users_fake.csv: {len(users)} users")
    print(f"   - orders_fake.csv: {len(orders)} orders")
    print(f"   - orderitems_fake.csv: {len(order_items)} items")
    print("\n📌 Import vào MySQL:")
    print("   LOAD DATA LOCAL INFILE 'users_fake.csv' INTO TABLE users ...")