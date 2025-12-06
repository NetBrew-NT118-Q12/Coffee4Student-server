"""
Hybrid Recommender: Kết hợp Content-Based + Collaborative Filtering
"""
from similarity import ContentBasedRecommender
from collaborative import CollaborativeRecommender
from database import Database

class HybridRecommender:
    def __init__(self):
        self.content_based = ContentBasedRecommender()
        self.collaborative = CollaborativeRecommender()
        self.db = Database()
        self.db.connect()
        
        self.content_weight = 0.6  
        self.collab_weight = 0.4  
    
    def get_user_order_count(self, user_id):
        """Đếm số đơn hàng hoàn thành của user"""
        query = """
            SELECT COUNT(*) as order_count
            FROM orders
            WHERE user_id = %s AND status = 'completed'
        """
        result = self.db.execute_query(query, (user_id,))
        return result[0]['order_count'] if result else 0
    
    def get_user_recent_orders(self, user_id, days=7):
        """Lấy sản phẩm user đã order gần đây (để loại bỏ)"""
        query = """
            SELECT DISTINCT oi.product_id
            FROM orderitems oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.user_id = %s 
            AND o.created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
        """
        result = self.db.execute_query(query, (user_id, days))
        return [row['product_id'] for row in result] if result else []
    
    def get_recommendations(self, user_id, product_id, top_n=6):
        """
        Gợi ý sản phẩm kết hợp 2 phương pháp
        
        Args:
            user_id: ID người dùng
            product_id: ID sản phẩm vừa order/xem
            top_n: Số lượng gợi ý
        
        Returns:
            dict: {
                'recommendations': [...],
                'method_used': 'hybrid/content/popular',
                'user_order_count': int
            }
        """
        #  Kiểm tra user có đủ lịch sử không
        order_count = self.get_user_order_count(user_id)
        print(f" User {user_id} có {order_count} đơn hàng")
        
        # Nếu user mới (<3 đơn), fallback về popularity
        if order_count < 3:
            print("  User mới, fallback về sản phẩm phổ biến")
            return {
                'recommendations': self._get_popular_products(top_n),
                'method_used': 'popular',
                'user_order_count': order_count
            }
        
        #  Lấy gợi ý từ Content-Based
        print("\n Chạy Content-Based...")
        content_results = self.content_based.get_similar_products(
            product_id, 
            top_n=top_n
        )
        
        # Lấy gợi ý từ Collaborative
        print(" Chạy Collaborative...")
        collab_results = self.collaborative.get_recommendations(
            product_id, 
            top_n=top_n
        )
        
        #  Merge kết quả
        merged = self._merge_results(content_results, collab_results)
        
        #  Lọc bỏ sản phẩm user đã order gần đây
        recent_products = self.get_user_recent_orders(user_id, days=7)
        filtered = [
            item for item in merged 
            if item['product_id'] not in recent_products
        ]
        
        # 6. Sắp xếp và lấy top N
        filtered.sort(key=lambda x: x['final_score'], reverse=True)
        
        return {
            'recommendations': filtered[:top_n],
            'method_used': 'hybrid',
            'user_order_count': order_count,
            'filtered_count': len(recent_products)
        }
    
    def _merge_results(self, content_results, collab_results):
        """
        Kết hợp kết quả từ 2 phương pháp
        
        Returns:
            List[dict]: Danh sách sản phẩm với điểm cuối cùng
        """
        # Tạo dict để merge
        merged_dict = {}
        
        # Thêm điểm từ Content-Based
        for item in content_results:
            pid = item['product_id']
            merged_dict[pid] = {
                'product_id': pid,
                'name': item['name'],
                'category_id': item['category_id'],
                'content_score': item['similarity_score'],
                'collab_score': 0.0
            }
        
        # Thêm điểm từ Collaborative
        for item in collab_results:
            pid = item['product_id']
            if pid in merged_dict:
                # Đã có từ content-based
                merged_dict[pid]['collab_score'] = item['collaborative_score']
            else:
                # Sản phẩm mới từ collaborative
                merged_dict[pid] = {
                    'product_id': pid,
                    'name': item['name'],
                    'category_id': item['category_id'],
                    'content_score': 0.0,
                    'collab_score': item['collaborative_score']
                }
        
        # Tính điểm cuối cùng
        results = []
        for pid, data in merged_dict.items():
            final_score = (
                data['content_score'] * self.content_weight +
                data['collab_score'] * self.collab_weight
            )
            
            results.append({
                'product_id': data['product_id'],
                'name': data['name'],
                'category_id': data['category_id'],
                'content_score': round(data['content_score'], 3),
                'collab_score': round(data['collab_score'], 3),
                'final_score': round(final_score, 3)
            })
        
        return results
    
    def _get_popular_products(self, top_n):
        """Fallback: Lấy sản phẩm phổ biến nhất"""
        query = """
            SELECT 
                p.product_id,
                p.name,
                p.category_id,
                COUNT(oi.order_item_id) as total_sold
            FROM products p
            JOIN orderitems oi ON p.product_id = oi.product_id
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.status = 'completed' 
            AND p.is_active = 1
            AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY p.product_id
            ORDER BY total_sold DESC
            LIMIT %s
        """
        results = self.db.execute_query(query, (top_n,))
        
        return [{
            'product_id': row['product_id'],
            'name': row['name'],
            'category_id': row['category_id'],
            'final_score': 0.9,  # Điểm giả để hiển thị
            'total_sold': row['total_sold']
        } for row in results] if results else []
    
    def close(self):
        """Đóng tất cả kết nối"""
        self.content_based.close()
        self.collaborative.close()
        self.db.disconnect()


# # ===============================================
# # TEST SCRIPT
# # ===============================================
# if __name__ == "__main__":
#     print("=" * 70)
#     print(" TEST HYBRID RECOMMENDER")
#     print("=" * 70)
    
#     recommender = HybridRecommender()
    
#     # Test với user_id=8, product_id=13
#     test_user_id = 8
#     test_product_id = 13
    
#     print(f"\n Gợi ý cho User {test_user_id} với Product {test_product_id}")
    
#     result = recommender.get_recommendations(
#         user_id=test_user_id,
#         product_id=test_product_id,
#         top_n=6
#     )
    
#     print(f"\n Kết quả:")
#     print(f"   Phương pháp: {result['method_used'].upper()}")
#     print(f"   Số đơn của user: {result['user_order_count']}")
#     if 'filtered_count' in result:
#         print(f"   Đã lọc: {result['filtered_count']} sản phẩm đã mua gần đây")
    
#     print(f"\n Top {len(result['recommendations'])} gợi ý:")
#     print("-" * 70)
    
#     for i, item in enumerate(result['recommendations'], 1):
#         print(f"{i}. {item['name']}")
#         if 'content_score' in item and 'collab_score' in item:
#             print(f"   Final: {item['final_score']:.3f} | "
#                   f"Content: {item['content_score']:.3f} | "
#                   f"Collab: {item['collab_score']:.3f}")
#         else:
#             print(f"   Score: {item.get('final_score', 0):.3f}")
    
#     recommender.close()
#     print("\n" + "=" * 70)