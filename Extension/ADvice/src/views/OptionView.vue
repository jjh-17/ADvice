<template>
  <div class="grid grid-cols-3 h-screen w-screen">
    <div class="text-white col-span-1 bg-theme-green bg-opacity-60">ADvice</div>
    <div
      class="flex flex-col items-center justify-start col-span-2 bg-gray-100"
    >
      <div
        class="text-lg font-semibold shadow-sm rounded-full bg-theme-green bg-opacity-65 px-3 py-5"
      >
        유용한 글의 기준을 직접 커스텀해보세요 ! 👀
      </div>
      <div
        class="h-1/4 w-2/3 mt-4 relative flex justify-center items-center border border-theme-green"
      >
        <VueDraggableNext
          class="dropArea w-1/2 h-full border-r text-center"
          @drop="drop('good', $event)"
        >
          <span class="font-semibold text-lg highlight">Good Option</span>

          <div v-for="(item, index) in goodOptions" :key="index">
            <v-card>
              <v-card-title>{{ item.name }}</v-card-title>
            </v-card>
          </div>
        </VueDraggableNext>
        <VueDraggableNext
          class="w-1/2 h-full dropArea text-center"
          @drop="drop('bad', $event)"
        >
          <!-- @drop="drop('bad', $event)"-->
          <span class="font-semibold text-lg highlight">Bad Option</span>
          <div v-for="(item, index) in badOptions" :key="index">
            <v-card>
              <v-card-title>{{ item.name }}</v-card-title>
            </v-card>
          </div>
        </VueDraggableNext>
      </div>
      <div
        class="mb-4 mt-2 font-semibold text-gray-900 dark:text-white shadow-sm rounded-full bg-theme-green bg-opacity-65 px-3 py-5"
      >
        옵션 목록
      </div>
      <v-container fluid class="scroll h-1/2">
        <VueDraggableNext
          class="dragArea list-group w-full flex flex-wrap"
          @drop="drop('list', $event)"
        >
          <div
            class="list-group-item m-1 p-3 rounded-md text-center flex-grow"
            v-for="(element, index) in options"
            :key="index"
            style="flex-basis: 20%;"
          >
            <v-card :key="index" style="width : 100%">
              <v-card-text class="text-sm">{{ element.name }}</v-card-text>
            </v-card>
          </div>
        </VueDraggableNext>
      </v-container>

      <!-- <ul
        class="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <li v-for="(option, index) in options" :key="index"
          class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
          <div class="flex items-center ps-3">
            <input id="index" type="checkbox" v-model="option.checked" @change="saveOption(index)" value=""
              class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
            <label for="index" class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{{
          option.name }}</label>
          </div>
        </li>
      </ul> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import { useRouter } from "vue-router";

const router = useRouter();
const handleBackButton = () => {
  chrome.storage.sync.get(["preURL"], (result) => {
    if (result.preURL) {
      chrome.tabs.update({ url: result.preURL });
      // window.location.href = result.preURL
      // router.push(result.preURL);
    }
  });
  // router.push('/new-path');  // 사용자를 새 경로로 리다이렉트
};

const defaultOptions = [
  { index: 1, name: "사진/지도 등 다양한 정보 포함" },
  { index: 2, name: "구매 링크나 특성 사이트로 유도하는 경우" },
  { index: 3, name: "내돈내산 인증 포함" },
  { index: 4, name: "특정 키워드 포함" },
  { index: 5, name: "광고 문구 포함" },
  { index: 6, name: "장점/단점의 비율" },
  { index: 7, name: "인위적인 사진 포함" },
  { index: 8, name: "객관적인 정보 포함" },
  { index: 9, name: "상세한 설명 포함" },
  { index: 10, name: "이모티콘 포함" },
];

const loadData = () => {
  let dataLoaded = 0;

  chrome.storage.sync.get(["goodOption"], (result) => {
    if (result.goodOption) {
      goodOptions.value = Object.values(result.goodOption);
    }
    dataLoaded++;
    initOptions();
  });

  chrome.storage.sync.get(["badOption"], (result) => {
    if (result.badOption) {
      badOptions.value = Object.values(result.badOption);
    }
    dataLoaded++;
    initOptions();
  });

  const initOptions = () => {
    if (dataLoaded === 2) {
      for (let i = 0; i < goodOptions.value.length; i++) {
        console.log(goodOptions.value[i]);
        let tmp = defaultOptions.findIndex(
          (item) => item.index === goodOptions.value[i].index
        );
        console.log(tmp);
        if (tmp != -1) {
          defaultOptions.splice(tmp, 1);
        }
      } // 선택된 goodoption 제거

      for (let i = 0; i < badOptions.value.length; i++) {
        let tmp = defaultOptions.findIndex(
          (item) => item.index === badOptions.value[i].index
        );
        if (tmp != -1) {
          defaultOptions.splice(tmp, 1);
        }
      } // 선택된 badoption 제거

      options.value = defaultOptions;
    }
  };
};

onMounted(() => {
  loadData();
  chrome.storage.sync.get(["preURL"], (result) => {
    if (result.preURL) {
      console.log("preURL", result.preURL);
    }
  });
  window.addEventListener("popstate", handleBackButton);
  window.addEventListener("pushstate", handleBackButton);
});

const options = ref([]);
const keyword = ref();
const goodOptions = ref([]);
const badOptions = ref([]);

const saveOption = () => {
  // options.value[index].checked = !options.value[index].checked;
  // console.log(options.value[index].checked);
  chrome.storage.sync.set({ goodOption: goodOptions.value });
  chrome.storage.sync.set({ badOption: badOptions.value });
};

const drop = (type, event) => {
  const data = event.dataTransfer.getData("text");
  console.log("drop", data);
  console.log("type", type);
  // let index = -1;
  // for(let i = 0; i < options.value.length; i++){
  //   if(options.value[i].name === data){
  //     index = i;
  //   }
  // }
  let listIndex = -1;
  let goodIndex = -1;
  let badIndex = -1;
  // const index = options.value.findIndex(item => item.name === data);
  // const index = options.value.indexOf(option);
  if (type === "good") {
    // good 영역에 drop -> bad, list 확인
    // goodOptions.value.push(data);
    listIndex = options.value.findIndex((item) => item.name === data);
    badIndex = badOptions.value.findIndex((item) => item.name === data);
    if (listIndex !== -1) {
      console.log(options.value[listIndex]);
      goodOptions.value.push(options.value[listIndex]);
      options.value.splice(listIndex, 1);
      // options.value[listIndex].checked = 1;
    } else if (badIndex !== -1) {
      console.log(badOptions.value[badIndex]);
      goodOptions.value.push(badOptions.value[badIndex]);
      badOptions.value.splice(badIndex, 1);
    }
  } else if (type === "bad") {
    // bad 영역에 drop -> good, list 확인
    // badOptions.value.push(data);
    listIndex = options.value.findIndex((item) => item.name === data);
    goodIndex = goodOptions.value.findIndex((item) => item.name === data);
    if (listIndex !== -1) {
      console.log(options.value[listIndex]);
      badOptions.value.push(options.value[listIndex]);
      options.value.splice(listIndex, 1);
      // options.value[listIndex].checked = 1;
    } else if (goodIndex !== -1) {
      console.log(goodOptions.value[goodIndex]);
      badOptions.value.push(goodOptions.value[goodIndex]);
      goodOptions.value.splice(goodIndex, 1);
    }
  } else if (type === "list") {
    // list 영역에 drop -> good, bad 확인
    badIndex = badOptions.value.findIndex((item) => item.name === data);
    goodIndex = goodOptions.value.findIndex((item) => item.name === data);
    if (goodIndex !== -1) {
      console.log(goodOptions.value[goodIndex]);
      options.value.push(goodOptions.value[goodIndex]);
      goodOptions.value.splice(goodIndex, 1);
      // options.value[listIndex].checked = 1;
    } else if (badIndex !== -1) {
      console.log(badOptions.value[badIndex]);
      options.value.push(badOptions.value[badIndex]);
      badOptions.value.splice(badIndex, 1);
    }
  }

  saveOption();
};
</script>

<style>
  .highlight{
    background:linear-gradient(to top, #68dd9c 30%, transparent 20%);
  }
</style>
