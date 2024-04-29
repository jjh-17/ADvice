// 테스트 url : https://blog.naver.com/cindy7928/223401462569

var iframeElements = document
  .getElementById("mainFrame")
  .contentWindow.document.getElementsByClassName("se-main-container");

var elementsArray = Array.from(iframeElements);
var divArray = Array.from(elementsArray[0].children);
var crawlResults = []; // 결과를 저장할 배열

divArray.forEach(function (div) {
  var imgTags = div.getElementsByTagName("img");
  var spanTags = div.getElementsByTagName("span");

  Array.from(imgTags).forEach(function (img) {
    var dataLinkData = img.parentNode.getAttribute("data-linkdata");
    if (dataLinkData) {
      try {
        var linkData = JSON.parse(dataLinkData);
        var id = linkData.id;
        var src = linkData.src;
        crawlResults.push({
          type: "img",
          data: src,
          id: id,
        });
      } catch (e) {
        console.error("JSON parsing error", e);
      }
    }
  });

  Array.from(spanTags).forEach(function (span) {
    var textContent = span.textContent || span.innerText;
    var id = span.getAttribute("id");
    crawlResults.push({
      type: "txt",
      data: textContent,
      id: id,
    });
  });
});

// console.log(crawlResults); -> crawlResult를 백엔드로 전송
var listData = {};

chrome.runtime.sendMessage({ action: "detailBlog" }, function (response) {
  listData = response.data;

  // goodList의 각 항목에 대해서
  listData.goodList.forEach(function (item) {
    var element = document
      .getElementById("mainFrame")
      .contentWindow.document.getElementById(item.id);

    if (element) {
      var html = element.innerHTML;
      item.data.forEach(function (data) {
        html = html.replace(
          data,
          '<span style="background-color: rgba(66, 189, 101, 0.3)">' +
            data +
            "</span>"
        );
      });
      element.innerHTML = html;
    }
  });

  // badList의 각 항목에 대해서
  listData.badList.forEach(function (item) {
    var element = document
      .getElementById("mainFrame")
      .contentWindow.document.getElementById(item.id);

    var html = element.innerHTML;
    if (element) {
      var html = element.innerHTML;
      item.data.forEach(function (data) {
        html = html.replace(
          data,
          '<span style="background-color: rgba(241, 43, 67, 0.3)">' +
            data +
            "</span>"
        );
      });
      element.innerHTML = html;
    }
  });
});
