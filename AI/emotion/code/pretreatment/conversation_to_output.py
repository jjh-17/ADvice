import json
import os
import openpyxl
import re

# input, output 폴더 경로
input_path = "data/conversation/input/"
output_path = "data/conversation/output/data_conversation.xlsx"

# 감정과 그 정도에 따라 숫자 부여
def getNum(emotion, level):
    result=-1

    if(emotion=='두려움' and level=='약함'):        result=0
    elif(emotion=='두려움' and level=='보통'):      result=1
    elif(emotion=='두려움' and level=='강함'):      result=2
    elif(emotion=='슬픔' and level=='약함'):        result=3
    elif(emotion=='슬픔' and level=='보통'):        result=4
    elif(emotion=='슬픔' and level=='강함'):        result=5
    elif(emotion=='화남' and level=='약함'):        result=6
    elif(emotion=='화남' and level=='보통'):        result=7
    elif(emotion=='화남' and level=='강함'):        result=8
    elif(emotion=='없음'):                          result=9
    elif(emotion=='기쁨' and level=='약함'):        result=10
    elif(emotion=='기쁨' and level=='보통'):        result=11
    elif(emotion=='기쁨' and level=='강함'):        result=12
    elif(emotion=='놀라움' and level=='약함'):      result=13
    elif(emotion=='놀라움' and level=='보통'):      result=14
    elif(emotion=='놀라움' and level=='강함'):      result=15
    elif(emotion=='사랑스러움' and level=='약함'):  result=16
    elif(emotion=='사랑스러움' and level=='보통'):  result=17
    elif(emotion=='사랑스러움' and level=='강함'):  result=18

    return result

# input 파일들에서 필요한 데이터를 추출하여 하나의 파일로 만드는 메서드
def setWB():
    # 컬럼 정보
    column = ["Text", "Class"]

    # 엑셀 파일 관련 설정
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = 'Conversation'
    ws.append(column)

    # input_path 내 정보 순회
    for (root, directories, files) in os.walk(input_path):
        # input_path 내 모든 퍄일 순회
        for file in files:
            # 파일을 열어 데이터 추출
            try:
                with open(input_path + file, 'r', encoding='UTF-8') as input_file:
                    data = json.load(input_file)
                    conversations = data["Conversation"]

                    for conversation in conversations:
                        class_num = getNum(conversation['SpeakerEmotionTarget'], conversation['SpeakerEmotionLevel'])
                        if(class_num==-1):
                            print(conversation)
                            continue
                        row = [re.sub(r"[^\uAC00-\uD7A30\s]", "", conversation["Text"]), class_num]
                        ws.append(row)
            except:
                print(file, row)
                exit(-1)

    wb.save(output_path)
    wb.close()

setWB()