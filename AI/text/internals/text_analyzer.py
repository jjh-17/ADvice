import numpy as np
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from config.config import settings


class InfoDetection:
    def __init__(self):
        self.device = torch.device('cpu')
        self.model = (AutoModelForSequenceClassification.from_pretrained(settings.info_detection_model_path, num_labels=2)
                      .to(self.device))
        self.tokenizer = AutoTokenizer.from_pretrained(settings.pretrained_kobert_tokenizer)

    def detect(self, text) -> tuple[list, list]:
        return evaluate_texts(text, self.tokenizer, self.device, self.model, False)


class TextAdDetection:
    def __init__(self):
        self.device = torch.device('cpu')
        self.model = (AutoModelForSequenceClassification.from_pretrained(settings.ad_detection_model_path, num_labels=4)
                      .to(self.device))
        self.tokenizer = AutoTokenizer.from_pretrained(settings.pretrained_electra_tokenizer)

    def detect_texts(self, text: list) -> tuple[list, list]:
        return evaluate_texts(text, self.tokenizer, self.device, self.model, True)

    def detect_sentence(self, text: str) -> tuple[int, float]:
        return KcELCETRA(text, self.tokenizer, self.device, self.model)


def evaluate_texts(texts, tokenizer, device, model, is_ad):
    types = []
    percentages = []

    if is_ad:
        for text in texts:
            type, percentage = KcELCETRA(text, tokenizer, device, model)
            print(text, " ad prediction : ", type)
            types.append(type)
            percentages.append(percentage)
    else:
        for text in texts:
            type, percentage = DistilKoBERT(text, tokenizer, device, model)
            print(text, " info prediction : ", type)
            types.append(type)
            percentages.append(percentage)
    return types, percentages


def DistilKoBERT(sentence, tokenizer, device, model) -> tuple[int, float]:
    model.eval()
    tokenized_sent = tokenizer(
        sentence,
        return_tensors="pt",
        truncation=True,
        add_special_tokens=True,
        max_length=128
    )

    tokenized_sent.to(device)

    with torch.no_grad():
        outputs = model(
            input_ids=tokenized_sent["input_ids"],
            attention_mask=tokenized_sent["attention_mask"]
        )

    logits = outputs[0]
    logits = logits.detach().cpu()
    return _get_class_percentage(logits)


def KcELCETRA(sentence, tokenizer, device, model) -> tuple[int, float]:
    model.eval()
    tokenized_sent = tokenizer(
        sentence,
        return_tensors="pt",
        truncation=True,
        add_special_tokens=True,
        max_length=128
    )

    tokenized_sent.to(device)

    with torch.no_grad():
        outputs = model(
            input_ids=tokenized_sent["input_ids"],
            attention_mask=tokenized_sent["attention_mask"],
            token_type_ids=tokenized_sent["token_type_ids"]
        )

    logits = outputs[0]
    logits = logits.detach().cpu()
    return _get_class_percentage(logits)


def _calculate_percentage(weights: np.array) -> float:
    max_value = np.max(weights[0])
    exp_weights = np.exp(weights - max_value)
    sum_exp_weights = np.sum(exp_weights)
    probabilities = (exp_weights / sum_exp_weights) * 100
    return probabilities


def _get_class_percentage(logit: np.array) -> tuple[int, float]:
    result_class = int(logit.argmax(-1))

    probabilities = _calculate_percentage(logit.numpy())
    max_percentage = np.max(probabilities)
    result_percentage = np.trunc(max_percentage * 100) / 100
    result_percentage = float(result_percentage)
    return result_class, result_percentage


infoDetector = InfoDetection()
adDetector = TextAdDetection()
