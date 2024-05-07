function sleep(sec) {

  return new Promise((resolve) => setTimeout(resolve, sec));
}

let goodOption = [];
let badOption = [];
let keyword = "튀소";
let cnt = 0;
let topList = []; // 현재 화면에서 가장 유용한 게시글 top5 -> 유용도 계산하는 API 호출할때마다 갱신 -> top5중 가장 낮은 유용도보다 낮으면 update
const url = window.location.href;


if (!(url.includes("tab.blog") || url.includes("tab.cafe"))) {
  (async () => {
    await sleep(100);
    console.log("sleep end");
    let content = document.querySelectorAll(".desktop_mode");
    let checkInterval = setInterval(function () {
      let checkflag = true;
      content.forEach((node) => {
        console.log(node);
        let contentAttr = node.parentNode.getAttribute("data-slog-container");
        console.log(contentAttr);
        if (contentAttr.endsWith("R")) {
          let contentDetail = node.getElementsByClassName("fds-keep-group");
          console.log(contentDetail);
          console.log(contentDetail.length);
          if (contentDetail.length == 0) {
            checkflag = false;
          }
        }
      });
      if (checkflag) {
        clearInterval(checkInterval);
        console.log("clearInterval");
        setting("all");
      }
    }, 100);
  })();
} else {
  setting("tab");
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message);
  if (message.action === "updateCheck") {
    console.log("message receive");
    if (message.isChecked) {
      console.log("Checkbox is checked. Perform specific action.");
      // 체크박스가 체크되었을 때 실행할 코드
      const url = window.location.href;
      if (url.includes("tab.nx.all")) {
        setting("all");
      } else {
        setting("tab");
      }
    } else {
      console.log("Checkbox is not checked. Perform alternative action.");
      unsetting();
      // 체크박스가 체크되지 않았을 때 실행할 코드
    }
  }
});

// ------- 호버 모달 설정
const modalHTML = `
  <div id="myModal" class="modal" style="position: absolute; display: none; z-index: 1000;">
    <div class="modal-content" style="word-wrap : break-word;">
      <p id="modalText">링크 정보가 여기에 표시됩니다.</p>
    </div>
  </div>
`;
document.body.insertAdjacentHTML("beforeend", modalHTML);

const modal = document.getElementById("myModal");
const modalText = document.getElementById("modalText");

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

function updateTopList() {
  // topList에 있는 각 URL에 대해서만 title과 description 추가
  topList.forEach((item) => {
    // .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap
    const linkElement = document.querySelector(`a[href="${item.url}"]`);
    if (linkElement) {
      const titleText = linkElement
        .closest(".view_wrap, .desktop_mode")
        .querySelector(
          ".title_area, .fds-comps-right-image-text-title, .fds-comps-right-image-text-title-wrap"
        )
        .textContent.trim()
        .slice(0, 19);
      const descriptionText = linkElement
        .closest(".view_wrap, .desktop_mode")
        .querySelector(
          ".dsc_area, .fds-comps-right-image-text-content, .fds-comps-right-image-text-content-wrap"
        )
        .textContent.trim()
        .slice(0, 30);
      console.log(titleText + " " + descriptionText);
      item.title = titleText;
      item.desc = descriptionText;
    }
  });
  console.log("topList", topList);
  chrome.runtime.sendMessage({ action: "saveTopList", topList: topList });
}

function hoverHandler(link) {
  return function () {
    console.log(link.href);
    // background.js로 메시지 보내기
    chrome.runtime.sendMessage(
      { action: "hoverAPI", url: link.href },
      function (response) {
        console.log("API 호출 결과 받음:", response);
        modalText.textContent = `${response.data}`;
      }
    );

    const linkRect = link.getBoundingClientRect();
    modal.style.left = `${linkRect.left + window.scrollX}px`;
    modal.style.top = `${linkRect.bottom + window.scrollY}px`;
    modal.style.display = "block";
    modal.style.position = "absolute";
  };
}

function setting(position) {
  const userInfoElements = document.querySelectorAll(
    ".view_wrap, .fds-ugc-block-mod"
  );
  let urlList = [];
  let level = [];
  const maxLevel = 100;
  const minLevel = 0;

  Array.from(userInfoElements).forEach((element, index) => {
    saveURL(element);
  });

  level = new Array(urlList.length);
  console.log("urlList", urlList);
  console.log(level);

  const APIsend = () => {
    console.log("APIsend", cnt);
    if (cnt == 2) {
      // background.js로 메시지 보내기
      chrome.runtime.sendMessage(
        {
          action: "searchAPI",
          urlList: urlList,
          goodOption: goodOption,
          badOption: badOption,
          keyword : keyword
        },
        function (response) {
          console.log("API 호출 결과 받음:", response);
          const sortLevel = [];
          Object.keys(response.data.scoreList).forEach((index) => {
            console.log(response.data.scoreList[index].url);
            const urlIndex = urlList.indexOf(response.data.scoreList[index].url);
            if (urlIndex !== -1) {
              const curLevel = { url: response.data.scoreList[index].url, level: response.data.scoreList[urlIndex].score };
              sortLevel.push(curLevel);
              level[urlIndex] = response.data.scoreList[urlIndex].score; //{index : urlIndex, level : response.data[url]};// 각 url-level쌍 object로 저장
              console.log(level[urlIndex]);
            }
          });

          sortLevel.sort((a, b) => b.level - a.level);
          topList = sortLevel.slice(0, 5);
          updateTopList();

          console.log(level);

          Array.from(userInfoElements).forEach((element, index) => {
            console.log("ui setting", element);
            if (
              element
                .querySelector(
                  `.view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap`
                )
                .href.includes("post.naver.com")
            ) {
              return;
            }
            if (element.classList.contains("view_wrap")) {
              position = "tab";
            }
            setUI(element, index);
          });
        }
      );
    }
  };

  chrome.storage.sync.get(["goodOption"], (result) => {
    if (result.goodOption) {
      goodOption = Object.values(result.goodOption).map(
        (option) => option.index
      );
      console.log("goodOption : ", goodOption);
    }
    cnt++;
    APIsend()
  });
  
  chrome.storage.sync.get(["badOption"], (result) => {
    if (result.badOption) {
      badOption = Object.values(result.badOption).map((option) => option.index);
      console.log("badOption : ", badOption);
    }
    cnt++;
    APIsend()
  });


  const searchAllresult = Array.from(
    document.querySelectorAll(".api_subject_bx")
  );

  searchAllresult.forEach((result) => {
    console.log("result", result);
  });

  function saveURL(node) {
    const links = node.querySelectorAll(
      ".view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap"
    );
    links.forEach((link) => {
      // console.log(link.href);
      if (link.href != undefined && !link.href.includes("post.naver.com")) {
        // post 글 제외
        urlList.push(link.href);
      }
    });
  }

  function setUI(node, index) {
    console.log("setUI 실행");
    const userInfoElements = node.querySelectorAll(
      // ".fds-keep-group"
      ".api_save_group, .fds-keep-group"
    );
    console.log("in SetUI", userInfoElements);

    console.log(index);
    console.log("before", userInfoElements.parentNode);
    const levelValue = level[index];
    const percentage = (levelValue / 100) * 100; // 최대 단계에 대한 현재 단계의 백분율
    console.log(index + " " + levelValue + " " + percentage);
    if (userInfoElements.length != 0) {
      console.log(userInfoElements);
      const progressBarHTML = `
      <div class="progress" style="float: right; display: flex; padding: 1% 2%; border-radius: 15px 15px; border: 1px solid lightgray;
      box-shadow: 1px 1px 2px lightgray; width: ${position === "all" ? "25%" : "20%"}; margin-top: ${position === "all" ? "0%" : "-1%"}">
      <div style="width: 30%; white-space: nowrap; font-size: 13px; text-align: right; margin-right: 10%">유용도</div>
      <div class="progress-container" style="width:70%; position: relative; background-color: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
          ${[...Array(maxLevel - 1)].map((_, i) => `
              <div class="progress-divider" style="position: absolute; left: ${(i + 1) * (100)}%; width: 1px; height: 100%; background-color: #fff;"></div>
          `).join("")}
          <div class="progress-bar" style="width: ${levelValue}%; background-color: #03C75A; height: 100%;"></div>
      </div>
  </div>
    `;
      if (position == "all") {
        userInfoElements[0].insertAdjacentHTML("beforebegin", progressBarHTML);
      } else {
        userInfoElements[0].insertAdjacentHTML("afterend", progressBarHTML);
      }
      userInfoElements[0].style.display = "flex";
      console.log("after", userInfoElements.parentNode);
    }

    Array.from(userInfoElements).forEach((element, index) => {
      // 프로그레스 바를 fds-keep-group 요소 이전에 추가
      console.log(index);
      console.log("before", element.parentNode);
      const levelValue = level[index];
      const percentage = (levelValue / maxLevel) * 100; // 최대 단계에 대한 현재 단계의 백분율
      console.log(index + " " + levelValue + " " + percentage);
      console.log(element.parentNode.querySelector(".progress"));
      if (!element.parentNode.querySelector(".progress")) {
        // 진행 상태 표시
      }
    });

    // -------- 유용도 박스

    const links = node.querySelectorAll(
      ".title_area a, .fds-comps-right-image-text-title, .total_tit a"
    );

    links.forEach((link) => {
      // 호버 -> API로 링크 전송 -> 요약문 return
      const handler = hoverHandler(link);
      link.addEventListener("mouseover", handler);

      link.addEventListener("mouseout", function () {
        modal.style.display = "none";
      });

      link.handler = handler;
    });
  }

  // ------------ 처음 검색 결과에 ui 씌우기

  // 콜백 함수 정의
  const callback = function (mutationsList, observer) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === "LI" && node.classList.contains("bx")) {
            console.log(
              "새로운 LI 태그가 추가됨:",
              node.querySelector(".view_wrap")
            );
            const addNode = node.querySelector(".view_wrap");
            if (addNode != null) {
              const url = addNode.querySelector(".title_area a").href;
              // 새로 추가된 url을 갖고 background.js로 메시지 보내기
              // urlList.push(node.querySelector(".title_area a").href);
              chrome.runtime.sendMessage(
                {
                  action: "searchAPI",
                  urlList: [url],
                },
                function (response) {
                  console.log("API 호출 결과 받음:", response);
                  level.push(response.data[url]);
                  console.log(level);
                  if (response.data[url] > topList[topList.length - 1]) {
                    // top 5 유용도 중 가장 낮은 유용도보다 큰 경우
                    topList[topList.length - 1] = {
                      url: url,
                      level: response.data[url],
                    };
                    topList.sort((a, b) => b.level - a.level);
                    updateTopList();
                  }
                  setUI(addNode, level.length - 1);
                }
              );
            }
          }
        });
      }
    }
  };

  const url = window.location.href;
  if (url.includes("tab.blog")) {
    // MutationObserver 인스턴스 생성
    const observer = new MutationObserver(callback);

    // 관찰 설정: 자식 요소의 변화를 관찰
    const config = { childList: true, subtree: true };
    const targetNode = document.body; //document.querySelector(".lst_view");

    // 변화 관찰 시작
    observer.observe(targetNode, config);
    // 페이지가 언로드될 때 옵저버를 해제
    window.addEventListener("unload", () => observer.disconnect());
  }
}
// --- end setting function

// 체크박스 해제할 때 화면에 있던 유용도/호버 모달 같이 해제하기
function unsetting() {
  const userInfoElements = document.querySelectorAll(
    ".view_wrap .progress,  .fds-ugc-block-mod .progress"
  );
  Array.from(userInfoElements).forEach((element) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

  const links = document.querySelectorAll(
    ".view_wrap .title_area a, .fds-comps-right-image-text-title"
  );
  console.log("unsetting", links);
  links.forEach((link) => {
    link.removeEventListener("mouseover", link.handler);
    if (link.handler) {
      link.removeEventListener("mouseover", link.handler);
    }
  });
}
