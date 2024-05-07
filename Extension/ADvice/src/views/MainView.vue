<script setup>
import { ref, onMounted } from "vue";
import SearchResult from "../components/SearchResult.vue";
import SearchDetail from "../components/SearchDetail.vue";
import Default from "../components/Default.vue";

const currentUrl = ref(""); // 현재 URL을 저장할 반응형 참조
const viewState = ref("default");
const isChecked = ref(true);

onMounted(() => {
  chrome.runtime.sendMessage({ action: "checkUrl" }, (response) => {
    currentUrl.value = response.url;
    updateViewState(currentUrl.value);
  });
  
  chrome.runtime.sendMessage({ action: "updateCheck" }, (response) => {
    isChecked.value = response.check;
  });
});

const checkboxUpdate = (event) => {
  isChecked.value = event.target.checked;
  console.log("check 변경", isChecked.value)
  chrome.runtime.sendMessage({action : "saveCheck", isChecked : isChecked.value});
}

const openOptions = () => {
      // 크롬 API를 사용하여 옵션 페이지를 엽니다.
      chrome.runtime.openOptionsPage();
}

function updateViewState(url) {
  if (url.includes("https://search.naver.com")) {
    viewState.value = "searchResult";
  } else if (
    url.includes("https://blog.naver.com") ||
    url.includes("https://cafe.naver.com")
  ) {
    viewState.value = "searchDetail";
  } else {
    viewState.value = "default";
  }
}
</script>

<template>
  <main>
    <div>
      <label class="inline-flex items-center mb-5 cursor-pointer">
        <span
          class="me-3 text-sm font-medium text-theme-blue dark:text-gray-300"
          >ADvice</span
        >
        <input type="checkbox" :checked="isChecked" @change="checkboxUpdate" value="" class="sr-only peer" />
        <div
          class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-theme-blue"
        ></div>
        <button @click="openOptions">Open Options</button>
      </label>
    </div>
    <div>
      <SearchResult v-if="viewState === 'searchResult'" />
      <SearchDetail v-if="viewState === 'searchDetail'" />
      <Default v-if="viewState === 'default'" />
    </div>
  </main>
</template>

<style>
main {
  width: 20rem; /* 팝업의 너비 */
  /* height: 300px; 팝업의 높이 */
}
</style>
