// 'user_info' 클래스를 가진 모든 요소를 선택
const userInfoElements = document.getElementsByClassName("api_save_group");
let level = [2, 2, 3, 4, 5];
const maxLevel = 5;

// 선택된 요소들의 내용을 콘솔에 출력
Array.from(userInfoElements).forEach((element, index) => {
  console.log(element.innerHTML); // 또는 element.textContent를 사용할 수도 있습니다.
  const levelValue = level[index];
  const percentage = (levelValue / maxLevel) * 100; // 최대 단계에 대한 현재 단계의 백분율

  // 진행 상태를 표시하는 HTML 구조
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

  // const newDivHTML =
  //   `<div class="my_new_div" style="float: right; display: flex">${levelValue}단계</div>`;
  element.insertAdjacentHTML("afterend", progressBarHTML);
  element.style.display = "flex";
  // element.parentNode.insertBefore(myNewDiv, element.nextSibling)
  const userBox = element.parentNode.querySelector(".user_box_inner");
});

// -------- 유용도 박스

// ------- 호버 모달
// 모달 창 HTML을 페이지에 주입합니다.
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

const links = document.querySelectorAll(".title_area a");
links.forEach((link) => {
  link.addEventListener("mouseover", function () {
    console.log(link);
    // href 속성값을 모달에 표시합니다.
    modalText.textContent = "게시글 요약";

    // 모달의 위치를 조정합니다.
    const linkRect = link.getBoundingClientRect();
    modal.style.left = `${linkRect.left + window.scrollX}px`;
    modal.style.top = `${linkRect.bottom + window.scrollY}px`;
    modal.style.display = "block";
    modal.style.position = 'absolute';
  });

  link.addEventListener("mouseout", function() {
    modal.style.display = "none";
  })
});
