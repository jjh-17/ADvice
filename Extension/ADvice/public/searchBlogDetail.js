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

var tmpData = [
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
      {
        id: "SE-8d9613c4-de90-4f58-ac2f-e944a918f834",
        data: [
          "요즘 꽃구경 다닐 때마다 인간 네비가 됐다.",
          "우리는 조카가 있어서 주차를 하고 나와 분수대 쪽으로 나왔다.",
          "분수를 앞에 두고 볼 때 왼편으로 걸어가면 바로 핑크빛 겹벚꽃을 만날 수 있다.",
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
];

// Data를 Id-Option별로 정제
function processData(tmpData) {
  let result = {};

  tmpData.forEach((node) => {
    if (selectedGoodOption.includes(node.option)) {
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
    } else if (selectedBadOption.includes(node.option)) {
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
var crawlResults = [];

var optionCnt = 0;
var selectedGoodOption = [];
var selectedBadOption = [];

chrome.storage.sync.get(["badOption"], (result) => {
  if (result.badOption) {
    selectedBadOption = Object.values(result.badOption).map((obj) => obj.index); // "index" 값만 추출하여 배열에 추가
  }
  optionCnt++;
  checkOption();
});

chrome.storage.sync.get(["goodOption"], (result) => {
  if (result.goodOption) {
    selectedGoodOption = Object.values(result.goodOption).map(
      (obj) => obj.index
    );
  }
  optionCnt++;
  checkOption();
});

function checkOption() {
  if (optionCnt == 2) {
    var checkInterval = setInterval(function () {
      var iframeDoc = iframe.contentWindow.document;
      var iframeElements =
        iframeDoc.getElementsByClassName("se-main-container");
      if (iframeElements.length > 0) {
        clearInterval(checkInterval);
        // 모달 시작
        function showModal(id, event) {
          let modal = iframeDoc.getElementById("hover-modal");

          if (!modal) {
            modal = iframeDoc.createElement("div");
            modal.id = "hover-modal";
            modal.style.position = "absolute";
            modal.style.padding = "20px";
            modal.style.background = "white";
            modal.style.border = "1px solid black";
            modal.style.zIndex = "1000";
            modal.style.display = "none"; // 초기에는 보이지 않게 설정
            iframeDoc.body.appendChild(modal);
          }

          const data = finalResult[id];

          if (data) {
            const statusMessage =
              data.flag === 1
                ? "선택하신 문장은 유용한 문장으로 판단됩니다 😀"
                : data.flag === 0
                ? "선택하신 문장은 중립적인 문장으로 판단됩니다 😐"
                : "선택하신 문장은 유해한 문장으로 판단됩니다 😕";

            let goodOptionsList = "";
            let badOptionsList = "";

            if (data.goodOption && (data.flag === 1 || data.flag === 0)) {
              goodOptionsList =
                `<div style="margin-top: 1.5625rem;">[긍정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;">` +
                data.goodOption
                  .map(
                    (option) =>
                      `<li style="margin-top: 0.3125rem;">• ${
                        optionName[option - 1]
                      }</li>`
                  )
                  .join("") +
                "</ul></div>";
            }

            if (data.badOption && (data.flag === -1 || data.flag === 0)) {
              badOptionsList =
                `<div style="margin-top: 1.5625rem;">[부정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;">` +
                data.badOption
                  .map(
                    (option) =>
                      `<li style="margin-top: 0.3125rem;">• ${
                        optionName[option - 1]
                      }</li>`
                  )
                  .join("") +
                "</ul></div>";
            }

            modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div>
            <p style="text-align: center; font-weight: bold; margin-bottom: 10px;">${statusMessage}</p>
            ${goodOptionsList}
            ${badOptionsList}
          </div>
        </div>`;
          }

          modal.style.display = "block"; // 먼저 보이게 하여 높이를 측정할 수 있도록 함

          const rect = event.target.getBoundingClientRect();
          const scrollY =
            iframe.contentWindow.pageYOffset ||
            iframe.contentWindow.document.documentElement.scrollTop;
          const scrollX =
            iframe.contentWindow.pageXOffset ||
            iframe.contentWindow.document.documentElement.scrollLeft;

          // Adjust modal position to show above the element
          modal.style.top = `${rect.top + scrollY - modal.offsetHeight - 10}px`; // 위치 조정
          modal.style.left = `${rect.left + scrollX}px`;
        }
        function hideModal() {
          const modal = iframeDoc.getElementById("hover-modal");
          if (modal) {
            modal.style.display = "none";
          }
        }
        // 모달 끝

        // 크롤링 시작
        var elementsArray = Array.from(iframeElements);
        var divArray = Array.from(elementsArray[0].children);
        divArray.forEach(function (div) {
          var imgTags = div.getElementsByTagName("img");
          var spanTags = div.getElementsByTagName("span");

          Array.from(imgTags).forEach(function (img) {
            var dataLinkData = img.parentNode.getAttribute("data-linkdata");
            if (dataLinkData) {
              try {
                var linkData = JSON.parse(dataLinkData);
                var id = linkData.id;
                if (id == null) return;
                var src = linkData.src;
                if (!src.includes("gif")) {
                  crawlResults.push({
                    type: "img",
                    data: src,
                    id: id,
                  });
                }
              } catch (e) {
                console.error("JSON parsing error", e);
              }
            }
          });

          Array.from(spanTags).forEach(function (span) {
            var textContent = span.textContent || span.innerText;
            var id = span.getAttribute("id");
            if (id == null) return;
            crawlResults.push({
              type: "txt",
              data: textContent,
              id: id,
            });
          });
        });
        // 크롤링 end
        console.log(crawlResults);

        // 인공지능 관련 데이터 받아오기
        chrome.runtime.sendMessage(
          { action: "detail", crawlResults: crawlResults },
          function (response) {
            var listData = response.data.adDetection;
            var newData = {
              option: 5,
              goodList: listData.goodList,
              badList: listData.badList,
            };
            tmpData.push(newData);
            console.log(tmpData);

            // Coloring 시작
            finalResult = processData(tmpData);
            console.log(finalResult);
            Object.keys(finalResult).forEach((id) => {
              const data = finalResult[id];
              const element = document
                .getElementById("mainFrame")
                .contentWindow.document.getElementById(id);
              if (element) {
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
        );
      }
    }, 100);
  }
}
