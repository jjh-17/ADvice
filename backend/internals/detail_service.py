from functools import reduce
from kss import split_sentences
from typing import List, Any

from models.detail_request import DetailRequest


class DetailService:
    def get_paragraphs(self, data: DetailRequest):
        # tag 데이터
        tag_data = [
            {"id": tag.id, "data": tag.data.replace("\u200B", ""), "type": tag.type}
            for tag in data.script
        ]

        tag_id = ""
        tmp = []
        paragraphs = []
        for tag in tag_data:
            # 공백 문자로 이뤄진 태그 제거
            if len(tag["type"]) < 0:
                continue

            if tag["type"] == "img":
                # 이미지가 연속으로 나오는 경우 처리
                if len(tmp) > 0:
                    paragraphs.append({"id": tag_id, "data": tmp})
                    tmp = []
                continue

            # 문단 시작
            if len(tmp) < 1:
                tag_id = tag["id"]
            tmp.append(tag["data"])

        if len(tmp) > 0:
            paragraphs.append({"id": tag_id, "data": tmp})

        return paragraphs

    def get_sentence(self, paragraph):
        sentences = split_sentences(paragraph, strip=False)

        return sentences

    def get_images(self, data: DetailRequest):
        # 이미지 태그 추출
        image_tag = list(
            filter(
                lambda item: item.type == "img" and ".gif" not in item.data, data.script
            )
        )

        return image_tag, [image.data for image in image_tag]


detail_service = DetailService()
