<script setup>
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

import { ref, onMounted } from "vue";

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

onMounted(() => {
  new Chart(chartRef.value, {
    type: chartData.value.type,
    data: chartData.value.data,
    options: chartData.value.options,
  });
});
</script>

<template>
  <canvas ref="chartRef"></canvas>
  <div>
    <div class="mt-5 mb-2 text-sm font-bold">유용성 판단 기준</div>
    <ul
      class="max-w-md text-sm text-gray-900 bg-white border-t border-x border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    >
      <li class="w-full border-b border-gray-200 dark:border-gray-600">
        <div class="flex items-center ps-3">
          <input
            id="vue-checkbox"
            type="checkbox"
            value=""
            class="w-4 h-4 text-theme-blue border-gray-300 rounded focus:ring-theme-blue dark:focus:ring-theme-blue dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          />
          <label
            for="vue-checkbox"
            class="w-full py-3 ms-2 text-xs text-gray-900 dark:text-gray-300"
            >해당 문서에 걸린 링크/사진 갯수</label
          >
        </div>
      </li>
      <li class="w-full border-b border-gray-200 dark:border-gray-600">
        <div class="flex items-center ps-3">
          <input
            id="vue-checkbox"
            type="checkbox"
            value=""
            class="w-4 h-4 text-theme-blue border-gray-300 rounded focus:ring-theme-blue dark:focus:ring-theme-blue dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          />
          <label
            for="vue-checkbox"
            class="w-full py-3 ms-2 text-xs text-gray-900 dark:text-gray-300"
            >다양한 형태 정보 포함 여부</label
          >
        </div>
      </li>
      <li class="w-full border-b border-gray-200 dark:border-gray-600">
        <div class="flex items-center ps-3">
          <input
            id="vue-checkbox"
            type="checkbox"
            value=""
            class="w-4 h-4 text-theme-blue border-gray-300 rounded focus:ring-theme-blue dark:focus:ring-theme-blue dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          />
          <label
            for="vue-checkbox"
            class="w-full py-3 ms-2 text-xs text-gray-900 dark:text-gray-300"
            >검색어가 문서 내에 얼마나 잦은 빈도로 발견되는 지 여부</label
          >
        </div>
      </li>
      <li class="w-full border-b border-gray-200 dark:border-gray-600">
        <div class="flex items-center ps-3">
          <input
            id="vue-checkbox"
            type="checkbox"
            value=""
            class="w-4 h-4 text-theme-blue border-gray-300 rounded focus:ring-theme-blue dark:focus:ring-theme-blue dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          />
          <label
            for="vue-checkbox"
            class="w-full py-3 ms-2 text-xs text-gray-900 dark:text-gray-300"
            >한쪽으로만 치우친 평가</label
          >
        </div>
      </li>
      <li class="w-full border-b border-gray-200 dark:border-gray-600">
        <div class="flex items-center ps-3">
          <input
            id="vue-checkbox"
            type="checkbox"
            value=""
            class="w-4 h-4 text-theme-blue border-gray-300 rounded focus:ring-theme-blue dark:focus:ring-theme-blue dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
          />
          <label
            for="vue-checkbox"
            class="w-full py-3 ms-2 text-xs text-gray-900 dark:text-gray-300"
            >광고 가능성이 높은 게시글 여부</label
          >
        </div>
      </li>
    </ul>
  </div>
</template>
