
import numpy as np
from database import Database

class ContentBasedRecommender:
    def __init__(self):
        self.db = Database()
        self.db.connect()
        
        # Trọng số cho từng thuộc tính
        self.weights = {
            'drink_type': 0.30,
            'category_type': 0.25,
            'temperature': 0.15,
            'has_milk': 0.10,
            'has_caffeine': 0.05,
            'flavor_notes': 0.15
        }
    
    def get_product_attributes(self, product_id):
        """Lấy đặc tính của 1 sản phẩm"""
        query = """
            SELECT pa.*, p.name, p.category_id
            FROM product_attributes pa
            JOIN products p ON pa.product_id = p.product_id
            WHERE pa.product_id = %s
        """
        result = self.db.execute_query(query, (product_id,))
        return result[0] if result else None
    
    def get_all_active_products(self, exclude_id=None):
        """Lấy tất cả sản phẩm đang hoạt động"""
        query = """
            SELECT pa.*, p.name, p.category_id, p.is_active
            FROM product_attributes pa
            JOIN products p ON pa.product_id = p.product_id
            WHERE p.is_active = 1
        """
        
        if exclude_id:
            query += f" AND pa.product_id != {exclude_id}"
        
        return self.db.execute_query(query)
    
    def calculate_similarity(self, product_a, product_b):
        """
        Tính độ tương đồng giữa 2 sản phẩm
        Trả về: float (0.0 - 1.0)
        """
        score = 0.0
        
        #  So sánh drink_type (coffee, tea, chocolate, food)
        if product_a['drink_type'] == product_b['drink_type']:
            score += self.weights['drink_type']
        
        #  So sánh category_type (latte, espresso, matcha, ...)
        if product_a['category_type'] == product_b['category_type']:
            score += self.weights['category_type']
        
        #  So sánh temperature (hot, cold, room)
        if product_a['temperature'] == product_b['temperature']:
            score += self.weights['temperature']
        
        #  So sánh has_milk (boolean)
        if product_a['has_milk'] == product_b['has_milk']:
            score += self.weights['has_milk']
        
        #  So sánh has_caffeine (boolean)
        if product_a['has_caffeine'] == product_b['has_caffeine']:
            score += self.weights['has_caffeine']
    
        #  So sánh flavor_notes (text similarity)
        flavor_sim = self._calculate_flavor_similarity(
            product_a['flavor_notes'], 
            product_b['flavor_notes']
        )
        score += flavor_sim * self.weights['flavor_notes']
        
        return round(score, 3)
    
    def _calculate_flavor_similarity(self, flavor_a, flavor_b):
        """
        Tính độ tương đồng giữa 2 chuỗi flavor_notes
        Sử dụng Jaccard Similarity
        """
        if not flavor_a or not flavor_b:
            return 0.0
        
        # Tách thành set các từ
        set_a = set(flavor_a.lower().replace(',', '').split())
        set_b = set(flavor_b.lower().replace(',', '').split())
        
        # Jaccard = (A ∩ B) / (A ∪ B)
        intersection = len(set_a & set_b)
        union = len(set_a | set_b)
        
        if union == 0:
            return 0.0
        
        return intersection / union
    
    def get_similar_products(self, product_id, top_n=5):
        """
        Tìm N sản phẩm tương tự nhất
        
        Args:
            product_id: ID sản phẩm cần tìm tương tự
            top_n: Số lượng sản phẩm trả về
        
        Returns:
            List[dict]: Danh sách sản phẩm kèm điểm tương đồng
        """
        # Lấy sản phẩm gốc
        current_product = self.get_product_attributes(product_id)
        if not current_product:
            print(f"Không tìm thấy product_id={product_id}")
            return []
        
        # Lấy tất cả sản phẩm khác
        all_products = self.get_all_active_products(exclude_id=product_id)
        
        # Tính điểm tương đồng cho từng sản phẩm
        similarities = []
        for product in all_products:
            similarity_score = self.calculate_similarity(current_product, product)
            
            similarities.append({
                'product_id': product['product_id'],
                'name': product['name'],
                'category_id': product['category_id'],
                'similarity_score': similarity_score,
                'drink_type': product['drink_type'],
                'category_type': product['category_type']
            })
        
        # Sắp xếp theo điểm giảm dần
        similarities.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Lấy top N
        return similarities[:top_n]
    
    def close(self):
        """Đóng kết nối database"""
        self.db.disconnect()


# # ===============================================
# # TEST SCRIPT
# # ===============================================
# if __name__ == "__main__":
#     print("=" * 60)
#     print(" TEST CONTENT-BASED FILTERING")
#     print("=" * 60)
    
#     recommender = ContentBasedRecommender()
    
#     # Test với Latte Classic (product_id=13)
#     test_product_id = 13
#     print(f"\n Tìm sản phẩm tương tự với: product_id={test_product_id}")
    
#     # Lấy thông tin sản phẩm gốc
#     product = recommender.get_product_attributes(test_product_id)
#     if product:
#         print(f"   Tên: {product['name']}")
#         print(f"   Loại: {product['drink_type']} - {product['category_type']}")
#         print(f"   Nhiệt độ: {product['temperature']}")
#         print(f"   Có sữa: {product['has_milk']}")
#         print(f"   Flavor: {product['flavor_notes']}")
    
#     # Tìm top 5 tương tự
#     similar = recommender.get_similar_products(test_product_id, top_n=5)
    
#     print(f"\n Top 5 sản phẩm tương tự:")
#     print("-" * 60)
#     for i, item in enumerate(similar, 1):
#         print(f"{i}. {item['name']}")
#         print(f"   Score: {item['similarity_score']:.3f} | Type: {item['drink_type']} - {item['category_type']}")
    
#     recommender.close()
#     print("\n" + "=" * 60)