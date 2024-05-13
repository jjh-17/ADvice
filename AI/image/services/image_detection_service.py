from internals.context_analyzer import contextAnalyzer
from internals.image_context_extractor import contextExtractor
from internals.image_filter_detection import imageAnalyzer
from internals.image_human_detector import humanCounter
from internals.keyword_extractor import keywordExtractor
from internals.translator import translator
from models.exception.custom_exception import CustomException


class ImageDetectionService:
    def context_analyze(self, image_paths: list, texts: list):
        if not texts:
            raise CustomException(400, "text is empty")
        elif not image_paths:
            raise CustomException(400, "image_path is empty")
        keywords = keywordExtractor.extract_keyword(texts)
        translated = translator.translate(keywords)

        evaluation = []
        for image_path in image_paths:
            score = 0
            labels = contextExtractor.extract_label_from_image(image_path)
            result = contextAnalyzer.analyze(translated, labels)
            for similarity in result:
                score += max(similarity)

            if score > 3:
                evaluation.append(0)
            elif score > 1:
                evaluation.append(1)
            else:
                evaluation.append(2)
        return evaluation

    def human_detection(self, image_paths: list):
        if not image_paths:
            raise CustomException(400, "image_path is empty")
        counts = humanCounter.count_objects_in_images(image_paths, 0)
        if len(counts) > 0:
            ratio = sum(counts) / len(counts)
            if ratio > 0.2:
                return 0
            else:
                return 1
        return -1

    def filter_detection(self, image_paths: list):
        if not image_paths:
            raise CustomException(400, "image_path is empty")
        results = imageAnalyzer.filter_detect(image_paths)
        evaluation = []
        for contrast, edge_strength, laplacian in results:
            if (contrast, edge_strength, laplacian) is not None:
                total = contrast + edge_strength + laplacian
                if total < 4:
                    evaluation.append(0)
                elif total < 8:
                    evaluation.append(1)
                else:
                    evaluation.append(2)
            else:
                evaluation.append(-1)
        return evaluation


imageService = ImageDetectionService()
