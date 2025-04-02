from model_trainer import train_and_save_model
from api import app

if __name__ == "__main__":
    # Step 1: Train the model
    data_folder = "data"  
    model_file = "accident_model.joblib"
    train_and_save_model(data_folder, model_file)

    # Step 2: Start the API
    app.run(port=5000)
