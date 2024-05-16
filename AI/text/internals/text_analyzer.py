import numpy as np
import torch
from abc import ABC, abstractmethod
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from config.config import settings


class TextDetection(ABC):
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    @abstractmethod
    def detect_texts(self, text):
        pass

    @abstractmethod
    def detect_sentence(self, text):
        pass

    @abstractmethod
    def run(self, tokenized_sent, model):
        pass

    def evaluate_texts(self, texts, tokenizer, device, model) -> tuple[list, list]:
        types = []
        percentages = []

        for text in texts:
            classification, percentage = self.predict(self.run, text, tokenizer, device, model)
            types.append(classification)
            percentages.append(percentage)
        return types, percentages

    # run_model은 오버라이딩한 run 메서드가 작동됨
    def predict(self, run_model, sentence, tokenizer, device, model) -> tuple[int, float]:
        model.eval()
        tokenized_sent = tokenizer(
            sentence,
            return_tensors="pt",
            truncation=True,
            add_special_tokens=True,
            max_length=128
        )

        tokenized_sent.to(device)

        outputs = run_model(tokenized_sent, model)

        logits = outputs[0]
        logits = logits.detach().cpu()
        return self._get_class_percentage(logits)

    def _get_class_percentage(self, logit: np.array):
        result_class = int(logit.argmax(-1))

        probabilities = self._calculate_percentage(logit.numpy())
        max_percentage = np.max(probabilities)
        result_percentage = np.trunc(max_percentage * 100) / 100
        result_percentage = float(result_percentage)
        return result_class, result_percentage

    def _calculate_percentage(self, weights: np.array) -> float:
        max_value = np.max(weights[0])
        exp_weights = np.exp(weights - max_value)
        sum_exp_weights = np.sum(exp_weights)
        probabilities = (exp_weights / sum_exp_weights) * 100
        return probabilities


class InfoTextDetection(TextDetection):
    def __init__(self):
        super().__init__()
        self.model = (
            AutoModelForSequenceClassification.from_pretrained(settings.info_detection_model_path, num_labels=2)
            .to(self.device))
        self.tokenizer = AutoTokenizer.from_pretrained(settings.pretrained_kobert_tokenizer)

    def detect_texts(self, text) -> tuple[list, list]:
        return super().evaluate_texts(text, self.tokenizer, self.device, self.model)

    def detect_sentence(self, text: str):
        pass

    def run(self, tokenized_sent, model):
        with torch.no_grad():
            outputs = model(
                input_ids=tokenized_sent["input_ids"],
                attention_mask=tokenized_sent["attention_mask"]
            )
        return outputs


class TextAdTextDetection(TextDetection):
    def __init__(self):
        super().__init__()
        self.model = (AutoModelForSequenceClassification.from_pretrained(settings.ad_detection_model_path, num_labels=4)
                      .to(self.device))
        self.tokenizer = AutoTokenizer.from_pretrained(settings.pretrained_electra_tokenizer)

    def detect_texts(self, text: list) -> tuple[list, list]:
        return super().evaluate_texts(text, self.tokenizer, self.device, self.model)

    def detect_sentence(self, text: str) -> tuple[int, float]:
        return super().predict(self.run, text, self.tokenizer, self.device, self.model)

    def run(self, tokenized_sent, model):
        with torch.no_grad():
            outputs = model(
                input_ids=tokenized_sent["input_ids"],
                attention_mask=tokenized_sent["attention_mask"],
                token_type_ids=tokenized_sent["token_type_ids"]
            )
        return outputs


infoDetector = InfoTextDetection()
adDetector = TextAdTextDetection()
