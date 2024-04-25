
const userInfoElements = document.getElementsByClassName("bx");
let level = [2, 2, 3, 4, 5];
const maxLevel = 5;

Array.from(userInfoElements).forEach((element, index) => {
  // console.log(element.innerHTML);
  setUI(element);
});

const searchAllresult = Array.from(document.querySelectorAll(".desktop_mode"));
searchAllresult.forEach((result) => {
  console.log("result", result);
  setUI(result);
})

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

// ------- 호버 모달 설정
const modalHTML = `
  <div id="myModal" class="modal" style="position: absolute; display: none; z-index: 1000;">
    <div class="modal-content">
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

function setUI(node) {
  console.log("setUI 실행");
  // let userInfoElements;
  // if(node == null){
  //   userInfoElements = document.querySelectorAll(tag)
  // }else{
  //   userInfoElements = node.querySelectorAll(tag)
  // }
  // const userInfoElements = node.querySelectorAll(
  //   ".api_save_group, .fds-keep-group"
  // );

  const userInfoElements = node.querySelectorAll(
    ".api_save_group, .fds-keep-group"
  );

  Array.from(userInfoElements).forEach((element, index) => {
    console.log(element);
    const levelValue = level[index];
    const percentage = (levelValue / maxLevel) * 100; // 최대 단계에 대한 현재 단계의 백분율

    // 진행 상태 표시
    const progressBarHTML = `
      <div style="float : right; display : flex; padding : 1% 2%;; border-radius : 15px 15px; border: 1px solid lightgray; box-shadow: 1px 1px 2px lightgray; width : 20%;">
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

    element.insertAdjacentHTML("beforebegin", progressBarHTML);
    element.style.display = "flex";
    // const userBox = element.parentNode.querySelector(".user_box_inner");
  });

  // -------- 유용도 박스

  const links = node.querySelectorAll(".title_area a");
  links.forEach((link) => {
    link.addEventListener("mouseover", function () {
      console.log(link);
      modalText.textContent = `게시글 요약${link}`;

      const linkRect = link.getBoundingClientRect();
      modal.style.left = `${linkRect.left + window.scrollX}px`;
      modal.style.top = `${linkRect.bottom + window.scrollY}px`;
      modal.style.display = "block";
      modal.style.position = "absolute";
    });

    link.addEventListener("mouseout", function () {
      modal.style.display = "none";
    });
  });
}

// ------------ 처음 검색 결과에 ui 씌우기

// 콜백 함수 정의
const callback = function (mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === "LI" && node.classList.contains("bx")) {
          console.log("새로운 <li> 태그가 추가됨:", node);
          setUI(node);
        }
        if (node.tagName == "div" && node.classList.contains("_keep_wrap")) {
          console.log("새로운 _keep_wrap 태그 추가됨");
          setUI(node);
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
  const targetNode = document.querySelector(".lst_view");

  // 변화 관찰 시작
  observer.observe(targetNode, config);

  // 페이지가 언로드될 때 옵저버를 해제
  window.addEventListener("unload", () => observer.disconnect());
}


