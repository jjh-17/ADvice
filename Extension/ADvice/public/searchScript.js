setting();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log(message);
  if (message.action === "updateCheck") {
    console.log("message receive");
    if (message.isChecked) {
      console.log("Checkbox is checked. Perform specific action.");
      // 체크박스가 체크되었을 때 실행할 코드
      setting();
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

function hoverHandler(link) {
  return  function () {
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
  }
}

function setting() {
  const userInfoElements = document.getElementsByClassName("view_wrap");
  let urlList = [];
  let level = [];
  const maxLevel = 5;

  Array.from(userInfoElements).forEach((element, index) => {
    saveURL(element);
  });

  level = new Array(urlList.length);
  console.log("urlList", urlList);
  console.log(level);

  // background.js로 메시지 보내기
  chrome.runtime.sendMessage(
    { action: "searchAPI", urlList: urlList },
    function (response) {
      console.log("API 호출 결과 받음:", response);
      Object.keys(response.data).forEach((url, index) => {
        console.log(url);
        const urlIndex = urlList.indexOf(url);
        if (urlIndex !== -1) {
          level[urlIndex] = response.data[url];
          console.log(level[urlIndex]);
        }
      });

      console.log(level);
      Array.from(userInfoElements).forEach((element, index) => {
        console.log("ui setting", element);
        setUI(element, index);
      });
    }
  );

  const searchAllresult = Array.from(
    document.querySelectorAll(".api_subject_bx")
  );
  searchAllresult.forEach((result) => {
    console.log("result", result);
    // setUI(result);
    // setTimeout(setUI(result), 2000)
    // setTimeout(() => console.log("2초 후에 실행됨"), 2000);
  });
  // const tmp = document.getElementsByClassName("fds-keep-group");
  // console.log("tmp", tmp);
  // for(let i = 0; i < tmp.length; i++){
  //   const parentElement = tmp[i].parentNode;
  //   console.log(tmp[i]);
  //   parentElement.insertAdjacentHTML("beforeend", "<div>111111</div>");
  // }
  // tmp.forEach((element) => {
  //   // console.log("tmp", tmp);
  //   const progressBarHTML = "<div>11111111</div>"
  //   // element.insertAdjacentHTML("beforebegin", progressBarHTML);
  // })

  // setUI(null, "fds-keep-group")



  function saveURL(node) {
    const links = node.querySelectorAll(".title_area a");
    links.forEach((link) => {
      // console.log(link.href);
      urlList.push(link.href);
    });
  }

  function setUI(node, index) {
    console.log("setUI 실행");
    // console.log(level);
    // let userInfoElements;
    // if(node == null){
    //   userInfoElements = document.querySelectorAll(tag)
    // }else{
    //   userInfoElements = node.querySelectorAll(tag)
    // }
    // const userInfoElements = node.querySelectorAll(
    //   ".api_save_group, .fds-keep-group"
    // );
    // const customStyle = document.createElement('style');
    // customStyle.textContent = `
    //   .fds-keep-group {
    //     background-color: yellow;
    //   }
    // `;
    // document.head.appendChild(customStyle);
    const userInfoElements = node.querySelectorAll(
      // ".fds-keep-group"
      ".api_save_group, .fds-keep-group"
    );
    console.log("in SetUI", userInfoElements);

    console.log(index);
    console.log("before", userInfoElements.parentNode);
    const levelValue = level[index];
    const percentage = (levelValue / maxLevel) * 100; // 최대 단계에 대한 현재 단계의 백분율
    console.log(index + " " + levelValue + " " + percentage);
    if (userInfoElements.length != 0) {
      console.log(userInfoElements);
      const progressBarHTML = `
      <div class="progress" style="float : right; display : flex; padding : 1% 2%;; border-radius : 15px 15px; border: 1px solid lightgray; box-shadow: 1px 1px 2px lightgray; width : 20%;">
        <div style="width : 30%; white-space : nowrap; text-align : right; margin-right : 10%">유용도</div>
        <div class="progress-container" style="width:70%; position : relative; background-color: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden;">
          ${[...Array(maxLevel - 1)]
            .map(
              (_, i) => `
          <div class="progress-divider" style="position: absolute; left: ${
            (i + 1) * (100 / maxLevel)
          }%; width: 1px; height: 100%; background-color: #fff;"></div>
        `
            )
            .join("")}
        <div class="progress-bar" style="width: ${percentage}%; background-color: #007bff; height: 100%;"></div>
      </div>
    <div>
    `;
      userInfoElements[0].insertAdjacentHTML("afterend", progressBarHTML);
      userInfoElements[0].style.display = "flex";
      console.log("after", userInfoElements.parentNode);
    }

    // element.parentNode.innerHTML = progressBarHTML;

    Array.from(userInfoElements).forEach((element, index) => {
      // 프로그레스 바를 fds-keep-group 요소 이전에 추가
      // element.innerHTML = progressBarElement;
      // element.innerText = "";
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
      const handler = hoverHandler(link)
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
                  setUI(addNode, level.length - 1);
                  // Array.from(userInfoElements).forEach((element, index) => {
                  //   // console.log(element.innerHTML);
                  //   setUI(element, index);
                  // });
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

// 체크박스 해제할 때 화면에 있던 유용도/호버 모달 같이 해제하기
function unsetting() {
  const userInfoElements = document.querySelectorAll(".view_wrap .progress");
  Array.from(userInfoElements).forEach((element) => {
    if(element.parentNode){
      element.parentNode.removeChild(element);
    }
  })

  const links = document.querySelectorAll(".view_wrap .title_area a");
  console.log("unsetting", links)
  links.forEach((link) => {
    link.removeEventListener("mouseover", link.handler);
    if(link.handler){
      link.removeEventListener("mouseover", link.handler);
    }
  })
}