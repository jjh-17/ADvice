<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import SearchResult from "../components/SearchResult.vue";
import SearchDetail from "../components/SearchDetail.vue";

const currentUrl = ref(""); // 현재 URL을 저장할 반응형 참조
const flag = ref(false);
const rerenderKey = ref(0);

onMounted(() => {
  chrome.runtime.sendMessage({ action: "checkUrl" }, (response) => {
    console.log("onMounted! :" + response.url);
    currentUrl.value = response.url;
    if (currentUrl.value.includes("search.naver.com")) {
      flag.value = true;
    } else {
      flag.value = false;
    }
  });
});

onUnmounted(() => {
  console.log("unmounted!");
});
</script>
<template>
  <main>
    <div>
      <label class="inline-flex items-center mb-5 cursor-pointer">
        <span
          class="me-3 text-sm font-medium text-theme-blue dark:text-gray-300"
          >ADvice</span
        >
        <input type="checkbox" value="" class="sr-only peer" checked />
        <div
          class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-theme-blue"
        ></div>
      </label>
    </div>
    <div>
      <SearchResult v-if="flag" />
      <SearchDetail v-else />
    </div>
  </main>
</template>

<style>
main {
  width: 20rem; /* 팝업의 너비 */
  /* height: 300px; 팝업의 높이 */
}
</style>
