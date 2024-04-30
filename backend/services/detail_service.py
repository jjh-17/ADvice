from functools import reduce

from models.detail_request import DetailRequest
from internals.detail_evaluation import AdEvaluation


class DetailService:
    def __init__(self):
        self.__detail_evaluation = AdEvaluation()

    async def evaluate(self, data: DetailRequest):
        return {"adDetection": await self.evaluate_ad(data)}

    async def evaluate_ad(self, data: DetailRequest):
        text = [
            {"id": tag.id, "data": tag.data} for tag in data.script if tag.type == "txt"
        ]

        if len(text) < 1:
            return []

        paragraph = "".join(reduce(lambda x, y: x + y, map(lambda x: x["data"], text)))
        sentence, result = self.__detail_evaluation.paragraph_ad(paragraph)

        return self.seperate_sentences(sentence, result, text)

    def seperate_sentences(self, sentence, result, text):
        # 1. 문장 저장
        # 2. 문장 종료 시 good or bad 저장
        # 3. 태그 종료 시 각각 list에 extends

        res = {"goodList": [], "badList": []}

        sentence_row, sentence_col = 0, 0
        text_row, text_col = 0, 0

        buffer = ""
        good_list, bad_list = [], []

        while sentence_row < len(sentence) and text_row < len(text):
            if sentence[sentence_row][sentence_col] == text[text_row]["data"][text_col]:
                buffer += sentence[sentence_row][sentence_col]
                text_col += 1
            sentence_col += 1

            # 문장이 종료된 경우 => 평가가 변경됨
            if sentence_col >= len(sentence[sentence_row]):
                if result[sentence_row] == 1:
                    bad_list.append(buffer)
                else:
                    good_list.append(buffer)
                buffer = ""

                sentence_col = 0
                sentence_row += 1

            # 태그가 종료된 경우 => id가 변경됨
            if text_col >= len(text[text_row]["data"]):
                if buffer:
                    if result[sentence_row] == 1:
                        bad_list.append(buffer)
                    else:
                        good_list.append(buffer)
                    buffer = ""

                if good_list:
                    res["goodList"].append(
                        {"id": text[text_row]["id"], "data": good_list}
                    )
                if bad_list:
                    res["badList"].append(
                        {"id": text[text_row]["id"], "data": bad_list}
                    )
                good_list, bad_list = [], []

                text_col = 0
                text_row += 1

        return res
