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
  console.log("check 변경", isChecked.value);
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    console.log(tabs[0].url);
  });
  chrome.runtime.sendMessage({
    action: "saveCheck",
    isChecked: isChecked.value,
  });
};

const openOptions = () => {
  // // 옵션 페이지 URL을 가져옵니다.
  // const optionsUrl = chrome.runtime.getURL("option.html");

  // // 현재 탭의 URL을 옵션 페이지로 변경
  // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //   const currentTab = tabs[0];
  //   console.log(currentTab);
  //   chrome.tabs.update(currentTab.id, { url: optionsUrl }, function () {
  //     chrome.storage.sync.set({ preURL: currentTab.url })
  //   });
  // });
  // 크롬 API를 사용하여 옵션 페이지를 엽니다.
  chrome.runtime.openOptionsPage();
};

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
        <span class="me-3 text-sm font-medium text-theme-green dark:text-gray-300">ADvice</span>
        <input type="checkbox" :checked="isChecked" @change="checkboxUpdate" value="" class="sr-only peer" />
        <div
          class="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-theme-green">
        </div>
        <div class="absolute w-9 h-5 right-[5%] ">
          <button @click="openOptions">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
              <path fill="#03C75A" fill-rule="evenodd"
                d="M17.23 7.37h1.09c.93.005 1.68.76 1.68 1.69V11a1.68 1.68 0 0 1-1.62 1.67h-1.09a.34.34 0 0 0-.29.22.34.34 0 0 0 0 .37l.73.73a1.67 1.67 0 0 1 0 2.37l-1.34 1.34c-.31.319-.735.5-1.18.5a1.72 1.72 0 0 1-1.19-.5l-.76-.77a.34.34 0 0 0-.37 0c-.15.06-.26.16-.26.3v1.09A1.69 1.69 0 0 1 10.94 20H9.05a1.68 1.68 0 0 1-1.68-1.62v-1.09a.34.34 0 0 0-.22-.29.38.38 0 0 0-.41 0l-.77.74a1.67 1.67 0 0 1-2.37 0l-1.34-1.36a1.66 1.66 0 0 1-.5-1.19 1.72 1.72 0 0 1 .5-1.19l.81-.74a.34.34 0 0 0 0-.37c-.06-.15-.16-.26-.3-.26H1.68A1.69 1.69 0 0 1 0 10.94V9.05c0-.928.752-1.68 1.68-1.68h1.03A.34.34 0 0 0 3 7.15a.38.38 0 0 0 0-.41L2.26 6a1.67 1.67 0 0 1 0-2.4l1.37-1.34c.31-.319.735-.5 1.18-.5a1.72 1.72 0 0 1 1.19.5l.74.81a.34.34 0 0 0 .37 0c.15-.06.26-.16.26-.3V1.68A1.69 1.69 0 0 1 9.06 0H11a1.68 1.68 0 0 1 1.63 1.68v1.03a.34.34 0 0 0 .22.29.38.38 0 0 0 .41 0l.77-.74a1.67 1.67 0 0 1 2.37 0l1.34 1.37c.32.314.5.742.5 1.19a1.63 1.63 0 0 1-.5 1.18l-.81.74a.34.34 0 0 0 0 .37c.06.15.16.26.3.26ZM6.766 11.34a3.5 3.5 0 1 0 6.467-2.68 3.5 3.5 0 0 0-6.467 2.68Z"
                clip-rule="evenodd" />
            </svg>
          </button>

        </div>

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
  width: 20rem;
  /* 팝업의 너비 */
  /* height: 300px; 팝업의 높이 */
}
</style>
