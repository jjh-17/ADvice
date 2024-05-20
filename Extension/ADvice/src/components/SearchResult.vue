<script setup>
import { ref, watch, onMounted } from "vue";

const goodOptions = ref([]);
const badOptions = ref([]);
const tooltip = ref(null);

onMounted(() => {
  console.log("searchResult onMounted");
  chrome.runtime.sendMessage({ action: "loadTopList" }, (response) => {
    ranks.value = response.topList;
    console.log(ranks.value);
  });

  chrome.storage.sync.get(["goodOption"], (result) => {
    if (result.goodOption) {
      goodOptions.value = Object.values(result.goodOption);
      console.log("goodOptions", goodOptions.value);
    }
  });

  chrome.storage.sync.get(["badOption"], (result) => {
    if (result.badOption) {
      badOptions.value = Object.values(result.badOption);
      console.log("badOptions", badOptions.value);
    }
  });
});

const defaultOptions = [
  { index: 1, name: "사진/지도 등 다양한 정보 포함" },
  { index: 2, name: "구매 링크나 특성 사이트로 유도하는 경우" },
  { index: 3, name: "내돈내산 인증 포함" },
  { index: 4, name: "특정 키워드 포함" },
  { index: 5, name: "광고 문구 포함" },
  { index: 6, name: "장점/단점의 비율" },
  { index: 7, name: "인위적인 사진 포함" },
  { index: 8, name: "객관적인 정보 포함" },
];
const selected = ref([]);

watch(selected, (newValue) => {
  chrome.runtime.sendMessage({ action: "changeOption", options: newValue });
});

const currentRank = ref(0);
const ranks = ref([]);

const next = () => {
  currentRank.value = (currentRank.value + 1) % ranks.value.length;
};

const prev = () => {
  currentRank.value =
    (currentRank.value + ranks.value.length - 1) % ranks.value.length;
};

const goToPage = (link) => {
  console.log("click : ", link);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentTab = tabs[0]; // 현재 활성 탭
    chrome.tabs.create({
      url: link,
      index: currentTab.index + 1, // 현재 탭의 바로 다음 위치
    });
  });
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
          <span class="text-theme-green text-3xl">‹</span>
        </button>

        <!-- Carousel wrapper -->
        <div class="flex-grow flex h-28 pt-4 pb-3">
          <!-- Text items -->
          <div
            v-for="(rank, index) in ranks"
            :key="index"
            @click="goToPage(rank.url)"
            :class="{ hidden: currentRank !== index }"
          >
            <div class="text-xs mb-1">
              <span class="font-semibold" v-if="index < 3">
                👑 {{ index + 1 }}위
              </span>
              <!-- Crown only if rank is 3 or less -->
              <span class="font-semibold" v-else>{{ index + 1 }}위</span>
            </div>

            <div class="text-semi-sm font-semibold mb-1">
              {{ rank.title }} ...
            </div>
            <div class="text-xs mb-1">{{ rank.desc }} ...</div>
          </div>
        </div>
        <!-- Right control -->
        <button
          @click="next"
          class="z-30 flex h-full cursor-pointer items-center justify-center px-4 focus:outline-none"
        >
          <span class="text-theme-green text-3xl">›</span>
        </button>
      </div>
      <!-- 랭킹 캐러셀 end-->
    </div>
    <div class="mt-5 mb-2 text-sm font-bold">유용성 판단 기준</div>
    <div class="flex flex-wrap max-w-max justify-start items-center mt-5 mb-2 px-12">
      <div
        v-for="option in defaultOptions"
        :key="option.index"
        class="w-8 h-8 rounded-full m-3"
        :class="{
          'bg-theme-green': goodOptions.some((g) => g.index === option.index),
          'bg-red-400': badOptions.some((b) => b.index === option.index),
          'bg-gray-300':
            !goodOptions.some((g) => g.index === option.index) &&
            !badOptions.some((b) => b.index === option.index),
        }"
        @mouseover="tooltip = option.name"
        @mouseleave="tooltip = ''"
      >
        <!-- Tooltip -->
        <div v-show="tooltip === option.name" class="absolute -mt-10 text-xs w-32 text-center p-1 bg-white border rounded shadow-lg">
          {{ option.name }}
        </div>
      </div>
    </div>
    <!-- <ul
      class="max-w-md bg-white border-t border-x border-gray-200 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      <li
        v-for="option in defaultOptions"
        :key="option.index"
        class="w-1/5 flex justify-center p-2"
      >
        <div
          :class="{
            'w-8 h-8 rounded-full': true,
            'bg-theme-green': goodOptions.some((g) => g.index === option.index),
            'bg-red-300': badOptions.some((b) => b.index === option.index),
            'bg-gray-300':
              !goodOptions.some((g) => g.index === option.index) &&
              !badOptions.some((b) => b.index === option.index),
          }"
        ></div>
      </li>

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
    </ul> -->
  </div>
</template>
