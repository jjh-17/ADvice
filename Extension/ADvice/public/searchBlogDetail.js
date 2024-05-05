// 테스트 블로그 : https://blog.naver.com/gospel416/223425484859

var iframe = document.getElementById("mainFrame");
var optionName = [
  "사진(image)/영상(video)/링크/지도(placeMap)/ 등 다양성",
  "구매 링크나 특정 사이트로의 유도 링크가 포함되어 있는 경우",
  "내돈내산 인증 포함",
  "특정 키워드 포함",
  "광고 문구",
  "장점/단점 비율",
  "인위적인 사진 포함",
  "객관적인 정보(영업시간, 장소위치, 가격 포함)",
  "상세한 설명",
  "이모티콘 개수",
];

var selectedOption = [1, 2];
var tmpData = {
  adDetection: [
    {
      option: 1,
      goodList: [
        {
          id: "SE-600b5534-5478-40eb-93f6-66704272a14d",
          data: ["겹벚꽃 보러,"],
        },
        {
          id: "SE-e7e63fcf-f41c-439a-b75d-a67fdba06c27",
          data: [
            "3월 말부터 4월 초에 제주여행을 다녀왔다.",
            "제주 여행 내내 비가 와서 제대로 벚꽃을 보지 못했는데, 서울에 오니 이미 벚꽃 엔딩이다.",
          ],
        },
      ],
      badList: [
        {
          id: "SE-0dd3e82e-a5c4-4d0f-b623-eb87cc6fcfee",
          data: [
            "정말 아쉬웠다.",
            "벚꽃을 이렇게 보내다니.",
            "그래서 겹벚꽃 개화를 기다렸다.",
            '그러다 막냇동생이 "언니 어린이대공원에 겹벚꽃 만개했대"',
            "해서 알아보니 벌써 활짝 폈다.",
          ],
        },
        {
          id: "SE-6ff4b4f4-68cb-49cf-b59d-e265e69aaa18",
          data: [
            "급하게 날짜를 잡고 함께 다녀왔다.",
            "겹벚꽃 소식을 알려준 막내는 약속이 있어 못 가고 첫째 동생이랑 조카와 함께 다녀왔다.",
          ],
        },
        {
          id: "SE-8d9613c4-de90-4f58-ac2f-e944a918f834",
          data: [
            "요즘 꽃구경 다닐 때마다 인간 네비가 됐다.",
            "우리는 조카가 있어서 주차를 하고 나와 분수대 쪽으로 나왔다.",
            "분수를 앞에 두고 볼 때 왼편으로 걸어가면 바로 핑크빛 겹벚꽃을 만날 수 있다.",
          ],
        },
      ],
    },
    {
      option: 2,
      goodList: [
        {
          id: "SE-8d9613c4-de90-4f58-ac2f-e944a918f834",
          data: [
            "요즘 꽃구경 다닐 때마다 인간 네비가 됐다.",
            "우리는 조카가 있어서 주차를 하고 나와 분수대 쪽으로 나왔다.",
            "분수를 앞에 두고 볼 때 왼편으로 걸어가면 바로 핑크빛 겹벚꽃을 만날 수 있다.",
          ],
        },
        {
          id: "SE-e569d924-0bb3-4da4-95fa-62e24b1c25f5",
          data: [
            "조금 놀랐던 건 작년 빼고 매해 방문했는데, 더 풍성했던 걸로 기억하는데 원래 찍던 나무는 꽃이 거의 없고 다른 장소에 한 그루 정도 낮게 있었다.",
          ],
        },
      ],
      badList: [
        {
          id: "SE-b785602a-1c29-406b-9794-2d375bda5854",
          data: [
            "큰 겹벚꽃 나무는 있는데 사진 찍을 만큼 낮으면서 풍성한 나무가 많이 사라진 느낌이었다.",
            "내가 늦게 방문해서 겹벚꽃이 진 걸까 아니면 그냥 피지 못한 걸까 궁금했다.",
          ],
        },
        {
          id: "SE-d1b962d4-7b7b-4b30-b1d4-9b4eed855a9f",
          data: [
            "겹벚꽃 앞에 피크닉 중이셨지만 사진 찍기엔 어려움이 없었다.",
            "이미 다른 사람들이 줄 서서 사진을 찍고 있었다.",
          ],
        },
      ],
    },
  ],
};

// Data를 Id-Option별로 정제
function processData(tmpData) {
  let result = {};

  tmpData.adDetection.forEach((node) => {
    if (selectedOption.includes(node.option)) {
      node.goodList.forEach((data) => {
        if (!result[data.id]) {
          result[data.id] = {
            goodOption: [],
            badOption: [],
            flag: 0,
          };
        }
        result[data.id].goodOption.push(node.option);
      });

      node.badList.forEach((data) => {
        if (!result[data.id]) {
          result[data.id] = {
            goodOption: [],
            badOption: [],
            flag: 0,
          };
        }
        result[data.id].badOption.push(node.option);
      });
    }
  });

  Object.keys(result).forEach((id) => {
    let entry = result[id];
    if (entry.goodOption.length > entry.badOption.length) {
      entry.flag = 1;
    } else if (entry.goodOption.length === entry.badOption.length) {
      entry.flag = 0;
    } else {
      entry.flag = -1;
    }
  });

  return result;
}

var finalResult = [];

var checkInterval = setInterval(function () {
  var iframeDoc = iframe.contentWindow.document;
  var iframeElements = iframeDoc.getElementsByClassName("se-main-container");
  if (iframeElements.length > 0) {
    clearInterval(checkInterval);

    function showModal(id, event) {
      let modal = iframeDoc.getElementById("hover-modal");
      let message = "ID: " + id; // 기본 메시지

      if (finalResult[id]) {
        const data = finalResult[id];
        let listContent = "";

        if (data.flag === 1) {
          message += " - 유용한 문장입니다.";
          listContent = `<ul>${data.goodOption
            .map((option) => `<li>${optionName[option - 1]}</li>`)
            .join("")}</ul>`;
        } else if (data.flag === 0) {
          message += " - 중립적인 문장입니다.";
          listContent = `<ul class='good-options'>Good Option : ${data.goodOption
            .map((option) => `<li>${optionName[option - 1]}</li>`)
            .join("")}</ul>
                         <ul class='bad-options'>Bad Option :${data.badOption
                           .map(
                             (option) => `<li>${optionName[option - 1]}</li>`
                           )
                           .join("")}</ul>`;
        } else if (data.flag === -1) {
          message += " - 유해한 문장입니다.";
          listContent = `<ul>${data.badOption
            .map((option) => `<li>${optionName[option - 1]}</li>`)
            .join("")}</ul>`;
        }

        message += listContent; // 리스트를 메시지에 추가
      }

      if (!modal) {
        modal = iframeDoc.createElement("div");
        modal.id = "hover-modal";
        modal.style.position = "absolute";
        modal.style.padding = "10px";
        modal.style.background = "white";
        modal.style.border = "1px solid black";
        modal.style.zIndex = "1000";
        iframeDoc.body.appendChild(modal);
      }
      modal.innerHTML = message; // textContent 대신 innerHTML 사용
      modal.style.display = "block"; // 먼저 보이게 하여 높이를 측정할 수 있도록 함

      const rect = event.target.getBoundingClientRect();
      const scrollY =
        iframe.contentWindow.pageYOffset ||
        iframe.contentWindow.document.documentElement.scrollTop;
      const scrollX =
        iframe.contentWindow.pageXOffset ||
        iframe.contentWindow.document.documentElement.scrollLeft;

      // Adjust modal position to show above the element
      modal.style.top = rect.top + scrollY - modal.offsetHeight - 10 + "px"; // 위치 조정
      modal.style.left = rect.left + scrollX + "px";

      modal.style.display = "block"; // Display the modal
    }

    function hideModal() {
      const modal = iframeDoc.getElementById("hover-modal");
      if (modal) {
        modal.style.display = "none";
      }
    }
    // 모달 end

    // Coloring 시작
    finalResult = processData(tmpData);
    console.log(finalResult);
    Object.keys(finalResult).forEach((id) => {
      const data = finalResult[id];
      const element = document
        .getElementById("mainFrame")
        .contentWindow.document.getElementById(id);
      if (element) {
        console.log(id + " " + finalResult[id]);
        element.addEventListener("mouseover", function (event) {
          event.stopPropagation();
          showModal(id, event);
        });

        element.addEventListener("mouseout", function (event) {
          hideModal();
        });

        let html = element.innerHTML;

        if (data.flag === 1) {
          element.style.backgroundColor = "rgba(66, 189, 101, 0.3)"; // Green for good options
        } else if (data.flag === 0) {
          element.style.backgroundColor = "rgba(255, 235, 59, 0.3)"; // Yellow for neutral
        } else {
          element.style.backgroundColor = "rgba(241, 43, 67, 0.3)"; // Red for bad options
        }

        element.innerHTML = html;
      }
    });
  }
}, 100); // Check every 100ms
