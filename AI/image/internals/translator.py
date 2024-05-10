from google.cloud import translate_v2 as translate

from config.config import settings


class Translator:
    def translate(self, texts: list) -> list:
        text = ",".join(texts)
        result = self._translate_text(settings.target_language_code, text)
        return list(map(lambda x: x.strip(), result.split(',')))

    def _translate_text(self, target: str, text: str) -> str:
        translate_client = translate.Client()

        if isinstance(text, bytes):
            text = text.decode("utf-8")
        result = translate_client.translate(text, target_language=target)
        return result["translatedText"]


translator = Translator()
