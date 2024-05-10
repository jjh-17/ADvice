// 기본 테스트 블로그 : https://blog.naver.com/gospel416/223425484859
// 내돈내산 옵션 테스트 블로그 : https://blog.naver.com/cuteeun10/223220966756
// 광고유도 테스트 블로그 : https://blog.naver.com/alsrud_90/223425197896

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

var tmpData = [];

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

var optionThreeflag = false;
function optionTwo(iframeDoc) {
  const blackList = [
    "https://coupa.ng/",
    "https://link.coupang.com/",
    "https://api3.myrealtrip.com/",
    "https://smartstore.naver.com",
  ];
  var elements = iframeDoc.querySelectorAll(".se-module-oglink");

  var flag = selectedGoodOption.includes(2);

  elements.forEach(function (element) {
    console.log(element);
    var link = element.querySelector("a").href; // 자식 요소 중 첫 번째 <a> 태그의 href 속성을 가져옵니다.

    // blackList의 링크들이 포함되어 있는지 확인합니다.
    if (
      blackList.some(function (blacklistURL) {
        return link.includes(blacklistURL);
      })
    ) {
      // 포함되어 있다면 해당 요소의 색상을 변경합니다.
      // 뒷 배경 색칠
      const originalWidth = element.offsetWidth; // 원래 요소의 너비를 가져옵니다.
      const newWidth = originalWidth + 30; // 원래 너비보다 20px 더 넓게 설정합니다.

      // 배경색을 flag의 값에 따라 조정합니다.
      const backgroundColor = flag
        ? "rgba(66, 189, 101, 0.15)"
        : "rgba(241, 43, 67, 0.15)"; // 초록색 또는 빨간색

      // 래퍼 div를 생성하고 스타일을 설정합니다.
      const wrapperHTML = `
      <div class="custom-wrapper" style="width: ${newWidth}px; background-color: ${backgroundColor}; padding: 15px; box-sizing: border-box; margin: 0 auto;">
      </div>
    `;

      // 요소 뒤에 래퍼를 삽입하고 요소를 그 안으로 이동시킵니다.
      element.insertAdjacentHTML("afterend", wrapperHTML);
      const wrapper = element.nextElementSibling;
      wrapper.appendChild(element);

      // 모달 띄우기
      element.addEventListener("mouseover", function (event) {
        let modal = iframeDoc.getElementById("hover-modal");
        if (!modal) {
          modal = iframeDoc.createElement("div");
          modal.id = "hover-modal";
          modal.style.cssText =
            "position: absolute; padding: 20px; background: white; border: 1px solid black; z-index: 1000; display: none;";
          iframeDoc.body.appendChild(modal);
        }

        let statusMessage = "";
        let optionResult = "";
        if (flag) {
          statusMessage = "선택하신 부분은 유용한 부분으로 판단됩니다 😀";
          optionResult = `<div style="margin-top: 1.5625rem;">[긍정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 구매 링크나 특정 사이트로의 유도 링크가 포함</li></ul></div>`;
        } else {
          statusMessage = "선택하신 부분은 유해한 부분으로 판단됩니다 😕";
          optionResult = `<div style="margin-top: 1.5625rem;">[부정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 구매 링크나 특정 사이트로의 유도 링크가 포함</li></ul></div>`;
        }

        modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;"><div><p style="text-align: center; font-weight: bold; margin-bottom: 10px;">${statusMessage}</p>${optionResult}</div></div>`;
        modal.style.display = "block";

        const rect = event.target.getBoundingClientRect();
        const scrollY =
          iframeDoc.defaultView.pageYOffset ||
          iframeDoc.documentElement.scrollTop;
        const scrollX =
          iframeDoc.defaultView.pageXOffset ||
          iframeDoc.documentElement.scrollLeft;

        // Adjust modal position to show above the element
        modal.style.top = `${rect.top + scrollY - modal.offsetHeight - 10}px`; // 위치 조정
        modal.style.left = `${rect.left + scrollX}px`;
      });
      element.addEventListener("mouseout", function (event) {
        const modal = iframeDoc.getElementById("hover-modal");
        if (modal) {
          modal.style.display = "none";
        }
      });
    }
  });
}
function optionThree(iframeDoc) {
  var elements = iframeDoc.querySelectorAll(
    ".not_sponsored_component, .not_sponsored_summary"
  );

  var flag = selectedGoodOption.includes(3);
  console.log(flag);

  elements.forEach((element) => {
    // 뒷 배경 색칠
    const originalWidth = element.offsetWidth; // 원래 요소의 너비를 가져옵니다.
    const newWidth = originalWidth + 30; // 원래 너비보다 20px 더 넓게 설정합니다.

    // 배경색을 flag의 값에 따라 조정합니다.
    const backgroundColor = flag
      ? "rgba(66, 189, 101, 0.15)"
      : "rgba(241, 43, 67, 0.15)"; // 초록색 또는 빨간색

    // 래퍼 div를 생성하고 스타일을 설정합니다.
    const wrapperHTML = `
      <div class="custom-wrapper" style="width: ${newWidth}px; background-color: ${backgroundColor}; padding: 15px; box-sizing: border-box; margin: 0 auto;">
      </div>
    `;

    // 요소 뒤에 래퍼를 삽입하고 요소를 그 안으로 이동시킵니다.
    element.insertAdjacentHTML("afterend", wrapperHTML);
    const wrapper = element.nextElementSibling;
    wrapper.appendChild(element);

    // 모달 띄우기
    element.addEventListener("mouseover", function (event) {
      let modal = iframeDoc.getElementById("hover-modal");
      if (!modal) {
        modal = iframeDoc.createElement("div");
        modal.id = "hover-modal";
        modal.style.cssText =
          "position: absolute; padding: 20px; background: white; border: 1px solid black; z-index: 1000; display: none;";
        iframeDoc.body.appendChild(modal);
      }

      let statusMessage = "";
      let optionResult = "";
      if (flag) {
        statusMessage = "선택하신 부분은 유용한 부분으로 판단됩니다 😀";
        optionResult = `<div style="margin-top: 1.5625rem;">[긍정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 내돈내산 인증 포함</li></ul></div>`;
      } else {
        statusMessage = "선택하신 부분은 유해한 부분으로 판단됩니다 😕";
        optionResult = `<div style="margin-top: 1.5625rem;">[부정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 내돈내산 인증 포함</li></ul></div>`;
      }

      modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;"><div><p style="text-align: center; font-weight: bold; margin-bottom: 10px;">${statusMessage}</p>${optionResult}</div></div>`;
      modal.style.display = "block";

      const rect = event.target.getBoundingClientRect();
      const scrollY =
        iframeDoc.defaultView.pageYOffset ||
        iframeDoc.documentElement.scrollTop;
      const scrollX =
        iframeDoc.defaultView.pageXOffset ||
        iframeDoc.documentElement.scrollLeft;

      // Adjust modal position to show above the element
      modal.style.top = `${rect.top + scrollY - modal.offsetHeight - 10}px`; // 위치 조정
      modal.style.left = `${rect.left + scrollX}px`;
    });
    element.addEventListener("mouseout", function (event) {
      const modal = iframeDoc.getElementById("hover-modal");
      if (modal) {
        modal.style.display = "none";
      }
    });
  });
}
function optionFour(keyword) {
  let optionFourList = [];

  crawlResults.forEach((item) => {
    if (item.type === "txt" && item.data.includes(keyword)) {
      optionFourList.push({
        id: item.id,
        data: item.data,
      });
    }
  });

  const result = {
    option: 4,
    goodList: optionFourList,
    badList: optionFourList,
  };
  tmpData.push(result);
}
function optionFive(iframeDoc) {
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

        // 옵션 확인
        if (selectedGoodOption.includes(4) || selectedBadOption.includes(4)) {
          optionFour("경주");
        }
        if (selectedGoodOption.includes(3) || selectedBadOption.includes(3)) {
          optionThree(iframeDoc);
        }
        if (selectedGoodOption.includes(2) || selectedBadOption.includes(2)) {
          optionTwo(iframeDoc);
        }
        if (selectedGoodOption.includes(5) || selectedBadOption.includes(5)) {
          optionFive(iframeDoc);
        }
      }
    }, 100);
  }
}
