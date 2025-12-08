"""
Collaborative Filtering: "Người khác cũng thích" - Dựa trên hành vi mua hàng
"""
from collections import Counter
from database import Database

class CollaborativeRecommender:
    def __init__(self):
        self.db = Database()
        self.db.connect()
    
    def get_users_who_bought(self, product_id):
        """
        Tìm tất cả user đã mua sản phẩm này
        
        Returns:
            List[int]: Danh sách user_id
        """
        query = """
            SELECT DISTINCT o.user_id
            FROM orders o
            JOIN orderitems oi ON o.order_id = oi.order_id
            WHERE oi.product_id = %s 
            AND o.status = 'completed'
        """
        result = self.db.execute_query(query, (product_id,))
        return [row['user_id'] for row in result] if result else []
    
    def get_products_bought_by_users(self, user_ids, exclude_product_id=None):
        """
        Lấy tất cả sản phẩm mà các user này đã mua
        
        Args:
            user_ids: List user_id
            exclude_product_id: ID sản phẩm cần loại trừ
        
        Returns:
            List[dict]: [{product_id, name, count}, ...]
        """
        if not user_ids:
            return []
        
        # Tạo placeholder cho IN clause
        placeholders = ','.join(['%s'] * len(user_ids))
        
        query = f"""
            SELECT 
                oi.product_id,
                p.name,
                p.category_id,
                COUNT(*) as purchase_count
            FROM orderitems oi
            JOIN orders o ON oi.order_id = o.order_id
            JOIN products p ON oi.product_id = p.product_id
            WHERE o.user_id IN ({placeholders})
            AND o.status = 'completed'
            AND p.is_active = 1
        """
        
        params = list(user_ids)
        
        if exclude_product_id:
            query += " AND oi.product_id != %s"
            params.append(exclude_product_id)
        
        query += """
            GROUP BY oi.product_id, p.name, p.category_id
            ORDER BY purchase_count DESC
        """
        
        return self.db.execute_query(query, tuple(params))
    
    def get_recommendations(self, product_id, top_n=5):
        """
        Gợi ý dựa trên "Người mua sản phẩm này cũng mua"
        
        Args:
            product_id: ID sản phẩm
            top_n: Số lượng gợi ý
        
        Returns:
            List[dict]: [{product_id, name, score, reason}, ...]
        """
        #  Tìm user đã mua sản phẩm này
        similar_users = self.get_users_who_bought(product_id)
        
        if not similar_users:
            print(f"  Chưa có user nào mua product_id={product_id}")
            return []
        
        print(f" Tìm thấy {len(similar_users)} user đã mua sản phẩm này")
        
        #  Lấy sản phẩm khác mà họ đã mua
        products = self.get_products_bought_by_users(
            similar_users, 
            exclude_product_id=product_id
        )
        
        if not products:
            return []
        
        #  Tính điểm (dựa trên tần suất mua)
        max_count = products[0]['purchase_count'] if products else 1
        
        recommendations = []
        for product in products[:top_n]:
            # Normalize score về 0-1
            score = product['purchase_count'] / max_count
            
            recommendations.append({
                'product_id': product['product_id'],
                'name': product['name'],
                'category_id': product['category_id'],
                'collaborative_score': round(score, 3),
                'bought_by': product['purchase_count'],
                'reason': f"{product['purchase_count']} người cũng mua"
            })
        
        return recommendations
    
    def close(self):
        """Đóng kết nối"""
        self.db.disconnect()


# # ===============================================
# # TEST SCRIPT
# # ===============================================
# if __name__ == "__main__":
#     print("=" * 60)
#     print(" TEST COLLABORATIVE FILTERING")
#     print("=" * 60)
    
#     recommender = CollaborativeRecommender()
    
#     # Test với Latte Classic (product_id=13)
#     test_product_id = 13
#     print(f"\n Tìm 'Người khác cũng mua' cho: product_id={test_product_id}")
    
#     recommendations = recommender.get_recommendations(test_product_id, top_n=5)
    
#     if recommendations:
#         print(f"\n Top 5 sản phẩm 'Người khác cũng mua':")
#         print("-" * 60)
#         for i, item in enumerate(recommendations, 1):
#             print(f"{i}. {item['name']}")
#             print(f"   Score: {item['collaborative_score']:.3f} | {item['reason']}")
#     else:
#         print("\n  Chưa có dữ liệu đủ để gợi ý")
    
#     recommender.close()
#     print("\n" + "=" * 60)