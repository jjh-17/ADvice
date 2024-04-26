import json
import os
import re
import pandas as pd

# input, output 폴더 경로
input_path = "./AI/emotion/data/input/"
output_path = "./AI/emotion/data/output/pretreated_data.csv"

# 컬럼 정보
columns = ['Text', 'Emotion']

# 한국어 단발성 대화 데이터셋
def oneShotConv2Data():
    file_name = "한국어_단발성_대화_데이터셋.xlsx"

    # 파일을 열어 필요한 데이터 추출
    df = pd.read_excel(input_path + file_name)
    filtered_df = df[df['Emotion'].isin(['분노', '혐오', '중립', '행복', '놀람'])]
    
    # 데이터 변경
    filtered_df.loc[filtered_df['Emotion'].isin(['분노', '혐오']), 'Emotion'] = '부정'
    filtered_df.loc[filtered_df['Emotion'].isin(['중립']), 'Emotion'] = '중립'
    filtered_df.loc[filtered_df['Emotion'].isin(['행복', '놀람']), 'Emotion'] = '긍정'

    # 열 이름 변경
    filtered_df.rename(columns={'Sentence': 'Text', 'Emotion': 'Emotion'}, inplace=True)

    # 데이터 추가
    pd.DataFrame(filtered_df[["Text", "Emotion"]]).to_csv(output_path, index=False, mode='a', encoding='utf-8-sig')


# 속성기반 감정분석 데이터 전처리 함수
def attrBased2Data():
    # 화자 감정에 따라 부정/중립/긍정 반환
    def getEmotion(emotion):
        if(emotion=="-1"):  return "부정"
        elif(emotion=="0"): return "중립"
        else:               return "긍정"

    # input_path 내 파일 순회
    folder_name = "속성기반_감정분석_데이터/"
    data_list = []
    for (root, directories, files) in os.walk(input_path + folder_name):
        print(len(files))
        # input_path 내 모든 퍄일 순회
        for file in files:
            # 파일을 열어 데이터 추출
            with open(input_path + folder_name + file, 'r', encoding='UTF-8') as input_file:
                infos = json.load(input_file)

                for info in infos:
                    text = info["RawText"]
                    emotion = getEmotion(getEmotion("GeneralPolarity"))
                    row = [text, emotion]
                    data_list.append(row)

    pd.DataFrame(data_list, columns=columns).to_csv(output_path, index=False, mode='a', encoding='utf-8-sig', header=False)

# 전처리 시작
oneShotConv2Data()
attrBased2Data()