"""
Flask API Server cho hệ thống gợi ý
"""
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from hybrid import HybridRecommender
import os
from dotenv import load_dotenv

# THÊM 2 DÒNG NÀY VÀO ĐẦU FILE
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/..')  # Thêm src vào path

load_dotenv()

app = Flask(__name__)
CORS(app)  # Cho phép Node.js backend gọi API này

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Kiểm tra API có hoạt động không"""
    return jsonify({
        'status': 'ok',
        'message': 'AI Recommendation API is running',
        'version': '1.0.0'
    })

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    Endpoint chính: Gợi ý sản phẩm
    
    Request body:
    {
        "user_id": 8,
        "product_id": 13,
        "top_n": 6
    }
    
    Response:
    {
        "success": true,
        "recommendations": [...],
        "method_used": "hybrid",
        "user_order_count": 5
    }
    """
    try:
        # Lấy data từ request
        data = request.get_json()
        
        user_id = data.get('user_id')
        product_id = data.get('product_id')
        top_n = data.get('top_n', 6)
        
        # Validate
        if not user_id or not product_id:
            return jsonify({
                'success': False,
                'message': 'Missing user_id or product_id'
            }), 400
        
        # Gọi AI recommender
        recommender = HybridRecommender()
        result = recommender.get_recommendations(
            user_id=user_id,
            product_id=product_id,
            top_n=top_n
        )
        recommender.close()
        
        # Trả về kết quả
        return jsonify({
            'success': True,
            'recommendations': result['recommendations'],
            'method_used': result['method_used'],
            'user_order_count': result['user_order_count'],
            'count': len(result['recommendations'])
        })
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/similar-products', methods=['POST'])
def get_similar_products():
    """
    Endpoint phụ: Chỉ lấy sản phẩm tương tự (Content-Based)
    
    Request body:
    {
        "product_id": 13,
        "top_n": 5
    }
    """
    try:
        data = request.get_json()
        product_id = data.get('product_id')
        top_n = data.get('top_n', 5)
        
        if not product_id:
            return jsonify({
                'success': False,
                'message': 'Missing product_id'
            }), 400
        
        from src.similarity import ContentBasedRecommender
        recommender = ContentBasedRecommender()
        results = recommender.get_similar_products(product_id, top_n)
        recommender.close()
        
        return jsonify({
            'success': True,
            'recommendations': results,
            'count': len(results)
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    print("=" * 60)
    print(f"🚀 Starting AI Recommendation API")
    print(f"   Port: {port}")
    print(f"   Debug: {debug}")
    print("=" * 60)
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )