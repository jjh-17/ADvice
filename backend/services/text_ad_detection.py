import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification


class TextAdDetection:
    def __init__(self):
        self.device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        self.model = AutoModelForSequenceClassification.from_pretrained(
            "./model/KcELECTRA_ad", num_labels=2
        ).to(self.device)
        self.tokenizer = AutoTokenizer.from_pretrained("beomi/KcELECTRA-base")

    def predict(self, texts):
        results = []
        for text in texts:
            results.append(self.sentence_predict(text))

        return results

    #  광고 o : 1, 광고 x : 0
    def sentence_predict(self, sentence):
        self.model.eval()
        tokenized_sent = self.tokenizer(
            sentence,
            return_tensors="pt",
            truncation=True,
            add_special_tokens=True,
            max_length=128,
        )

        tokenized_sent.to(self.device)

        with torch.no_grad():
            outputs = self.model(
                input_ids=tokenized_sent["input_ids"],
                attention_mask=tokenized_sent["attention_mask"],
                token_type_ids=tokenized_sent["token_type_ids"],
            )

        logits = outputs[0]
        logits = logits.detach().cpu()
        return 1 if logits.argmax(-1) == 1 else 0
