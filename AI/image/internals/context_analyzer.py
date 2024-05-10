from gensim.models import FastText

from config.config import settings


class ContextAnalyzer:
    def __init__(self):
        self.model = FastText.load_fasttext_format(settings.fasttext_model_path)

    def analyze(self, keywords: list, labels: list) -> list:
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
