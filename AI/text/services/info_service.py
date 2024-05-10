from internals.text_analyzer import infoDetector


class InfoService:
    def detail_info_detection(self, texts: list):
        return infoDetector.detect(texts)


infoService = InfoService()
