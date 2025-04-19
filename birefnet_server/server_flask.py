# app.py
from flask import Flask, request, send_file, jsonify
from PIL import Image,ImageDraw,ImageFilter,ImageChops
import io
import torch
from torchvision import transforms
from transformers import AutoModelForImageSegmentation
from image_proc import refine_foreground  # assumes your refine_foreground is working
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ======== Load BiRefNet once on startup ========
model_name = 'BiRefNet'
device = 'cuda' if torch.cuda.is_available() else 'cpu'

print('Loading BiRefNet...')
birefnet = AutoModelForImageSegmentation.from_pretrained(f'zhengpeng7/{model_name}', trust_remote_code=True)
birefnet.to(device)
birefnet.eval()
birefnet.half()
print('BiRefNet is ready.')

# ======== Transform setup ========
transform_image = transforms.Compose([
    transforms.Resize((1024, 1024)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# ======== Flask route ========
@app.route('/remove-bg', methods=['POST'])
def remove_background():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    try:
        image = Image.open(file).convert('RGB')
    except Exception as e:
        return jsonify({'error': f'Invalid image: {str(e)}'}), 400

    # Preprocess
    input_tensor = transform_image(image).unsqueeze(0).to(device).half()

    # Predict mask
    with torch.no_grad():
        mask_pred = birefnet(input_tensor)[-1].sigmoid().cpu()
    pred = mask_pred[0].squeeze()
    pred_pil = transforms.ToPILImage()(pred)
    pred_pil = pred_pil.resize(image.size)

    # Refine image and apply alpha mask
    image_masked = refine_foreground(image, pred_pil)
    image_masked.putalpha(pred_pil)

    # Save to memory buffer
    buf = io.BytesIO()
    image_masked.save(buf, format='PNG')
    buf.seek(0)

    return send_file(buf, mimetype='image/png')

@app.route('/add-border', methods=['POST'])
def add_border():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    border_color = request.form.get('border_color', '#FF0000')  # Default red
    border_thickness = int(request.form.get('border_thickness', 5))
    print(border_color)
    print(border_thickness)
    file = request.files['image']
    
    try:
        image = Image.open(file).convert('RGBA')
    except Exception as e:
        return jsonify({'error': f'Invalid image: {str(e)}'}), 400
    if image:
        alpha = image.getchannel('A')
        # Create a mask of edges using dilation
        edge_mask = alpha.filter(ImageFilter.MaxFilter(border_thickness * 2 + 1))
        edge_only = ImageChops.difference(edge_mask, alpha)

        # Convert color to RGB tuple
        rgb = Image.new('RGB', image.size, border_color).convert('RGBA')
        border_layer = Image.new('RGBA', image.size)
        border_layer.paste(rgb, mask=edge_only)

        # Composite border layer below the main image
        image.alpha_composite(border_layer)
        
        buf = io.BytesIO()
        image.save(buf, format='PNG')
        buf.seek(0)
        return send_file(buf, mimetype='image/png')

# ======== Run app ========
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000,debug=True)