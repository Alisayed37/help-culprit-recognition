import torch
from transformers import CLIPModel, CLIPProcessor

class ModelManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance.models = {}
            cls._instance.processor = None
            # Automatically use GPU if available, otherwise CPU
            cls._instance.device = "cuda" if torch.cuda.is_available() else "cpu"
        return cls._instance

    def load_models(self):
        print(f"Loading models to {self.device}...")
        self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        
        # Point these to the folders you downloaded from Kaggle
        model_paths = {
            "epoch_0": "openai/clip-vit-base-patch32",
            "epoch_3": "./models/epoch_3",
            "epoch_4": "./models/epoch_4",
            "epoch_6": "./models/epoch_6",
            "epoch_8": "./models/epoch_8"
        }
        
        for version, path in model_paths.items():
            try:
                print(f"Loading {version}...")
                model = CLIPModel.from_pretrained(path).to(self.device)
                model.eval() # Lock the weights for inference
                self.models[version] = model
            except Exception as e:
                print(f"Warning: Could not load {version}. Error: {e}")
                
        print("[SUCCESS] All requested models loaded successfully!")

    def get_model(self, version):
        return self.models.get(version)

    def get_processor(self):
        return self.processor

# Create the single instance
manager = ModelManager()