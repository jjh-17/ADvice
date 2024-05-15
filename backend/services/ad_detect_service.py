import requests
import json
import asyncio

from config.config import settings
from models.detail_request import DetailRequest
from models.detail_response import DetailResponse, Score
from internals.detail_service import detail_service


class AdDetectService:
    async def detect_text_ad(self, data: DetailRequest):
        paragraphs = detail_service.get_paragraphs(data)

        results = []
        for paragraph in paragraphs:
            sentences = detail_service.get_sentence("".join(paragraph["data"]))
            # 공백 문단 제거
            if type(sentences) != list or len(sentences) < 1:
                continue

            results.append(self.call_text_ad_detection(sentences))

        ret = [
            Score(id=paragraph["id"], score=sum(result) / len(result))
            for paragraph, result in zip(paragraphs, await asyncio.gather(*results))
        ]

        return DetailResponse(result=ret)

    async def call_text_ad_detection(self, sentences):
        return requests.post(
            url=settings.text_ad_host + "/ad-evaluate", data=json.dumps(sentences)
        ).json()

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
        print(paragraphs)

        results = []
        for paragraph in paragraphs:
            sentences = detail_service.get_sentence("".join(paragraph["data"]))
            # 공백 문단 제거
            if type(sentences) != list or len(sentences) < 1:
                continue

            results.append(self.call_text_ad_detection(sentences))

        ret = [
            Score(id=paragraph["id"], score=sum(result) / len(result))
            for paragraph, result in zip(paragraphs, await asyncio.gather(*results))
        ]

        return DetailResponse(result=ret)

    async def call_objective_info(self, sentences):
        return requests.post(
            url=settings.text_ad_host + "/info-evaluate", data=json.dumps(sentences)
        ).json()


ad_detect_service = AdDetectService()
