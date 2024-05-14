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

var crawlResults = [];
var finalCaptureResult = [];
var tmpData = [];
var finalResult = [];
var optionCnt = 0;
var selectedGoodOption = [];
var selectedBadOption = [];

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message);
  if (message.action === "updateCheck") {
    if (message.isChecked) {
      setting();
    } else {
      unsetting();
    }
  }else if(message.action === "optionScoreBlog"){
    console.log("optionScore")
    console.log(message.data);
  }
});



function unsetting() {
  // Text로 오는 것 Unsetting
  Object.keys(finalResult).forEach((id) => {
    const element = document
      .getElementById("mainFrame")
      .contentWindow.document.getElementById(id);
    element.style.backgroundColor = "";
  });

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

  console.log(wrappers); // 수정된 wrapper 요소들의 상태를 로깅
}

function setting() {
  // Text로 오는 것 다시 Unsetting
  Object.keys(finalResult).forEach((id) => {
    const data = finalResult[id];
    const element = document
      .getElementById("mainFrame")
      .contentWindow.document.getElementById(id);
    if (element) {
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

  console.log(finalCaptureResult);
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
      node.goodList.forEach((data) => {
        if (!result[data.id]) {
          result[data.id] = { goodOption: [], badOption: [], flag: 0 };
        }
        result[data.id].goodOption.push(node.option);
      });
    } else if (selectedBadOption.includes(node.option)) {
      node.badList.forEach((data) => {
        if (!result[data.id]) {
          result[data.id] = { goodOption: [], badOption: [], flag: 0 };
        }
        result[data.id].badOption.push(node.option);
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
  return new Promise((resolve, reject) => {
    if (selectedGoodOption.includes(2) || selectedBadOption.includes(2)) {
      const blackList = [
        "https://coupa.ng/",
        "https://link.coupang.com/",
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
        }
      });
    }
    resolve();
  });
}

function optionThree(iframeDoc) {
  return new Promise((resolve, reject) => {
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

        // 모달 띄우기
        var flag = selectedGoodOption.includes(3);
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
    resolve();
  });
}

function optionFour(keyword) {
  return new Promise((resolve, reject) => {
    if (selectedGoodOption.includes(4) || selectedBadOption.includes(4)) {
      let optionFourList = [];

      crawlResults.forEach((item) => {
        if (item.type === "txt" && item.data.includes(keyword)) {
          optionFourList.push({ id: item.id, data: item.data });
        }
      });

      const result = {
        option: 4,
        goodList: optionFourList,
        badList: optionFourList,
      };
      tmpData.push(result);
    }
    resolve();
  });
}

function optionFive(crawlResults) {
  return new Promise((resolve, reject) => {
    if (selectedGoodOption.includes(5) || selectedBadOption.includes(5)) {
      chrome.runtime.sendMessage(
        { action: "detail-textad", crawlResults: crawlResults },
        function (response) {
          var listData = response.data;
          var newData = {
            option: 5,
            goodList: listData.goodList,
            badList: listData.badList,
          };
          tmpData.push(newData);
          resolve(); // 비동기 처리가 완료된 후에 resolve를 호출
        }
      );
    } else {
      resolve(); // 조건에 맞지 않을 경우에도 resolve 호출
    }
  });
}

function optionSeven(crawlResults, iframeDoc) {
  return new Promise((resolve, reject) => {
    if (selectedGoodOption.includes(7) || selectedBadOption.includes(7)) {
      chrome.runtime.sendMessage(
        { action: "detail-imagead", crawlResults: crawlResults.slice(0, 18) },
        function (response) {
          var listData = response.data;
          console.log(listData);
          listData.forEach((data) => {
            if (data.score >= 2) {
              var element = iframeDoc.getElementById(data.id);

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

              // 모달 띄우기
              var flag = selectedGoodOption.includes(3);
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
                  statusMessage =
                    "선택하신 부분은 유용한 부분으로 판단됩니다 😀";
                  optionResult = `<div style="margin-top: 1.5625rem;">[긍정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 인위적인 사진 포함 - 위험도 ${data.score}점</li></ul></div>`;
                } else {
                  statusMessage =
                    "선택하신 부분은 유해한 부분으로 판단됩니다 😕";
                  optionResult = `<div style="margin-top: 1.5625rem;">[부정적으로 평가된 요소]<ul style="list-style: none; padding-left: 0;"><li style="margin-top: 0.3125rem;">• 인위적인 사진 포함 - 위험도 ${data.score}점</li></ul></div>`;
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
                modal.style.top = `${
                  rect.top + scrollY - modal.offsetHeight - 10
                }px`; // 위치 조정
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
          resolve(); // 비동기 처리가 완료된 후에 resolve를 호출
        }
      );
    } else {
      resolve(); // 조건에 맞지 않을 경우에도 resolve 호출
    }
  });
}

function optionEight() {
  return new Promise((resolve, reject) => {
    if (selectedGoodOption.includes(8) || selectedBadOption.includes(8)) {
      chrome.runtime.sendMessage(
        { action: "detail-objective", crawlResults: crawlResults },
        function (response) {
          var listData = response.data;
          var newData = {
            option: 8,
            goodList: listData.goodList,
            badList: listData.goodList,
          };
          tmpData.push(newData);
          resolve(); // 비동기 처리가 완료된 후에 resolve를 호출
        }
      );
    } else {
      resolve(); // 조건에 맞지 않을 경우에도 resolve 호출
    }
  });
}

function checkOption() {
  if (optionCnt === 2) {
    var checkInterval = setInterval(function () {
      var iframeDoc = iframe.contentWindow.document;
      var iframeElements =
        iframeDoc.getElementsByClassName("se-main-container");
      if (iframeElements.length > 0) {
        clearInterval(checkInterval);

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
            crawlResults.push({ type: "txt", data: textContent, id: id });
          });
        });

        console.log(crawlResults);

        var optionPromises = [];
        optionPromises.push(optionTwo(iframeDoc));
        optionPromises.push(optionThree(iframeDoc));
        optionPromises.push(optionFour("성심당"));
        optionPromises.push(optionFive(crawlResults));
        optionPromises.push(optionSeven(crawlResults, iframeDoc));
        optionPromises.push(optionEight(crawlResults));

        Promise.all(optionPromises).then(() => {
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
                showModal(iframeDoc, id, event);
              });

              element.addEventListener("mouseout", function (event) {
                hideModal(iframeDoc);
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
        });
      }
    }, 100);
  }
}

function showModal(iframeDoc, id, event) {
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
function hideModal(iframeDoc) {
  const modal = iframeDoc.getElementById("hover-modal");
  if (modal) {
    modal.style.display = "none";
  }
}
