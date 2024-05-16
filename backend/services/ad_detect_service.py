import requests
import json
import asyncio

from config.config import settings
from models.detail_request import DetailRequest
from models.detail_response import Type, TypeResponse, Score, ScoreResponse
from internals.detail_service import detail_service


class AdDetectService:
    def __init__(self):
        self._ad_types = ["광고 X", "업체 협찬이 명시된 멘트", "영업성 멘트", "과도한 상세 정보"]

    async def detect_text_ad(self, data: DetailRequest):
        paragraphs = detail_service.get_paragraphs(data)

        tasks = []
        for paragraph in paragraphs:
            sentences = detail_service.get_sentence("".join(paragraph["data"]))
            # 공백 문단 제거
            if type(sentences) != list or len(sentences) < 1:
                continue

            tasks.append(self.call_text_ad_detection(sentences))

        results = []
        for p in await asyncio.gather(*tasks):
            tmp = [0 for _ in range(len(self._ad_types))]

            for idx in range(len(p["prediction"])):
                tmp[idx] += p["score"][idx]

            sorted_result = sorted(
                zip(
                    [i for i in range(len(self._ad_types))],
                    list(map(lambda x: x / len(p["prediction"]), tmp)),
                ),
                key=lambda x: x[1],
            )

            results.append(sorted_result[-1])

        ret = [
            Type(id=paragraph["id"], type=self._ad_types[result[0]])
            for paragraph, result in zip(paragraphs, results)
            if result[0] != 0
        ]

        return TypeResponse(result=ret)

    async def call_text_ad_detection(self, sentences):
        res = requests.post(
            url=settings.text_ad_host + "/ad-evaluate", data=json.dumps(sentences)
        )

        if res.status_code // 100 != 2 or not res.text:
            return [0 for _ in range(len(sentences))]

        return res.json()

    async def detect_image_ad(self, data):
        paragraphs = detail_service.get_paragraphs(data)
        text = "".join(["".join(paragraph["data"]) for paragraph in paragraphs])

        sentence = detail_service.get_sentence(text)
        image_tag, images = detail_service.get_images(data)

        tasks = [
            self.call_context_detection(images, sentence),
            self.call_filter_detection(images),
            self.call_human_detection(images),
        ]

        score = [0 for _ in range(len(images))]
        results = await asyncio.gather(*tasks)

        for idx in range(2):
            if type(results[idx]) is not list:
                results[idx] = [0 for _ in range(len(images))]

        if type(results[-1]) is not int:
            results[-1] = 0

        score = [
            curr + result1 + result2 + results[2]
            for curr, result1, result2 in zip(score, results[0], results[1])
        ]

        return [
            {"id": tag_id.id, "score": result}
            for tag_id, result in zip(image_tag, score)
        ]

    async def call_context_detection(self, images, sentences):
        return requests.post(
            url=settings.image_ad_host + "/context-detection",
            json={"path": images, "text": sentences},
        ).json()

    async def call_filter_detection(self, images):
        return requests.post(
            url=settings.image_ad_host + "/filter-detection",
            json=images,
        ).json()

    async def call_human_detection(self, images):
        return requests.post(
            url=settings.image_ad_host + "/human-detection",
            json=images,
        ).json()

    async def is_objective_info(self, data: DetailRequest):
        paragraphs = detail_service.get_paragraphs(data)

        tasks = []
        for paragraph in paragraphs:
            sentences = detail_service.get_sentence("".join(paragraph["data"]))
            # 공백 문단 제거
            if type(sentences) != list or len(sentences) < 1:
                continue

            tasks.append(self.call_text_ad_detection(sentences))

        results = []
        for prediction in await asyncio.gather(*tasks):
            score = 0

            for idx in range(len(prediction["prediction"])):
                if prediction["prediction"][idx] > 0:
                    score += prediction["score"][idx]

            results.append(score / len(prediction["prediction"]))

        ret = [
            Score(id=paragraph["id"], score=score)
            for paragraph, score in zip(paragraphs, results)
            if score > 0
        ]

        return ScoreResponse(result=ret)

    async def call_objective_info(self, sentences):
        res = requests.post(
            url=settings.text_ad_host + "/info-evaluate", data=json.dumps(sentences)
        )

        if res.status_code // 100 != 2 or not res.text:
            return [0 for _ in range(len(sentences))]

        return res.json()


ad_detect_service = AdDetectService()
