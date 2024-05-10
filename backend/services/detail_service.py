from functools import reduce
from kss import split_sentences
import asyncio

from models.detail_request import DetailRequest
from internals.ad_evaluation import AdEvaluation


class DetailService:
    def __init__(self):
        self._ad_evaluation = AdEvaluation()

    async def evaluate(self, data: DetailRequest):
        # tag 데이터
        tag = [
            {"id": tag.id, "data": tag.data.replace("\u200B", ""), "type": tag.type}
            for tag in data.script
        ]

        # text 태그 추출
        text = list(filter(lambda item: item["type"] == "txt", tag))

        paragraphs = self.__make_paragraph(text)
        sentences = self.__make_sentences(paragraphs)

        keys = ["adDetection"]
        tasks = [self.evaluate_ad(text, sentences)]
        results = await asyncio.gather(*tasks)

        return dict(zip(keys, results))

    async def evaluate_ad(self, text, sentences):
        result = await self._ad_evaluation.evaluate_ad(sentences)
        return self.seperate_sentences(sentences, result, text)

    def __make_paragraph(self, data):
        if len(data) < 1:
            return ""

        paragraph = "".join(reduce(lambda x, y: x + y, map(lambda x: x["data"], data)))
        return paragraph

    def __make_sentences(self, paragraph: str):
        sentences = split_sentences(paragraph)
        return sentences

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
            if len(text[text_row]["data"]) < 1:
                text_row += 1
                continue

            if len(sentence[sentence_row]) < 1:
                sentence_row += 1
                continue

            if sentence[sentence_row][sentence_col] == text[text_row]["data"][text_col]:
                buffer += sentence[sentence_row][sentence_col]
                sentence_col += 1
            text_col += 1

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
