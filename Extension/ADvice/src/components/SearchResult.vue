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

</script>

<template>
  <div>
    <div>
      <h3 class="mt-2 mb-2 text-sm font-bold">키워드 검색</h3>
      <!-- 검색 창 start-->
      <form class="max-w-md mx-auto">
        <label
          for="default-search"
          class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >Search</label
        >
        <div class="relative">
          <div
            class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            class="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-theme-blue focus:border-theme-blue dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-theme-blue dark:focus:border-theme-blue"
            placeholder="Search..."
          />
          <!-- <button
        type="submit"
        class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Search
      </button> -->
        </div>
      </form>
      <!-- 검색 창 end-->
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
