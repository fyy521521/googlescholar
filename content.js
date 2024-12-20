let allResults = [];
let currentPage = 0;
const MAX_PAGES = 10;

async function fetchAllPages() {
  const statusDiv = createStatusDiv();
  for (let i = 0; i < MAX_PAGES; i++) {
    updateStatus(statusDiv, `正在加载第 ${i + 1} 页...`);
    const url = new URL(window.location.href);
    url.searchParams.set('start', i * 10);
    const response = await fetch(url.toString());
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const results = Array.from(doc.querySelectorAll('.gs_r'));
    if (results.length === 0) break;
    allResults = allResults.concat(results);
  }
  return statusDiv;
}

function getCitationCount(result) {
  const citationText = result.querySelector('.gs_fl a:nth-child(3)')?.textContent || '';
  return parseInt(citationText.match(/\d+/) || '0');
}

function sortAndDisplayResults(statusDiv) {
  updateStatus(statusDiv, '正在排序结果...');
  allResults.sort((a, b) => {
    const citationsA = getCitationCount(a);
    const citationsB = getCitationCount(b);
    return citationsB - citationsA;
  });

  const container = document.getElementById('gs_res_ccl_mid');
  container.innerHTML = '';
  allResults.forEach(result => container.appendChild(result.cloneNode(true)));
  updateStatus(statusDiv, `排序完成！共处理了 ${allResults.length} 条结果。`, true);
}

function createStatusDiv() {
  const statusDiv = document.createElement('div');
  statusDiv.style.position = 'fixed';
  statusDiv.style.top = '10px';
  statusDiv.style.right = '10px';
  statusDiv.style.padding = '10px';
  statusDiv.style.background = 'white';
  statusDiv.style.border = '1px solid black';
  statusDiv.style.zIndex = '1000';
  document.body.appendChild(statusDiv);
  return statusDiv;
}

function updateStatus(statusDiv, message, isComplete = false) {
  statusDiv.textContent = message;
  if (isComplete) {
    statusDiv.style.background = '#e6ffe6';
    setTimeout(() => statusDiv.remove(), 5000);
  }
}

async function initSorting() {
  const statusDiv = await fetchAllPages();
  sortAndDisplayResults(statusDiv);
}

// 在页面加载完成后执行排序
window.addEventListener('load', initSorting);

// 添加一个按钮来手动触发排序
const sortButton = document.createElement('button');
sortButton.textContent = '对前10页结果进行排序';
sortButton.style.position = 'fixed';
sortButton.style.top = '10px';
sortButton.style.left = '10px';
sortButton.style.zIndex = '1000';
sortButton.addEventListener('click', initSorting);
document.body.appendChild(sortButton);