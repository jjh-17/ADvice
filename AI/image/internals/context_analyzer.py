from gensim.models import FastText

from config.config import settings
from models.exception.custom_exception import CustomException


class ContextAnalyzer:
    def __init__(self):
        self.model = FastText.load_fasttext_format(settings.fasttext_model_path)

    def analyze(self, keywords: list, labels: list) -> list:
        if not keywords:
            raise CustomException(500, "No keywords provided")
        if not labels:
            return [0]

        results = []
        for label in labels:
            similarities = []
            for keyword in keywords:
                similarity = self.model.wv.similarity(label, keyword)
                if similarity > 0.25:
                    similarities.append(1)
                else:
                    similarities.append(0)
            results.append(similarities)
        return results


contextAnalyzer = ContextAnalyzer()
