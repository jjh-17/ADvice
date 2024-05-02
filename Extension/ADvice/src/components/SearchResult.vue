<script setup>
import { ref, watch, onMounted } from "vue";
const items = ref([
  { id: 1, value: "해당 문서에 걸린 링크/사진 갯수" },
  { id: 2, value: "다양한 형태 정보 포함 여부" },
  { id: 3, value: "검색어가 문서 내에 얼마나 잦은 빈도로 발견되는 지 여부" },
  { id: 4, value: "한쪽으로만 치우친 평가" },
  { id: 5, value: "광고 가능성이 높은 게시글 여부" },
]);

const selected = ref([]);

watch(selected, (newValue) => {
  chrome.runtime.sendMessage({ action: "changeOption", options: newValue });
});

const currentRank = ref(0);
const ranks = ref([
  {
    rank: 1,
    title: "[홍대] 오브젝트 서교점 최고심 팝업스...",
    url: "https://blog.naver.com/kus4242/223420431358",
    author: "저는 캐릭터 중에서도 '최고심'을 엄청 좋아해요ㅎㅎ",
    score: 100,
  },
  {
    rank: 2,
    title:
      "홍대 소품샵 투어: 수바코, 오브젝트서교점(최고심), 유어마인드(책갈피)",
    url: "https://blog.naver.com/dudungha22/223432930949",
    score: 90,
    author: "최고심이랑 콜라보를 했나봐요!! 벌써 구ㅏ여워 속마음 비밀해제",
  },
  {
    rank: 3,
    title: "최고심 팝업스토어 홍대, 속마음 비밀해제 와펜",
    url: "https://blog.naver.com/aswqeeddrr5r/223414746493",
    score: 80,
    author: "이번에 롯데월드타워 잔디광장에도 등장한 최고심! 작년에는",
  },
  {
    rank: 4,
    title: "홍대ㅣ최고심 팝업 오브젝트서교 파우치 구입 후기",
    url: "https://blog.naver.com/qpskxn41/223424509961",
    score: 70,
    author:
      "오브젝트(서교점) 현명한 소비의 시작, 오브젝트 (insideobject.com) ️서울 마포구 와우산로",
  },
  {
    rank: 5,
    title: "옵젵상가X최고심 팝업 일정, 와펜 굿즈 가득한 오브젝트 서교점",
    url: "https://blog.naver.com/woodyda/223418209479",
    score: 60,
    author:
      "1년만에 돌아온 최고심 팝업스토어!!! 1년 전 오브젝트 서교점에서 최고심",
  },
]);

const next = () => {
  currentRank.value = (currentRank.value + 1) % ranks.value.length;
};

const prev = () => {
  currentRank.value =
    (currentRank.value + ranks.value.length - 1) % ranks.value.length;
};
</script>

<template>
  <div>
    <div>
      <h3 class="mt-2 mb-2 text-sm font-bold">유용도 랭킹</h3>
      <!-- 랭킹 캐러셀 start-->
      <div
        id="text-carousel-example"
        class="relative w-full flex items-center justify-between mt-1 mb-8 border"
      >
        <!-- Left control -->
        <button
          @click="prev"
          class="z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
        >
          <span class="text-theme-blue text-3xl">‹</span>
        </button>

        <!-- Carousel wrapper -->
        <div class="flex-grow flex pt-4 pb-3">
          <!-- Text items -->
          <div
            v-for="(rank, index) in ranks"
            :key="index"
            :class="{ hidden: currentRank !== index }"
          >
            <div class="text-xs mb-1">
              <span class="font-semibold" v-if="rank.rank <= 3">
                👑 {{ rank.rank }}위
              </span>
              <!-- Crown only if rank is 3 or less -->
              <span class="font-semibold" v-else>{{ rank.rank }}위</span>
            </div>

            <div class="text-semi-sm font-semibold mb-1">
              {{
                rank.title.length > 18
                  ? rank.title.substring(0, 18) + "..."
                  : rank.title
              }}
            </div>
            <div class="text-xs mb-1">
              {{
                rank.author.length > 18
                  ? rank.author.substring(0, 18) + "..."
                  : rank.author
              }}
            </div>
          </div>
        </div>
        <!-- Right control -->
        <button
          @click="next"
          class="z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
        >
          <span class="text-theme-blue text-3xl">›</span>
        </button>
      </div>
      <!-- 랭킹 캐러셀 end-->
    </div>
    <div class="mt-5 mb-2 text-sm font-bold">유용성 판단 기준</div>
    <ul
      class="max-w-md bg-white border-t border-x border-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      <li
        v-for="item in items"
        :key="item.id"
        class="w-full border-b border-gray-200 dark:border-gray-600"
      >
        <div class="flex items-center p-3">
          <input
            :id="'checkbox-' + item.id"
            type="checkbox"
            :value="item.id"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-500 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
            v-model="selected"
          />
          <label :for="'checkbox-' + item.id" class="ml-2 text-xs">{{
            item.value
          }}</label>
        </div>
      </li>
    </ul>
  </div>
</template>
