import pandas as pd
from ultralytics import YOLO

from config.config import settings


class ImageHumanCounter:
    def __init__(self):
        self.model = YOLO(settings.yolo_model_path)

    def count_objects_in_images(self, image_paths: list, object_class_number: int) -> list:
        results = self.model(image_paths)
        counts = []
        for result in results:
            count = 0
            detected_data = result.boxes.data
            px = pd.DataFrame(detected_data).astype("float")

            for index, row in px.iterrows():
                if row[5] == object_class_number:
                    count += 1
            counts.append(count)
        return counts


humanCounter = ImageHumanCounter()
