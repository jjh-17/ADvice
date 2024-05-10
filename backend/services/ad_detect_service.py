from models.exception.custom_exception import CustomException
from models.detail_request import DetailRequest


class AdDetectService:
    async def detect_text_ad(self, data: DetailRequest):
        raise CustomException("Not Implemented")

    async def detect_image_ad(self, data: DetailRequest):
        raise CustomException("Not Implemented")


ad_detect_service = AdDetectService()
