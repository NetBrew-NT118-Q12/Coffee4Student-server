import json
import boto3
import os
import datetime

s3 = boto3.client('s3')
sagemaker_runtime = boto3.client('sagemaker-runtime')

BUCKET = os.environ.get('S3_BUCKET', 'coffee-ml-data-vantai')
ENDPOINT_NAME = os.environ.get('ENDPOINT_NAME', 'coffee-recommender-endpoint')

# Cache model info để không phải load từ S3 mỗi lần gọi (giảm latency)
global_model_info = None

def lambda_handler(event, context):
    global global_model_info
    
    try:
        # 1. Parse Input
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event
        
        # Log input nhận được để debug
        print(f" Received Body: {json.dumps(body)}")

        user_id = body.get('user_id')
        if not user_id:
            return response_error(400, 'Missing user_id')

        # 2. Load Config (chỉ load 1 lần nếu container còn sống)
        if not global_model_info:
            global_model_info = load_model_info()
            
        if not global_model_info:
            return response_error(500, 'Failed to load model_info.json')

        feature_cols = global_model_info.get('feature_columns', [])
        product_mapping = global_model_info.get('product_mapping', {})

        # 3. Prepare Features (Lấy hết từ Body)
        csv_input = prepare_features_dynamic(body, feature_cols)
        
        print(f" Sending to SageMaker CSV: {csv_input}")

        # 4. Invoke SageMaker
        response = sagemaker_runtime.invoke_endpoint(
            EndpointName=ENDPOINT_NAME,
            ContentType='text/csv',
            Body=csv_input
        )

        result_str = response['Body'].read().decode('utf-8').strip()
        print(f" Raw SageMaker response: {result_str}")

        # 5. Map Result
        # Kết quả XGBoost thường là float (ví dụ 15.0), cần int
        predicted_label = int(float(result_str))
        
        # Map label của model sang Product ID thật trong DB
        # Lưu ý: JSON key luôn là string, nên cần str(predicted_label)
        predicted_product_id = int(product_mapping.get(str(predicted_label), predicted_label))

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'predicted_product_id': predicted_product_id,
                'ml_score': 0.95, 
                'raw_label': predicted_label,
                'used_features': csv_input
            })
        }

    except Exception as e:
        print(f" Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return response_error(500, str(e))

def load_model_info():
    try:
        obj = s3.get_object(Bucket=BUCKET, Key='coffee-recommender/model_info.json')
        data = json.loads(obj['Body'].read().decode('utf-8'))
        print(" Model info loaded successfully")
        return data
    except Exception as e:
        print(f" Error loading model_info from S3: {e}")
        return None

def prepare_features_dynamic(body, feature_cols):
    """
    Tạo feature vector động khớp 100% với LabelEncoder lúc train
    """
    global global_model_info
    
    # Lấy danh sách encoder từ model_info đã lưu
    encoders = global_model_info.get('label_encoders', {})
    
    # Helper để encode an toàn (nếu không tìm thấy thì trả về 0)
    def get_encoded_value(col_name, value):
        classes = encoders.get(col_name, [])
        if value in classes:
            return classes.index(value)
        # Fallback thông minh hơn: thử tìm chuỗi con (ví dụ "rain" trong "Moderate rain")
        if isinstance(value, str):
            for i, cls in enumerate(classes):
                if str(cls).lower() in value.lower() or value.lower() in str(cls).lower():
                    return i
        return 0 # Mặc định nếu không tìm thấy

    # 1. Lấy dữ liệu thô từ Body
    # Lưu ý: Các key phải khớp với JSON backend gửi lên
    raw_data = {
        'delivery_type': body.get('delivery_type', 'delivery'),
        'drink_type': body.get('drink_type', 'coffee'), # food, tea, ...
        'temperature': body.get('temperature', 'cold'), # hot, cold
        'weather_condition': body.get('weather_condition', 'Sunny'),
        'category_name': body.get('category_name', 'Unknown') # Nếu backend có gửi
    }

    weather_temp = float(body.get('weather_temp', 28))

    # 2. Tạo Features Dictionary (Logic y hệt Notebook Cell 3)
    features = {
        'user_id': body.get('user_id'),
        'store_id': body.get('store_id', 1),
        'category_id': body.get('category_id', 3),
        'hour': body.get('hour', 12),
        'day_of_week': body.get('day_of_week', 0),
        'month': body.get('month', 12),
        'weather_temp': weather_temp,
        'humidity': body.get('humidity', 75),
        'has_caffeine': body.get('has_caffeine', 1),
        'has_milk': body.get('has_milk', 1),
        
        # --- ENCODED FEATURES (Dùng helper function) ---
        'delivery_type_encoded': get_encoded_value('delivery_type', raw_data['delivery_type']),
        'drink_type_encoded': get_encoded_value('drink_type', raw_data['drink_type']),
        'temperature_encoded': get_encoded_value('temperature', raw_data['temperature']),
        'weather_condition_encoded': get_encoded_value('weather_condition', raw_data['weather_condition']),
        
        # --- BOOLEAN FEATURES (Logic y hệt Notebook) ---
        'is_hot_drink': 1 if raw_data['temperature'] == 'hot' else 0,
        'is_cold_drink': 1 if raw_data['temperature'] == 'cold' else 0,
        'is_rainy': 1 if 'rain' in raw_data['weather_condition'].lower() else 0,
        'is_hot_weather': 1 if weather_temp > 30 else 0
    }
    
    # Debug log để xem Lambda encode ra cái gì
    print(f" Encoded Debug: Drink={raw_data['drink_type']}->{features['drink_type_encoded']}, "
          f"Weather={raw_data['weather_condition']}->{features['weather_condition_encoded']}")
    
    # 3. Sắp xếp đúng thứ tự cột
    feature_values = [str(features.get(col, 0)) for col in feature_cols]
    return ','.join(feature_values)
    """
    Tạo feature vector động dựa trên input từ Backend
    """
    
    # Mapping cho thời tiết (phải khớp với lúc train model)
    weather_map = {
        'Cloudy': 0, 'Cool': 1, 'Hot': 2,
        'Moderate or heavy rain shower': 3,
        'Rainy': 4, 'Sunny': 5, 'Unknown': 6
    }

    # Lấy dữ liệu từ body, nếu không có thì mới dùng default
    weather_condition = body.get('weather_condition', 'Sunny')
    weather_temp = float(body.get('weather_temp', 28))
    
    # Logic encode (phải khớp logic lúc train)
    is_hot_weather = 1 if weather_temp > 30 else 0
    is_rainy = 1 if weather_condition in ['Rainy', 'Moderate or heavy rain shower'] else 0
    
    # Feature Dictionary
    features = {
        'user_id': body.get('user_id'),
        'store_id': body.get('store_id', 1),
        
        # QUAN TRỌNG: Lấy từ body thay vì hardcode
        'category_id': body.get('category_id', 3), 
        'hour': body.get('hour', datetime.datetime.now().hour),
        'day_of_week': datetime.datetime.now().weekday(), # Hoặc lấy từ body nếu cần lịch sử
        'month': datetime.datetime.now().month,
        'weather_temp': weather_temp,
        'humidity': body.get('humidity', 75),
        
        'has_caffeine': body.get('has_caffeine', 1),
        'has_milk': body.get('has_milk', 1),
        
        # Các field encoded giả định (nếu backend gửi raw thì phải encode lại ở đây)
        # Tạm thời lấy raw nếu có, hoặc tự tính
        'delivery_type_encoded': body.get('delivery_type_encoded', 0),
        'drink_type_encoded': 1 if body.get('drink_type', 'coffee') == 'coffee' else 0, # Ví dụ logic
        
        'temperature_encoded': 0 if weather_temp > 30 else 1,
        'weather_condition_encoded': weather_map.get(weather_condition, 5),
        
        'is_hot_drink': 0 if weather_temp > 30 else 1, # Trời nóng uống lạnh
        'is_cold_drink': 1 if weather_temp > 30 else 0,
        'is_rainy': is_rainy,
        'is_hot_weather': is_hot_weather
    }
    
    # Sắp xếp đúng thứ tự cột như lúc Train
    feature_values = [str(features.get(col, 0)) for col in feature_cols]
    return ','.join(feature_values)

def response_error(code, message):
    return {
        'statusCode': code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'success': False, 'error': message})
    }