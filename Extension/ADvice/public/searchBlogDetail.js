var iframe = document.getElementById("mainFrame");
var optionName = [
  "사진(image)/영상(video)/링크/지도(placeMap)/ 등 다양성",
  "구매 링크나 특정 사이트로의 유도 링크가 포함되어 있는 경우",
  "내돈내산 인증 포함",
  "특정 키워드 포함",
  "광고 문구",
  "장점/단점 비율",
  "객관적인 정보 포함",
  "인위적인 사진 포함",
];
var tmpData = [];
var selectedBadOption = [];
var selectedGoodOption = [];
var optionCnt = 0;
var crawlResults = []; // input용
var crawlTextResults = []; // input에서 text만
var finalResult = []; // Coloring 대상 text
var resultMap = {}; // text를 id-last로 연결하는 map
var finalCaptureResult = [];
const extensionId = chrome.runtime.id;
var backupModal;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message);
  if (message.action === "updateCheck") {
    if (message.isChecked) {
      setting();
    } else {
      unsetting();
    }
  }
});

function unsetting() {
  // Text로 오는 것 Unsetting
  unColoring();

  const wrappers = Array.from(
    document
      .getElementById("mainFrame")
      .contentWindow.document.getElementsByClassName("custom-wrapper")
  );

  // 각 'custom-wrapper' 요소에 대해 자식 요소를 유지하면서 요소 자체를 제거
  wrappers.forEach((wrapper) => {
    const parent = wrapper.parentNode; // 부모 요소를 찾습니다.
    while (wrapper.firstChild) {
      parent.insertBefore(wrapper.firstChild, wrapper); // 각 자식 요소를 부모 요소에 직접 삽입합니다.
    }
    parent.removeChild(wrapper); // 'custom-wrapper' 요소를 제거합니다.
  });

  // 'hover-modal'을 포함하는 모든 클래스를 가진 요소 선택 후 삭제
  const hoverModals = Array.from(
    document
      .getElementById("mainFrame")
      .contentWindow.document.querySelectorAll("[id*='hover-modal']")
  );
  console.log(hoverModals);
  // 'hover-modal'을 포함하는 클래스를 가진 모든 요소를 찾아서 삭제
  hoverModals.forEach((modal) => {
    const parent = modal.parentNode;
    parent.removeChild(modal);
  });

  const analysisModal = document
    .getElementById("mainFrame")
    .contentWindow.document.getElementById("analysis");
  analysisModal.parentNode.removeChild(analysisModal);
}

function setting() {
  // Text 컬러링 다시 setting
  coloring();

  // 이미지 컬러링 다시 셋팅
  finalCaptureResult.forEach((id) => {
    var element = document
      .getElementById("mainFrame")
      .contentWindow.document.getElementById(id);

    if (element && element.firstElementChild) {
      element.firstElementChild.style.padding = "0";
      element.firstElementChild.style.margin = "0";

      const originalWidth = element.offsetWidth;
      const backgroundColor = selectedGoodOption.includes(8)
        ? "rgba(66, 189, 101, 0.15)"
        : "rgba(241, 43, 67, 0.15)";

      const wrapperHTML = `
        <div class="custom-wrapper" style="width: ${originalWidth}px; background-color: ${backgroundColor}; padding: 15px; box-sizing: border-box; margin: 0 auto;">
        </div>
      `;
      element.insertAdjacentHTML("afterend", wrapperHTML);
      const wrapper = element.nextElementSibling;
      wrapper.appendChild(element);

      const images = wrapper.getElementsByTagName("img");
      Array.from(images).forEach((img) => {
        img.style.maxWidth = "100%"; // 부모 요소 너비에 맞게 이미지 크기 조정
        img.style.height = "auto"; // 이미지의 비율을 유지하면서 높이 자동 조정
      });
    }
  });

  optionTwo(document.getElementById("mainFrame").contentWindow.document);
  optionThree(document.getElementById("mainFrame").contentWindow.document);

  // 타겟 컨테이너 선택 및 모달 삽입
  const targetContainer = document
    .getElementById("mainFrame")
    .contentWindow.document.getElementsByClassName("se-main-container")[0];

  if (targetContainer) {
    targetContainer.prepend(backupModal);
  }
}

chrome.storage.sync.get(["badOption"], (result) => {
  if (result.badOption) {
    selectedBadOption = Object.values(result.badOption).map((obj) => obj.index);
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

function processData(tmpData) {
  let result = {};
  tmpData.forEach((node) => {
    if (selectedGoodOption.includes(node.option)) {
      node.list.forEach((data) => {
        if (!result[data.id]) {
          result[data.id] = { goodOption: [], badOption: [], flag: 0 };
        }
        result[data.id].goodOption.push({
          option: node.option,
          score: data.score,
          type: data.type,
        });
      });
    } else if (selectedBadOption.includes(node.option)) {
      node.list.forEach((data) => {
        if (!result[data.id]) {
          result[data.id] = { goodOption: [], badOption: [], flag: 0 };
        }
        result[data.id].badOption.push({
          option: node.option,
          score: data.score,
          type: data.type,
        });
      });
    }
  });

  Object.keys(result).forEach((id) => {
    let entry = result[id];
    if (entry.goodOption.length > entry.badOption.length) {
      entry.flag = 1; // more good options
    } else if (entry.goodOption.length === entry.badOption.length) {
      entry.flag = 0; // neutral
    } else {
      entry.flag = -1; // more bad options
    }
  });

  return result;
}

function optionTwo(iframeDoc) {
  //  구매 링크나 특정 사이트로의 유도 링크가 포함되어 있는 경우
  if (selectedGoodOption.includes(2) || selectedBadOption.includes(2)) {
    const blackList = [
      "https://coupa.ng/",
      "https://link.coupang.com/",
      "https://www.coupang.com",
      "https://api3.myrealtrip.com/",
      "https://smartstore.naver.com",
    ];
    var elements = iframeDoc.querySelectorAll(".se-module-oglink");
    var changesMade = false;

    elements.forEach(function (element) {
      var link = element.querySelector("a").href;
      if (blackList.some((blacklistURL) => link.includes(blacklistURL))) {
        changesMade = true;
        const originalWidth = element.offsetWidth;
        const newWidth = originalWidth + 30;
        const backgroundColor = selectedGoodOption.includes(2)
          ? "rgba(66, 189, 101, 0.15)"
          : "rgba(241, 43, 67, 0.15)";

        const wrapperHTML = `
            <div class="custom-wrapper" style="width: ${newWidth}px; background-color: ${backgroundColor}; padding: 15px; box-sizing: border-box; margin: 0 auto;">
            </div>
          `;
        element.insertAdjacentHTML("afterend", wrapperHTML);
        const wrapper = element.nextElementSibling;
        wrapper.appendChild(element);

        let modal = iframeDoc.createElement("div");
        var random = Math.floor(
          Math.random() * (999999999 - 111111111 + 1) + 111111111
        );
        modal.id = "hover-modal " + random;

        modal.style.position = "absolute";
        modal.style.padding = "20px";
        modal.style.background = "white";
        modal.style.border = "1px solid black";
        modal.style.zIndex = "1000";

        var flag = selectedGoodOption.includes(3);
        if (flag) {
          statusMessage = "해당 항목은 유용한 항목으로 판단됩니다 😀";
          optionResult = `<div style="margin-top: 1.5625rem; font-size : 0.8rem;">[긍정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 구매 유도 링크 포함</li></ul></div>`;
        } else {
          statusMessage = "해당 항목은 유해한 항목으로 판단됩니다 😕";
          optionResult = `<div style="margin-top: 1.5625rem; font-size : 0.8rem;">[부정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 구매 유도 링크 포함</li></ul></div>`;
        }
        //modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;"><div><p style="text-align: center; font-weight: bold; margin-bottom: 10px;">${statusMessage}</p>${optionResult}</div></div>`;

        modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div>
          <div style="display: flex; align-items: center;" onclick="document.getElementById('hover-modal ${random}').remove();">
            <p style="text-align: center; font-weight: bold; margin-bottom: 0; margin-top: 0; font-size : 0.8rem;">${statusMessage}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16" style="cursor: pointer; margin-left: 10px;">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </div>
          ${optionResult}
        </div>
      </div>`;

        const rect = element.getBoundingClientRect();

        modal.style.left = "-200px";
        var parent = element.parentNode;
        var nextSibling = parent.nextSibling;
        var grandParent = parent.parentNode; // parent의 부모를 참조

        if (!grandParent.className.includes("se-caption")) {
          var div = iframeDoc.createElement("div");

          div.appendChild(modal);
          div.appendChild(parent);

          // 적절한 위치에 div 삽입
          if (nextSibling) {
            grandParent.insertBefore(div, nextSibling);
          } else {
            grandParent.appendChild(div);
          }
        } else {
          console.log("Operation cancelled: 'se-caption' class found.");
        }
      }
    });
  }
}

function optionThree(iframeDoc) {
  // 내돈내산 인증 포함
  if (selectedGoodOption.includes(3) || selectedBadOption.includes(3)) {
    var elements = iframeDoc.querySelectorAll(
      ".not_sponsored_component, .not_sponsored_summary"
    );

    elements.forEach((element) => {
      const originalWidth = element.offsetWidth;
      const newWidth = originalWidth + 30;
      const backgroundColor = selectedGoodOption.includes(3)
        ? "rgba(66, 189, 101, 0.15)"
        : "rgba(241, 43, 67, 0.15)";

      const wrapperHTML = `
          <div class="custom-wrapper" style="width: ${newWidth}px; background-color: ${backgroundColor}; padding: 15px; box-sizing: border-box; margin: 0 auto;">
          </div>
        `;
      element.insertAdjacentHTML("afterend", wrapperHTML);
      const wrapper = element.nextElementSibling;
      wrapper.appendChild(element);

      let modal = iframeDoc.createElement("div");
      var random = Math.floor(
        Math.random() * (999999999 - 111111111 + 1) + 111111111
      );
      modal.id = "hover-modal " + random;

      modal.style.position = "absolute";
      modal.style.padding = "20px";
      modal.style.background = "white";
      modal.style.border = "1px solid black";
      modal.style.zIndex = "1000";

      var flag = selectedGoodOption.includes(3);
      if (flag) {
        statusMessage = "해당 항목은 유용한 항목으로 판단됩니다 😀";
        optionResult = `<div style="margin-top: 1.5625rem; font-size : 0.8rem;">[긍정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 내돈내산 인증 포함</li></ul></div>`;
      } else {
        statusMessage = "해당 항목은 유해한 항목으로 판단됩니다 😕";
        optionResult = `<div style="margin-top: 1.5625rem; font-size : 0.8rem;">[부정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 내돈내산 인증 포함</li></ul></div>`;
      }
      //modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;"><div><p style="text-align: center; font-weight: bold; margin-bottom: 10px;">${statusMessage}</p>${optionResult}</div></div>`;

      modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div>
        <div style="display: flex; align-items: center;" onclick="document.getElementById('hover-modal ${random}').remove();">
          <p style="text-align: center; font-weight: bold; margin-bottom: 0; margin-top: 0; font-size : 0.8rem;">${statusMessage}</p>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16" style="cursor: pointer; margin-left: 10px;">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
          </svg>
        </div>
        ${optionResult}
      </div>
    </div>`;

      const rect = element.getBoundingClientRect();

      modal.style.left = "-200px";
      var parent = element.parentNode;
      var nextSibling = parent.nextSibling;
      var grandParent = parent.parentNode; // parent의 부모를 참조

      if (!grandParent.className.includes("se-caption")) {
        var div = iframeDoc.createElement("div");

        div.appendChild(modal);
        div.appendChild(parent);

        // 적절한 위치에 div 삽입
        if (nextSibling) {
          grandParent.insertBefore(div, nextSibling);
        } else {
          grandParent.appendChild(div);
        }
      } else {
        console.log("Operation cancelled: 'se-caption' class found.");
      }
    });
  }
}

function optionFour(crawlTextResults) {
  // 특정 키워드 포함
  return new Promise((resolve, reject) => {
    if (selectedGoodOption.includes(4) || selectedBadOption.includes(4)) {
      let optionFourList = [];
      chrome.storage.sync.get(["keyword"], (result) => {
        let keyword = result.keyword;
        crawlTextResults.forEach((item) => {
          if (item.content.includes(keyword)) {
            optionFourList.push({ id: item.admin });
          }
        });
        tmpData.push({
          option: 4,
          list: optionFourList,
        });
        resolve();
      });
    } else {
      resolve();
    }
  });
}

function optionFive(crawlResults) {
  return new Promise((resolve, reject) => {
    if (selectedGoodOption.includes(5) || selectedBadOption.includes(5)) {
      chrome.runtime.sendMessage(
        { action: "detail-textad", crawlResults: crawlResults },
        function (response) {
          console.log(response.data);
          var listData = response.data.result;
          var updatedList = [];
          listData.forEach((data) => {
            if (data.score !== 0) {
              updatedList.push({
                id: data.id,
                type: data.type,
              });
            }
          });

          var newData = {
            option: 5,
            list: updatedList,
          };
          tmpData.push(newData);
          resolve();
        }
      );
    } else {
      resolve();
    }
  });
}

function optionSeven() {
  return new Promise((resolve, reject) => {
    if (selectedGoodOption.includes(7) || selectedBadOption.includes(7)) {
      chrome.runtime.sendMessage(
        { action: "detail-objective", crawlResults: crawlResults },
        function (response) {
          var listData = response.data.result;
          var updatedList = [];
          listData.forEach((data) => {
            if (data.score >= 50) {
              updatedList.push({
                id: data.id,
                score: parseInt(data.score),
              });
            }
          });

          console.log(response.data.result);
          var newData = {
            option: 7,
            list: updatedList,
          };
          tmpData.push(newData);
          resolve();
        }
      );
    } else {
      resolve();
    }
  });
}

function optionEight(crawlResults, iframeDoc) {
  // 인위적인 사진 포함
  return new Promise((resolve, reject) => {
    if (selectedGoodOption.includes(8) || selectedBadOption.includes(8)) {
      chrome.runtime.sendMessage(
        { action: "detail-imagead", crawlResults: crawlResults },
        function (response) {
          var listData = response.data;
          console.log(listData);

          listData.forEach((data) => {
            if (data.score >= 2) {
              var element = iframeDoc.getElementById(data.id);
              finalCaptureResult.push(data.id);
              if (element && element.firstElementChild) {
                element.firstElementChild.style.padding = "0";

                if (element.firstElementChild.firstElementChild) {
                  element.firstElementChild.firstElementChild.style.margin =
                    "0";
                }

                const originalWidth = element.offsetWidth;
                const backgroundColor = selectedGoodOption.includes(8)
                  ? "rgba(66, 189, 101, 0.15)"
                  : "rgba(241, 43, 67, 0.15)";

                const wrapperHTML = `
                <div class="custom-wrapper" style="width: ${originalWidth}px; background-color: ${backgroundColor}; padding: 15px; box-sizing: border-box; margin: 0 auto;">
                </div>
              `;
                element.insertAdjacentHTML("afterend", wrapperHTML);
                const wrapper = element.nextElementSibling;
                wrapper.appendChild(element);

                const images = wrapper.getElementsByTagName("img");
                Array.from(images).forEach((img) => {
                  img.style.maxWidth = "100%"; // 부모 요소 너비에 맞게 이미지 크기 조정
                  img.style.height = "auto"; // 이미지의 비율을 유지하면서 높이 자동 조정
                });
              }

              if (element) {
                let modal = iframeDoc.createElement("div");
                var random = Math.floor(
                  Math.random() * (999999999 - 111111111 + 1) + 111111111
                );
                modal.id = "hover-modal-img" + random;

                modal.style.position = "absolute";
                modal.style.padding = "20px";
                modal.style.background = "white";
                modal.style.border = "1px solid black";
                modal.style.zIndex = "1000";

                var flag = selectedGoodOption.includes(8);
                if (flag) {
                  statusMessage = "해당 항목은 유용한 항목으로 판단됩니다 😀";
                  optionResult = `<div style="margin-top: 1.5625rem; font-size : 0.8rem;">[긍정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 인위적인 사진 포함</li></ul></div>`;
                } else {
                  statusMessage = "해당 항목은 유해한 항목으로 판단됩니다 😕";
                  optionResult = `<div style="margin-top: 1.5625rem; font-size : 0.8rem;">[부정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 인위적인 사진 포함</li></ul></div>`;
                }
                //modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;"><div><p style="text-align: center; font-weight: bold; margin-bottom: 10px;">${statusMessage}</p>${optionResult}</div></div>`;

                modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div>
          <div style="display: flex; align-items: center;" onclick="document.getElementById('hover-modal ${random}').remove();">
            <p style="text-align: center; font-weight: bold; margin-bottom: 0; margin-top: 0; font-size : 0.8rem;">${statusMessage}</p>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16" style="cursor: pointer; margin-left: 10px;">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
          </div>
          ${optionResult}
        </div>
      </div>`;

                const rect = element.getBoundingClientRect();

                modal.style.left = "-200px";
                var parent = element.parentNode;
                var nextSibling = parent.nextSibling;
                var grandParent = parent.parentNode; // parent의 부모를 참조

                if (!grandParent.className.includes("se-caption")) {
                  var div = iframeDoc.createElement("div");

                  div.appendChild(modal);
                  div.appendChild(parent);

                  // 적절한 위치에 div 삽입
                  if (nextSibling) {
                    grandParent.insertBefore(div, nextSibling);
                  } else {
                    grandParent.appendChild(div);
                  }
                }
              }
            }
          });
          resolve(); // 비동기 처리가 완료된 후에 resolve를 호출
        }
      );
    } else {
      resolve(); // 조건에 맞지 않을 경우에도 resolve 호출
    }
  });
}

// 문단 분리기
function groupingTextCrawl(results) {
  const bundles = [];
  let currentBundle = { admin: null, last: [], content: "" };
  let previousType = null;

  results.forEach((result, index) => {
    // 타입이 변경될 때 기존 bundle 처리
    if (result.type !== previousType) {
      // 텍스트에서 이미지로 변경되는 시점에 현재 bundle 저장
      if (
        (previousType === "txt" && result.type === "img") ||
        (previousType === "txt" && result.type === "link")
      ) {
        if (currentBundle.admin) {
          // admin이 설정되었다면 bundle을 저장
          bundles.push(currentBundle);
        }
        currentBundle = { admin: null, last: [], content: "" }; // 새로운 bundle 초기화
      }
      // 이미지에서 텍스트로 변경되는 시점, 여기서 admin 설정 변경을 고려하지 않음
      else if (previousType === "img" && result.type === "txt") {
        // 여기서는 admin 설정하지 않음
      }
      previousType = result.type;
    }

    // 텍스트 처리
    if (result.type === "txt") {
      currentBundle.last.push(result.id);
      const element = iframe.contentWindow.document.getElementById(result.id);
      if (element) {
        const textContent = element.textContent.replace(/\s/g, ""); // 유니코드 공백문자 제거
        if (element.textContent.charCodeAt(0) !== 8203) {
          // 텍스트가 비어있지 않은 경우에만 처리
          currentBundle.content += textContent;
          if (!currentBundle.admin) {
            // 첫 번째 비어있지 않은 텍스트를 가진 요소의 ID를 admin으로 설정
            currentBundle.admin = result.id;
          }
        }
      }
    }

    // 마지막 요소 처리, 배열의 끝에 도달했고 현재 처리중인 타입이 텍스트인 경우
    if (index === results.length - 1 && result.type === "txt") {
      if (currentBundle.admin) {
        // admin이 설정된 경우만 최종적으로 저장
        bundles.push(currentBundle);
      }
    }
  });

  return bundles;
}

function coloring() {
  Object.keys(finalResult).forEach((id) => {
    const data = finalResult[id];
    const last = resultMap[id].last;
    last.push(id);

    if (data.flag === 1) {
      statusMessage = "해당 항목은 유용한 항목으로 판단됩니다 😀";
      last.forEach((id) => {
        const element = document
          .getElementById("mainFrame")
          .contentWindow.document.getElementById(id);
        let html = element.innerHTML;
        element.style.backgroundColor = "rgba(66, 189, 101, 0.3)"; // Green for good options
        element.innerHTML = html;
      });
    } else if (data.flag === 0) {
      statusMessage = "해당 항목은 중립적인 항목으로 판단됩니다 😐";
      last.forEach((id) => {
        const element = document
          .getElementById("mainFrame")
          .contentWindow.document.getElementById(id);
        let html = element.innerHTML;
        element.style.backgroundColor = "rgba(255, 235, 59, 0.3)"; // Yellow for neutral
        element.innerHTML = html;
      });
    } else {
      statusMessage = "해당 항목은 유해한 항목으로 판단됩니다 😕";
      last.forEach((id) => {
        const element = document
          .getElementById("mainFrame")
          .contentWindow.document.getElementById(id);
        let html = element.innerHTML;
        element.style.backgroundColor = "rgba(241, 43, 67, 0.3)";
        element.innerHTML = html;
      });
    }

    // 모달이었던 것 띄우기
    const iframeDoc =
      document.getElementById("mainFrame").contentWindow.document;
    let modal = iframeDoc.getElementById("hover-modal");

    if (!modal) {
      modal = iframeDoc.createElement("div");
      modal.id = "hover-modal " + id;
      modal.style.position = "absolute";
      modal.style.padding = "20px";
      modal.style.background = "white";
      modal.style.border = "1px solid black";
      modal.style.zIndex = "1000";
    }

    let goodOptionsList = "";
    let badOptionsList = "";
    if (data.goodOption && (data.flag === 1 || data.flag === 0)) {
      goodOptionsList =
        `<div style="margin-top: 1.5625rem; font-size : 0.8rem;">[긍정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;">` +
        data.goodOption
          .map((option) => {
            // option.score가 undefined가 아닐 때 "- ${option.score}% 확률" 추가
            const scoreText =
              option.score !== undefined ? ` - ${option.score}% 확률` : "";
            return `<li style="margin-top: 0.3125rem; font-size : 0.8rem;">• ${
              optionName[option.option - 1]
            }${scoreText}</li>`;
          })
          .join("") +
        "</ul></div>";
    }

    if (data.badOption && (data.flag === -1 || data.flag === 0)) {
      badOptionsList =
        `<div style="margin-top: 1.5625rem; font-size : 0.8rem;">[부정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;">` +
        data.badOption
          .map((option) => {
            // option.score가 undefined가 아닐 때 "- ${option.score}% 확률" 추가
            const scoreText =
              option.score !== undefined ? ` - ${option.score}% 확률` : "";
            const scoreType =
              option.type !== undefined ? ` - ${option.type}` : "";
            return `<li style="margin-top: 0.3125rem; font-size : 0.8rem;">• ${
              optionName[option.option - 1]
            }${scoreText}${scoreType}</li>`;
          })
          .join("") +
        "</ul></div>";
    }
    modal.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
  <div>
    <div style="display: flex; align-items: center;" onclick="document.getElementById('hover-modal ${id}').remove();">
      <p style="text-align: center; font-weight: bold; margin-bottom: 0; margin-top: 0; font-size : 0.8rem;">${statusMessage}</p>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16" style="cursor: pointer; margin-left: 10px;">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
      </svg>
    </div>
    ${goodOptionsList}
    ${badOptionsList}
  </div>
</div>`;

    const element = document
      .getElementById("mainFrame")
      .contentWindow.document.getElementById(id);
    const rect = element.getBoundingClientRect();
    // modal.style.display = "block";
    // modal.style.top = "0px";
    modal.style.left = "-200px";
    // element의 부모 요소를 가져옵니다.
    var parent = element.parentNode;
    var nextSibling = parent.nextSibling;
    var grandParent = parent.parentNode; // parent의 부모를 참조

    if (!grandParent.className.includes("se-caption")) {
      var div = iframeDoc.createElement("div");
      div.appendChild(modal);
      div.appendChild(parent);

      // 적절한 위치에 div 삽입
      if (nextSibling) {
        grandParent.insertBefore(div, nextSibling);
      } else {
        grandParent.appendChild(div);
      }
    } else {
      console.log("Operation cancelled: 'se-caption' class found.");
    }
  });
}

function unColoring() {
  Object.keys(finalResult).forEach((id) => {
    const data = finalResult[id];
    const last = resultMap[id].last;
    last.push(id);

    last.forEach((id) => {
      const element = document
        .getElementById("mainFrame")
        .contentWindow.document.getElementById(id);
      let html = element.innerHTML;
      element.style.backgroundColor = ""; // 색 제거
      element.innerHTML = html;
    });
  });
}

async function getKeyword() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["keyword"], (result) => {
      resolve(result.keyword);
    });
  });
}

async function getResponse(
  url,
  selectedGoodOption,
  selectedBadOption,
  keyword
) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        action: "searchAPI",
        urlList: [url],
        goodOption: selectedGoodOption,
        badOption: selectedBadOption,
        keyword: keyword,
      },
      function (res) {
        resolve(res);
      }
    );
  });
}

async function makeDiv(response, iframeDoc) {
  let keyword = "";
  let total = 0;
  let responseScore = [];

  console.log(response);

  // keyword 찾기
  if (selectedGoodOption.includes(4) || selectedBadOption.includes(4)) {
    keyword = await getKeyword();
  }

  // response 받기
  if (
    response.score === undefined ||
    response.score.length === 0 ||
    response.score[0].cnt === undefined
  ) {
    const res = await getResponse(
      response.url,
      selectedGoodOption,
      selectedBadOption,
      keyword
    );
    console.log(res);
    total = res.data.scoreList[0].cnt;
    responseScore = res.data.scoreList[0].optionScore[0];
  } else {
    total = response.score[0].cnt;
    responseScore = response.score[0].optionScore[0];
  }

  // 모달 띄우기
  const modal = iframeDoc.createElement("div");
  modal.id = "analysis";
  modal.style.position = "relative";
  modal.style.padding = "20px";
  modal.style.background = "white";
  modal.style.border = "1px solid black";
  modal.style.zIndex = "1000";
  modal.innerHTML = `
    <div style="width: 100%; text-align: center; font-size: 1rem; font-weight: bold; margin-bottom:10px;">
      [게시글 간단 요약]
    </div>
  `;

  var flag = false;

  responseScore.forEach((element, index) => {
    element = Math.abs(element); // score 절댓값 처리
    console.log(`Element: ${element}, Index: ${index}`);
    if (element !== 980329) {
      console.log(optionName[index - 1]);
      if (index === 1) {
        flag = true;
        if (element === Math.abs(100)) {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 15px;">
                <b>[Option ${index}]</b> 사진, 영상, 링크, 지도 정보가 모두 포함되어 있습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        } else if (element === Math.abs(75)) {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 15px;">
                <b>[Option ${index}]</b> 사진, 영상, 링크, 지도 중 세 가지가 포함되어 있습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        } else if (element === Math.abs(50)) {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 15px;">
                <b>[Option ${index}]</b> 사진, 영상, 링크, 지도 중 두 가지가 포함되어 있습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        } else if (element === Math.abs(25)) {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 15px;">
                <b>[Option ${index}]</b> 사진, 영상, 링크, 지도 중 한 가지가 포함되어 있습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        } else {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 15px;">
                <b>[Option ${index}]</b> 텍스트로만 구성된 게시글입니다.
              </div>
              ${graph(index, element)}
            </div>`;
        }
      } else if (index === 2) {
        flag = true;
        if (element === Math.abs(100)) {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 10px;">
                <b>[Option ${index}]</b> 구매 유도 링크가 포함되어 있습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        } else {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 10px;">
                <b>[Option ${index}]</b> 구매 유도 링크가 포함되어 있지 않습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        }
      } else if (index === 3) {
        flag = true;
        if (element === Math.abs(100)) {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 10px;">
                <b>[Option ${index}]</b> 내돈내산 인증이 포함되어 있습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        } else {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 10px;">
                <b>[Option ${index}]</b> 내돈내산 인증이 포함되어 있지 않습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        }
      } else if (index === 4) {
        flag = true;
        let result = Math.floor((parseFloat(element) * parseInt(total)) / 100);
        modal.innerHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
            <div style="flex: 0 0 50%; max-width: 50%; padding-right: 10px;">
              <b>[Option ${index}]</b> ${keyword} 이/가 포함된 문장이 ${result}개 있습니다.
            </div>
            ${graph(index, element)}
          </div>`;
      } else if (index === 5) {
        flag = true;
        if (element === Math.abs(100)) {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 10px;">
                <b>[Option ${index}]</b> 게시글에 광고 확정 키워드가 포함되어 있습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        } else {
          modal.innerHTML += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
              <div style="flex: 0 0 50%; max-width: 50%; padding-right: 10px;">
                <b>[Option ${index}]</b> 게시글에 광고 확정 키워드가 포함되어 있지 않습니다.
              </div>
              ${graph(index, element)}
            </div>`;
        }
      } else if (index === 6) {
        flag = true;
        modal.innerHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
            <div style="flex: 0 0 50%; max-width: 50%; padding-right: 10px;">
              <b>[Option ${index}]</b> 게시글의 중립도가 ${parseInt(
          Math.abs(element)
        )}% 입니다.
            </div>
            ${graph(index, element)}
          </div>`;
      } else if (index === 7) {
        flag = true;
        let result = Math.floor((parseFloat(element) * parseInt(total)) / 100);
        modal.innerHTML += `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.8rem;">
            <div style="flex: 0 0 50%; max-width: 50%; padding-right: 10px;">
              <b>[Option ${index}]</b> ${result}개의 문장이 객관적인 정보를 포함하고 있습니다.
            </div>
            ${graph(index, element)}
          </div>`;
      }
    }
  });

  if (flag == false) {
    modal.innerHTML = `
    <div style="width: 100%; text-align: center; font-size: 1rem; font-weight: bold; margin-bottom:10px;">
      선택한 옵션에 따른 결과가 없습니다.
    </div>
  `;
  }
  backupModal = modal;
  // 타겟 컨테이너 선택 및 모달 삽입
  const targetContainer = document
    .getElementById("mainFrame")
    .contentWindow.document.getElementsByClassName("se-main-container")[0];

  if (targetContainer) {
    targetContainer.prepend(modal);
  }
}

function graph(index, percentage) {
  return `
    <div class="progress-container" id="progressBar${index}" style="flex: 0 0 50%; max-width: 50%; position: relative; background-color: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
      <div class="progress-bar" style="width: ${percentage}%; background-color: #03C75A; height: 100%;">
        <div style="position: absolute; width: 100%; text-align: center; line-height: 20px; color: white;">${percentage.toFixed(
          2
        )}%</div>
      </div>
    </div>
  `;
}

function checkOption() {
  if (optionCnt === 2) {
    var checkInterval = setInterval(function () {
      var iframeDoc = iframe.contentWindow.document;
      var iframeElements =
        iframeDoc.getElementsByClassName("se-main-container");
      if (iframeElements.length > 0) {
        clearInterval(checkInterval);
        const loadGIF = `<img src="chrome-extension://${extensionId}/loading.gif" id="loading"
                style="float : right; display : flex; width: 30px; height: auto; margin : 14px 15px">`;
        const title = iframeDoc.querySelector(".blog2_post_function");
        title.parentNode.insertAdjacentHTML("afterend", loadGIF); // 로딩 gif 넣기

        chrome.runtime.sendMessage(
          { action: "analysis" },
          async function (response) {
            // makeDiv를 비동기로 기다립니다.
            await makeDiv(response, iframeDoc);

            // 나머지 코드가 순차적으로 실행되도록 비동기 함수로 감쌉니다.
            async function processCrawlResults() {
              var elementsArray = Array.from(iframeElements);
              var divArray = Array.from(elementsArray[0].children);
              divArray.forEach(function (div) {
                var imgTags = div.getElementsByTagName("img");
                var spanTags = div.getElementsByTagName("span");
                var aTags = div.getElementsByTagName("a");

                Array.from(imgTags).forEach(function (img) {
                  var dataLinkData =
                    img.parentNode.getAttribute("data-linkdata");
                  if (dataLinkData) {
                    try {
                      var linkData = JSON.parse(dataLinkData);
                      var id = linkData.id;
                      if (id === null) return;
                      var src = linkData.src;
                      if (
                        !src.includes("gif") &&
                        !src.includes("https://storep-phinf.pstatic.net/")
                      ) {
                        crawlResults.push({ type: "img", data: src, id: id });
                      }
                    } catch (e) {
                      console.error("JSON parsing error", e);
                    }
                  }
                });

                Array.from(spanTags).forEach(function (span) {
                  var textContent = span.textContent || span.innerText;
                  var id = span.getAttribute("id");
                  if (id === null) return;
                  if (textContent.charCodeAt(0) === 8203) return;
                  crawlResults.push({ type: "txt", data: textContent, id: id });
                });

                Array.from(aTags).forEach(function (a) {
                  crawlResults.push({ type: "link", data: null, id: null });
                });
              });

              console.log(crawlResults);

              crawlTextResults = groupingTextCrawl(crawlResults);
              console.log(crawlTextResults);
              crawlTextResults.forEach((result) => {
                resultMap[result.admin] = {
                  last: result.last,
                  content: result.content,
                };
              });

              var optionPromises = [];
              optionPromises.push(optionFive(crawlResults));
              optionPromises.push(optionSeven());
              optionPromises.push(optionEight(crawlResults, iframeDoc));
              optionPromises.push(optionFour(crawlTextResults));

              // Text 종류 Coloring
              await Promise.all(optionPromises);

              optionThree(iframeDoc);
              optionTwo(iframeDoc);
              console.log(tmpData);
              finalResult = processData(tmpData);
              console.log(finalResult);
              const loading = iframeDoc.querySelector("#loading");
              console.log("후론트 화이탱~~~~~~~");
              if (loading) {
                loading.remove();
              }
              coloring();
            }

            // 비동기 함수 호출
            await processCrawlResults();
          }
        );
      }
    }, 100);
  }
}
