import openai

openai.api_key = "sk-proj-sN3sId7A1dkax6xRWcpiT3BlbkFJDIo3PG7kl8MESIYnpTNY"

class SummaryService:

    def summarize(self, text):
        system_instruction = "assitant는 user의 입력을 bullet point로 3줄 요약해준다."
        messages = [{"role": "system", "content": system_instruction},
                    {"role": "user", "content": text}
                    ]
        response = openai.ChatCompletion.create(model="gpt-4", messages=messages)
        gptResult = response['choices'][0]['message']['content']
        result = gptResult.splitlines()
        return result