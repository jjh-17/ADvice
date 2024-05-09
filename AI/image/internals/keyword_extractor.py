from krwordrank.word import KRWordRank
from krwordrank.hangle import normalize
from kiwipiepy import Kiwi


class KeywordExtraction:
    def __init__(self):
        self.kiwi = Kiwi()

    def extract_keyword(self, texts):
        texts = [normalize(text, english=True, number=True) for text in texts]
        wordrank_extractor = KRWordRank(
            min_count=1,  # 단어의 최소 출현 빈도수 (그래프 생성 시)
            max_length=10,  # 단어의 최대 길이
            verbose=False
        )

        beta = 0.85  # PageRank의 decaying factor beta
        max_iter = 20
        keywords, rank, graph = wordrank_extractor.extract(texts, beta, max_iter)
        word_list = []
        for word, r in sorted(keywords.items(), key=lambda k: k[1], reverse=True):
            if r >= 1:
                word_list.append(word)
        return '' if not word_list else self.noun_extractor(word_list)

    def noun_extractor(self, word_list):
        nouns = []
        result = self.kiwi.analyze(' '.join(word_list))
        for token, pos, _, _ in result[0][0]:
            if len(token) != 1 and pos.startswith('N') or pos.startswith('SL'):
                nouns.append(token)
        return '' if not nouns else nouns[:5]


keywordExtractor = KeywordExtraction()
