import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from config.config import settings


class InfoDetection:
    def __init__(self):
        self.device = torch.device('cpu')
        self.model = (AutoModelForSequenceClassification.from_pretrained(settings.info_detection_model_path, num_labels=2, )
                      .to(self.device))
        self.tokenizer = AutoTokenizer.from_pretrained(settings.pretrained_tokenizer)

    def detect(self, text):
        return evaluate_texts(text, self.tokenizer, self.device, self.model)


class TextAdDetection:
    def __init__(self):
        self.device = torch.device('cpu')
        self.model = (AutoModelForSequenceClassification.from_pretrained(settings.ad_detection_model_path, num_labels=2)
                      .to(self.device))
        self.tokenizer = AutoTokenizer.from_pretrained(settings.pretrained_tokenizer)

    def detect_texts(self, text: list) -> list:
        return evaluate_texts(text, self.tokenizer, self.device, self.model)

    def detect_sentence(self, text: str) -> int:
        return sentence_predict(text, self.tokenizer, self.device, self.model)


def evaluate_texts(texts, tokenizer, device, model):
    results = []
    for text in texts:
        result = sentence_predict(text, tokenizer, device, model)
        print(text, " ad prediction : ", bool(result))
        results.append(result)
        # results.append(sentence_predict(text, tokenizer, device, model))
    return results


def sentence_predict(sentence, tokenizer, device, model):
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
    return 1 if logits.argmax(-1) == 1 else 0


infoDetector = InfoDetection()
adDetector = TextAdDetection()
