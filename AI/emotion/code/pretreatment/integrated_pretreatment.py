import json
import os
import openpyxl
import re

# input, output 폴더 경로
input_path = "./AI/emotion/data/input/"
output_path = "./AI/emotion/data/output/pretreated_data.xlsx"

# output 엑셀 파일 설정
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "data"
ws.append(["Text", "Emotion"])

# 감정이 태깅된 자유대화 데이터 전처리 함수
def freeConversation2data():
    # 화자 감정에 따라 부정/중립/긍정 반환
    def getEmotion(emotion_target, emotion_level):
        if emotion_target == "없음" or emotion_level == "약함":
            return "중립"
        elif emotion_target in ["두려움", "슬픔", "화남"]:
            return "부정"
        elif emotion_target in ["기쁨", "놀라움", "사랑스러움"]:
            return "긍정"
        else:
            return -1

    # input_path 내 파일 순회
    folder_name = "감정이_태깅된_자유대화/"
    for (root, directories, files) in os.walk(input_path + folder_name):
        print(len(files))
        # input_path 내 모든 퍄일 순회
        for file in files:
            # 파일을 열어 데이터 추출
            try:
                with open(input_path + folder_name + file, 'r', encoding='UTF-8') as input_file:
                    data = json.load(input_file)
                    conversations = data["Conversation"]

                    for conversation in conversations:
                        # text = re.sub(r"[^\uAC00-\uD7A30\s]", "", conversation["Text"])
                        text = conversation["Text"]
                        if type(text)!=str: 
                            print(file, text)
                            exit(-1)

                        emotion = getEmotion(conversation['SpeakerEmotionTarget'], conversation['SpeakerEmotionLevel'])
                        if(emotion==-1):    
                            print(file, text)
                            exit(-1)

                        row = [text, emotion]
                        ws.append(row)
            except:
                print(file, row)
                exit(-1)

# 감성 대화 말뭉치 데이터 전처리 함수
# def emotionConvCorpus2data():

# 속성기반 감정분석 데이터 전처리 함수


# 전처리 시작
freeConversation2data()


# 파일 저장 및 종료
wb.save(output_path)
wb.close()