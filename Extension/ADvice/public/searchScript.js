function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec));
}

function makeLoding(position){ // loading gif insert
  const details = document.querySelectorAll(`${position}`);
  let pass = 0;
  details.forEach((element, index) => {
    const links = document.querySelectorAll(
      ".view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap"
    );
    if (links[index].href.includes("post.naver.com")) {
      pass++;
    } else {
      const loadGIF = `<img src="chrome-extension://${extensionId}/loading.gif" id="loading${
        index - pass
      }" style="float : right; display : flex; width: 30px; height: auto;">`;
      element.parentNode.insertAdjacentHTML("afterend", loadGIF);
    }
  });
}

let goodOption = [];
let badOption = [];
let urlList = [];
let level = [];
let keyword = "";
let cnt = 0;
let apiCnt = 0;
const maxLevel = 100;
const minLevel = 0;
let topList = []; // 현재 화면에서 가장 유용한 게시글 top5 -> 유용도 계산하는 API 호출할때마다 갱신 -> top5중 가장 낮은 유용도보다 낮으면 update
const url = window.location.href;
let modalTextList = []; // 요약 모달 텍스트 최초 호출 후 저장
let scoreList = []; // 유용도 API 최초 호출 후 저장
let cntList = []; // background로 전송할 문장 갯수 저장
const optionList = [
  "null",
  "사진/지도 등 다양한 정보 포함",
  "구매 링크나 특성 사이트로 유도하는 경우",
  "내돈내산 인증 포함",
  "특정 키워드 포함",
  "광고 문구 포함",
  "장점/단점의 비율",
  "객관적인 정보 포함",
  "인위적인 사진 포함",
];

const extensionId = chrome.runtime.id;

// ------- 호버 모달 설정 함수
const makeModal = (index) => {
  const modalHTML = `
  <div id="myModal${index}" class="modal" style="position: absolute; display: none; z-index: 9999;">
    <div class="modal-content" style="word-wrap : break-word;">
      <p id="modalText${index}">로 딩 중 . . . 🙏</p>
    </div>
  </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
};

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
        makeLoding(".fds-keep-group");
        setting("all");
      }
    }, 100);
  })();
} else {
  makeLoding(".api_save_group");        
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
      if (!(url.includes("tab.blog") || url.includes("tab.cafe"))) {
        makeLoding(".fds-keep-group");
        setting("all");
      } else {
        makeLoding(".api_save_group"); 
        setting("tab");
      }
    } else {
      console.log("Checkbox is not checked. Perform alternative action.");
      unsetting();
      // 체크박스가 체크되지 않았을 때 실행할 코드
    }
  }
});

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

function sendMessagePromise(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

async function APIsend(userInfoElements, position) {
  console.log("APIsend", cnt);
  if (cnt == 3) {
    // 5개씩 끊어서 보내기 -> urlList 5개씩 잘라서 sendMessage 호출 ->
    // background.js로 메시지 보내기
    let urlIndex = -1;
    const chunksize = 2;
    for (let i = 0; i < urlList.length; i += chunksize) {
      const urlChunk = urlList.slice(i, i + chunksize);
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: "searchAPI",
            urlList: urlChunk,
            goodOption: goodOption,
            badOption: badOption,
            keyword: keyword,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError.message);
            } else {
              resolve(response);
            }
          }
        );
      });

      console.log("API 호출 결과 받음:", response);
      const sortLevel = [];
      Object.keys(response.data.scoreList).forEach((index) => {
        // index -> chunkURL 안에서의 위치
        console.log(response.data.scoreList[index].url);
        urlIndex = urlList.indexOf(response.data.scoreList[index].url); // urlIndex -> urlList 안에서의 위치
        console.log(urlIndex);
        // console.log(response.data.scoreList[urlIndex].url)
        if (urlIndex !== -1) {
          const curLevel = {
            url: response.data.scoreList[index].url,
            level: response.data.scoreList[index].score,
          };
          console.log("scoreList:", scoreList);
          sortLevel.push(curLevel);
          level[urlIndex] = response.data.scoreList[index].score; //{index : urlIndex, level : response.data[url]};// 각 url-level쌍 object로 저장
          scoreList[urlIndex] = response.data.scoreList[index].optionScore;
          cntList[urlIndex] = response.data.scoreList[index].cnt;
          console.log(level[urlIndex]);

          Array.from(userInfoElements).forEach((element) => {
            // console.log("ui setting", element);
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
            // 이번에 부른 chunklist에 대해서만 setui 실행 -> url 일치 여부 확인하기
            const curURL = element.querySelector(
              ".view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap"
            ).href;
            // console.log(curURL, "setUI 호출 전 확인")
            if (urlChunk[index] == curURL) {
              console.log("setUI 호출하는 element : ", element);
              setUI(element, urlIndex, position);
            }
          });
        }
      });

      topList.push(...sortLevel)
      topList.sort((a, b) => b.level - a.level);
      topList = topList.slice(0, 5);

      console.log("topList", topList);
      updateTopList();

      console.log(level);
    }
    if (apiCnt == urlList.length) {
      const badge = ['🥇', '🥈', '🥉']
      const links = document.querySelectorAll(
        ".view_wrap .title_area a, .desktop_mode .fds-comps-right-image-text-title, .desktop_mode .fds-comps-right-image-text-title-wrap"
      );

      for(let i = 0; i < 3; i++){
        const matched = Array.from(links).find(link => link.href == topList[i].url)
        const badgeHTML = `<div style="display : block; width : 100%; margin : 4px 0;">${badge[i]}</div>`
        matched.insertAdjacentHTML("beforebegin", badgeHTML)
      } // 유용도 1 ~ 3등 뱃지 띄우기

      for (let i = 0; i < urlList.length; i++) {
        // 1. db에 url 저장되어 있는지 확인
        chrome.runtime.sendMessage(
          { action: "checkDB", url: urlList[i] },
          (response) => {
            if (response) {
              // 2. 있으면 저장된 요약 값 출력
              console.log("Data found in DB:", response);
              modalTextList[i] = response;
            } else {
              // 3. 없으면 API 호출
              console.log("Data not found in DB:", urlList[i]);
              // 데이터가 DB에 없으므로 API를 호출하고 결과를 저장
              chrome.runtime.sendMessage(
                {
                  action: "hoverAPI",
                  url: urlList[i],
                },
                function (response) {
                  modalTextList[i] = `<strong style='font-size: 1.1em;'>📌본문 요약 결과📌</strong><br><br>` +
                  (response.data.positive.length != 0 ? `😊 : ${response.data.positive.length > 50 ? response.data.positive.substring(0, 50) + "..." : response.data.positive}<br><br>` : '') +
                  (response.data.neutral.length != 0 ? `😐 : ${response.data.neutral.length > 50 ? response.data.neutral.substring(0, 50) + "..." : response.data.neutral}<br><br>` : '') +
                  (response.data.negative.length != 0 ? `🙁 : ${response.data.negative.length > 50 ? response.data.negative.substring(0, 50) + "..." : response.data.negative}` : '');
                  console.log("저장된 요약문 : ", modalTextList[i]);
                  chrome.runtime.sendMessage({
                    action: "saveToDB",
                    url: urlList[i],
                    data: modalTextList[i],
                  });
                }
              );
            }
          }
        );
      }
    }
  }
}

function setUI(node, index, position) {
  console.log("setUI 실행");
  const userInfoElements = node.querySelectorAll(
    // ".fds-keep-group"
    ".api_save_group, .fds-keep-group"
  );
  console.log("in SetUI", userInfoElements);

  console.log(index);
  console.log("before", userInfoElements.parentNode);
  const levelValue = level[index];
  const isNegative = levelValue < 0; // 음수 판단
  const percentage = ((levelValue + 100) / 200) * 100; // 최대 단계에 대한 현재 단계의 백분율
  console.log(index + " " + levelValue + " " + percentage);
  if (userInfoElements.length != 0) {
    console.log(userInfoElements);

    const progressBarHTML = `
    <div class="progress" id="progressBar${index}" style="float: right; display: flex; padding: 1% 2%; border-radius: 15px 15px; border: 1px solid lightgray;
    box-shadow: 1px 1px 2px lightgray; width: ${
      position === "all" ? "35%" : "30%"
    }; margin-top: ${position === "all" ? "0%" : "-1%"}">
    <div style="width: 15%; white-space: nowrap; font-size: 13px; text-align: right; margin-right: 10%">유용도</div>
    <div class="progress-container" style="width: 85%; position: relative; background-color: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
        ${[...Array(maxLevel - 1)]
          .map(
            (_, i) => `
            <div class="progress-divider" style="position: absolute; left: ${
              (i + 1) * 200
            }%; width: 1px; height: 100%; background-color: #fff;"></div>
        `
          )
          .join("")}
        <div class="progress-bar" style="width: ${percentage}%; background-color: ${
      isNegative ? "#FF4136" : "#03C75A"
    }; height: 100%;">
          <div style="position: absolute; width: 100%; text-align: center; line-height: 20px; color: ${
            isNegative ? "black" : "white"
          };">${levelValue.toFixed(2)}</div>
        </div>
    </div>
    
</div>
  `;

  if(!node.querySelector('[id*="progressBar"]')){ // 프로그레스 바 없을때만 insert
    if (position == "all") {
      userInfoElements[0].insertAdjacentHTML("beforebegin", progressBarHTML);
    } else {
      userInfoElements[0].insertAdjacentHTML("afterend", progressBarHTML);
    }
    userInfoElements[0].style.display = "flex";
  }


    const loadingElement = node.querySelector('[id*="loading"]');
    // const loadingElement = node.querySelector(`#loading${index}`)
    if (loadingElement) {
      loadingElement.remove(); // 로딩 완료 후 로딩중 삭제
    }

    console.log("after", userInfoElements.parentNode);
    apiCnt++;
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

  let goodContent = "";
  let badContent = "";
  goodOption.forEach((element) => {
    console.log("good : ", element, scoreList[index][0][element]);
    if(element != 8){
      if (scoreList[index][0][element] != 0) {
        if (element == 4) {
          optionList[element] = `[${keyword}] 키워드 포함`;
        }
        goodContent += `&nbsp;&nbsp;&nbsp;&nbsp; - ${
          optionList[element]
        } (${scoreList[index][0][element].toFixed(2)}점)<br>`;
      }
    }

  });

  badOption.forEach((element) => {
    if(element != 8){
      if (scoreList[index][0][element] != 0) {
        if (element == 4) {
          optionList[element] = `"${keyword}" 키워드 포함`;
        }
        badContent += `&nbsp;&nbsp;&nbsp;&nbsp; - ${
          optionList[element]
        } (${scoreList[index][0][element].toFixed(2)}점)<br>`;
      }
    }

  });

  if(!node.querySelector('[class*="scoreBox"]')){ // 옵션 점수 출력박스 없을때만 insert
    const scoreHTML = `<div class="scoreBox" style="display: block; width: 100%; margin: 16px 0; border: 1px solid #ccc; box-sizing: border-box;">
    <div style="padding: 10px;">${goodContent ? `👍 <strong> 아래의 정보들을 찾을 수 있어요 ! </strong> <br> ${goodContent}` : ''}
    ${badContent ? `👎 <strong> 아래의 정보들을 조심하세요 ! </strong> <br> ${badContent}` : ''}
      </div>`;

    const userBox = node.querySelector(".user_box,.fds-article-simple-box");
    const userBox_inf = node.querySelector(".fds-thumb-group"); // 인플루언서 컨텐츠 전용 위치 필요
    if (userBox_inf) {
      userBox_inf.parentNode.insertAdjacentHTML("afterend", scoreHTML);  
    } else {
      userBox.insertAdjacentHTML("afterend", scoreHTML);  
    }
  }


}

function clickHandler(link, index) {
  // 유용도 점수 배열 중 index 번째 점수 보내기
  return function () {
    console.log("clickevent", link, ":", index);
    console.log(link.cru);
    const data = [{ optionScore: scoreList[index], url: urlList[index], cnt : cntList[index] }];
    if (link.href.includes("cafe.naver.com")) {
      chrome.runtime.sendMessage({ action: "toCafeDetail", data: data });
    } else {
      chrome.runtime.sendMessage({ action: "toBlogDetail", data: data });
    }
  };
}

function hoverHandler(link, index) {
  return function () {
    console.log("hoverHandler", link.href);
    const Indexedmodal = document.getElementById(`myModal${index}`);
    const IndexedmodalText = document.getElementById(`modalText${index}`);
  
    // background.js로 메시지 보내기
    if (modalTextList[index] == null || modalTextList[index] == undefined) {
      IndexedmodalText.textContent = "ADvice가 요약 중입니다 . . . 🙏";
      chrome.runtime.sendMessage(
        { action: "hoverAPI", url: link.href },
        function (response) {
          console.log("API 호출 결과 받음:", response);
          IndexedmodalText.innerHTML = `<strong style='font-size: 1.1em;'>📌본문 요약 결과📌</strong><br><br>` +
          (response.data.positive.length != 0 ? `😊 : ${response.data.positive.length > 50 ? response.data.positive.substring(0, 50) + "..." : response.data.positive}<br><br>` : '') +
          (response.data.neutral.length != 0 ? `😐 : ${response.data.neutral.length > 50 ? response.data.neutral.substring(0, 50) + "..." : response.data.neutral}<br><br>` : '') +
          (response.data.negative.length != 0 ? `🙁 : ${response.data.negative.length > 50 ? response.data.negative.substring(0, 50) + "..." : response.data.negative}` : '');
          modalTextList[index] = IndexedmodalText.innerHTML;
        }
      );
    } else {
      IndexedmodalText.innerHTML = modalTextList[index];
    }

    const linkRect = link.getBoundingClientRect();
    Indexedmodal.style.left = `${linkRect.left + window.scrollX}px`;
    Indexedmodal.style.top = `${linkRect.bottom + window.scrollY}px`;
    Indexedmodal.style.display = "block";
    Indexedmodal.style.position = "absolute";
  };
}

function setting(position) {
  const userInfoElements = document.querySelectorAll(
    ".view_wrap, .fds-ugc-block-mod"
  );

  Array.from(userInfoElements).forEach((element, index) => {
    saveURL(element);
    makeModal(index);
    modalTextList = new Array(urlList.length);
  });

  const links = document.querySelectorAll(
    ".title_area a, .fds-comps-right-image-text-title, .total_tit a"
  );

  links.forEach((link, index) => {
    // 호버 -> API로 링크 전송 -> 요약문 return
    const handler = hoverHandler(link, index);
    link.addEventListener("mouseover", handler);

    const curModal = document.getElementById(`myModal${index}`);
    console.log("curModal", curModal);
    link.addEventListener("mouseout", function () {
      curModal.style.display = "none";
    });

    link.handler = handler;

    // 클릭 -> background.js로 옵션별 점수 전송
    const scoreHandler = clickHandler(link, index);
    link.addEventListener("click", scoreHandler);
  });

  // ---------- hover modal 등록

  level = new Array(urlList.length);
  scoreList = new Array(urlList.length);
  cntList = new Array(urlList.length);
  console.log("urlList", urlList);
  console.log(level);

  cnt = 0;
  chrome.storage.sync.get(["goodOption"], (result) => {
    if (result.goodOption) {
      goodOption = Object.values(result.goodOption).map(
        (option) => option.index
      );
      console.log("goodOption : ", goodOption);
    }
    cnt++;
    APIsend(userInfoElements, position);
  });

  chrome.storage.sync.get(["badOption"], (result) => {
    if (result.badOption) {
      badOption = Object.values(result.badOption).map((option) => option.index);
      console.log("badOption : ", badOption);
    }
    cnt++;
    APIsend(userInfoElements, position);
  });

  chrome.storage.sync.get(["keyword"], (result) => {
    if (result.keyword) {
      keyword = result.keyword;
      console.log("사용자가 저장한 키워드", keyword);
    }
    cnt++;
    APIsend(userInfoElements, position);
  });

  // chrome.storage.sync.get(["keyword"], (result) => {
  //   if (result.keyword) {
  //     keyword = result.keyword;
  //     console.log("사용자가 저장한 키워드", keyword);
  //   }
  // });

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
      if (link.href != undefined && !link.href.includes("post.naver.com")) {
        // post 글 제외
        urlList.push(link.href);
        // url 저장할때 indexed db에 저장되어 있는 값 있는지 체크
        // 1. db에 url 저장되어 있는지 확인
        chrome.runtime.sendMessage(
          { action: "checkDB", url: link.href },
          (response) => {
            if (response) {
              const index = urlList.findIndex((url) => url == link.href);
              // 2. 있으면 저장된 요약 값 출력
              console.log("Data found in DB:", response);
              console.log("index = ", index);
              modalTextList[index] = response;
            }
          }
        );
      }
    });
  }

  // ------------ 처음 검색 결과에 ui 씌우기

  // MutationObserver 콜백 함수 정의
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
              const urlElement = addNode.querySelector(".title_area a");
              const url = urlElement.href;
              makeModal(level.length);
              const handler = hoverHandler(urlElement, level.length);
              urlElement.addEventListener("mouseover", handler);

              const curModal = document.getElementById(
                `myModal${level.length}`
              );
              console.log("curModal", curModal);
              urlElement.addEventListener("mouseout", function () {
                curModal.style.display = "none";
              });

              urlElement.handler = handler;

              let newLoading = null;
              // 새로 추가된 요소에 loading gif insert
              if (!url.includes("post.naver.com")) {
                const loadGIF = `<img src="chrome-extension://${extensionId}/loading.gif" id="loading${level.length}" style="float : right; display : flex; width: 30px; height: auto;">`;
                node
                  .querySelector(".api_save_group")
                  .insertAdjacentHTML("afterend", loadGIF);
                // newLoading = node.querySelector(`#loading${level.length}`)
                // element.parentNode.insertAdjacentHTML("afterend", loadGIF);
              }

              // 새로 추가된 url을 갖고 background.js로 메시지 보내기
              // urlList.push(node.querySelector(".title_area a").href);
              chrome.runtime.sendMessage(
                {
                  action: "searchAPI",
                  urlList: [url],
                  goodOption: goodOption,
                  badOption: badOption,
                  keyword: keyword,
                },
                function (response) {
                  console.log("API 호출 결과 받음:", response);
                  level.push(response.data.scoreList[0].score);
                  console.log(level);
                  if (
                    response.data.scoreList[0].score >
                    topList[topList.length - 1]
                  ) {
                    // top 5 유용도 중 가장 낮은 유용도보다 큰 경우
                    topList[topList.length - 1] = {
                      url: url,
                      level: response.data.scoreList[0].score,
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
  if (url.includes("tab.blog") || url.includes("tab.cafe")) {
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

  const scoreElements = document.querySelectorAll(
    ".view_wrap .scoreBox,  .fds-thumb-group .scoreBox, .fds-article-simple-box .scoreBox"
  );

  Array.from(scoreElements).forEach((element) => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });

    const loadingElement = document.querySelectorAll('[id*="loading"]');
    // const loadingElement = node.querySelector(`#loading${index}`)
    Array.from(loadingElement).forEach((element) => {
      if(element.parentNode){
        element.parentNode.removeChild(element);
      }
    })

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
  urlList = [];
}
