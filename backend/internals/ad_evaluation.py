from models.exception.custom_exception import CustomException


class AdEvaluation:
    async def evaluate_ad(self, data):
        raise CustomException("Not Implemented")
