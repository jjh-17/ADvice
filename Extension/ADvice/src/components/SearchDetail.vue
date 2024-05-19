<script setup>
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

import { ref, watch, onMounted } from "vue";

const baseData = [20, 40, 60, 80, 70]; // 기존 데이터

const chartData = ref({
  type: "bar",
  data: {
    labels: [
      "검색어 발견 빈도",
      "광고 가능성",
      "긍/부정 평가",
      "검색어 갯수",
      "링크 갯수",
    ], // 레이블을 추가하여 각 막대를 식별 가능하게 함
    datasets: [
      {
        label: "Dataset 1", // 핑크색 막대
        data: baseData,
        backgroundColor: "#4379EE",
        barThickness: 10, // 막대의 두께 설정
        categoryPercentage: 0.8, // 카테고리 내에서 막대가 차지하는 비율
      },
      {
        label: "Dataset 2", // 파란색 막대
        data: baseData.map((value) => 100 - value),
        backgroundColor: "#E5E7EB",
        barThickness: 10, // 막대의 두께 설정
        categoryPercentage: 0.8, // 카테고리 내에서 막대가 차지하는 비율
      },
    ],
  },
  options: {
    plugins: {
      title: {
        display: false,
        text: "Stacked Horizontal Bar Chart - Completing to 100",
      },
      legend: {
        display: false, // 레전드 숨기기
      },
    },
    responsive: true,
    scales: {
      x: {
        stacked: true,
        display: false, // X축 라벨 숨기기
      },
      y: {
        beginAtZero: true,
        stacked: true,
      },
    },
    indexAxis: "y", // 수평 막대 그래프 설정
  },
});

const chartRef = ref(null);

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

const goodOptions = ref([]);
const badOptions = ref([]);
const tooltip = ref(null);

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
onMounted(() => {
  new Chart(chartRef.value, {
    type: chartData.value.type,
    data: chartData.value.data,
    options: chartData.value.options,
  });

  chrome.storage.sync.get(["goodOption"], (result) => {
    if (result.goodOption) {
      goodOptions.value = Object.values(result.goodOption);
    }
  });

  chrome.storage.sync.get(["badOption"], (result) => {
    if (result.badOption) {
      badOptions.value = Object.values(result.badOption);
    }
  });
});
</script>

<template>
  <div>
    <canvas ref="chartRef"></canvas>
    <div class="mt-5 mb-2 text-sm font-bold">유용성 판단 기준</div>
    <div
      class="flex flex-wrap max-w-max justify-start items-center mt-5 mb-2 px-12"
    >
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
        <div
          v-show="tooltip === option.name"
          class="absolute -mt-10 text-xs w-32 text-center p-1 bg-white border rounded shadow-lg"
        >
          {{ option.name }}
        </div>
      </div>
    </div>
  </div>
</template>
