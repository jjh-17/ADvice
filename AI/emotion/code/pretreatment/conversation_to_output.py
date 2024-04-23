import json
import os
import openpyxl
import re

# input, output 폴더 경로
input_train_path = "data/conversation/input/train/"
input_validation_path = "data/conversation/input/validation/"
output_path = "data/conversation/output/"

# 엑셀 파일 이름
train_file_name = "train_conversation.xlsx"
validation_file_name = "validation_conversation.xlsx"

# input 파일들에서 필요한 데이터를 추출하여 하나의 파일로 만드는 메서드
def setWB(isTrain):
    # 필요한 변수 선언
    input_path = input_train_path if isTrain else input_validation_path
    output_file_path = output_path + (train_file_name if isTrain else validation_file_name)
    column = ["감정", "감정_레벨", "감정_카테고리"]

    # 엑셀 파일 관련 설정
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Conversation'
    ws.append(column)

    # 시트 title 지정

    # input_path 내 정보 순회
    for (root, directories, files) in os.walk(input_path):
        # input_path 내 모든 퍄일 순회
        for file in files:
            # 파일을 염
            try:
                with open(input_path + file, 'r', encoding='UTF-8') as input_file:
                    data = json.load(input_file)
                    conversations = data["Conversation"]
                    
                    for conversation in conversations:
                        row = [ \
                            re.sub(r"[^\uAC00-\uD7A30\s]", "", conversation["Text"]), conversation["SpeakerEmotionTarget"], \
                            conversation["SpeakerEmotionLevel"], conversation["SpeakerEmotionCategory"] \
                        ]
                        ws.append(row)
            except:
                print(file, row)
                exit(-1)

    wb.save(output_file_path)
    wb.close()

setWB(True)
setWB(False)