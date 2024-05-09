from internals.context_analyzer import contextAnalyzer
from internals.image_context_extractor import contextExtractor
from internals.image_filter_detection import imageAnalyzer
from internals.image_human_detector import humanCounter
from internals.keyword_extractor import keywordExtractor


class ImageDetectionService:
    def context_analyze(self, image_paths: list, texts: list):
        evaluation = []
        for image_path in image_paths:
            keywords = keywordExtractor.extract_keyword(texts)
            labels = contextExtractor.extract_label_from_image(image_path)
            result = contextAnalyzer.analyze(keywords, labels)
            evaluation.append(result)
        return evaluation

    def human_detection(self, image_paths: list):
        counts = humanCounter.count_objects_in_images(image_paths, 0)
        if len(counts) > 0:
            ratio = sum(counts) / len(counts)
            if ratio > 0.2:
                return 0
            else:
                return 1
        return -1

    def filter_detection(self, image_paths: list):
        results = imageAnalyzer.filter_detect(image_paths)
        evaluation = []
        for contrast, edge_strength, laplacian in results:
            if (contrast, edge_strength, laplacian) is not None:
                sum = contrast + edge_strength + laplacian
                print(contrast, edge_strength, laplacian)
                if sum < 4:
                    evaluation.append(0)
                elif sum < 8:
                    evaluation.append(1)
                else:
                    evaluation.append(2)
            else:
                evaluation.append(-1)
        return evaluation


imageService = ImageDetectionService()
