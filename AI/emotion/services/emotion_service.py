from typing import List
from services.text_emotion_prediction import TextEmotionPrediction
from models.exception.custom_exception import CustomException


class EmotionPredictionService:
    # 초기화
    def __init__(self):
        self.__text_emotion_prediction = TextEmotionPrediction()

    # 데이터 전처리 이후 감정 예측 수행
    async def predict_all(self, data: List[str]):
        # 전처리
        texts = [
            text.replace("\u200B", "")
            for text in data
        ]

        # 예측 시작
        results = await self.__predict(texts)

        # 반환
        keys = ["negative", "neutral", "positive"]
        return dict(zip(keys, results))

    # 예측
    async def __predict(self, texts):
        pos_list, neu_list, neg_list = [], [], []
        for text in texts:
            result = self.__text_emotion_prediction.sentence_predict(text)
            print(result)
            if result[0] >= 70:
                if result[1] == -1:
                    neg_list.append(text)
                elif result[1] == 0:
                    neu_list.append(text)
                elif result[1] == 1:
                    pos_list.append(text)
                else:
                    raise CustomException(400, "잘못된 모델 설정")
        return [neg_list, neu_list, pos_list]