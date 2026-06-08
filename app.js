const API_BASE = "https://aihot.virxact.com/api/public/items";
const CACHE_URL = "./data/items.json";

const categoryLabels = {
  "ai-models": "模型发布/更新",
  "ai-products": "产品发布/更新",
  industry: "行业动态",
  paper: "论文研究",
  tip: "技巧与观点",
};

const state = {
  hours: 24,
  category: "all",
  query: "",
  items: [],
  loading: false,
};

const elements = {
  newsList: document.querySelector("#news-list"),
  template: document.querySelector("#news-template"),
  statusPanel: document.querySelector("#status-panel"),
  emptyState: document.querySelector("#empty-state"),
  totalCount: document.querySelector("#total-count"),
  headerStatus: document.querySelector("#header-status"),
  windowLabel: document.querySelector("#window-label"),
  currentDate: document.querySelector("#current-date"),
  searchInput: document.querySelector("#search-input"),
  refreshButton: document.querySelector("#refresh-button"),
  resetButton: document.querySelector("#reset-button"),
};

function getSince(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function normalizeItem(item) {
  return {
    title: item.titleZh || item.title_zh || item.title || "未命名动态",
    summary:
      item.summaryZh ||
      item.summary_zh ||
      item.summary ||
      item.description ||
      "点击查看来源中的完整信息。",
    source: item.sourceName || item.source_name || item.source || "公开来源",
    publishedAt:
      item.publishedAt || item.published_at || item.createdAt || item.created_at || null,
    url: item.sourceUrl || item.source_url || item.url || "https://aihot.virxact.com",
    category: item.category || item.categorySlug || item.category_slug || "industry",
  };
}

function formatTime(value) {
  if (!value) return "时间未标注";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function filteredItems() {
  const query = state.query.trim().toLowerCase();
  const cutoff = Date.now() - state.hours * 60 * 60 * 1000;

  return state.items.filter((item) => {
    const categoryMatch = state.category === "all" || item.category === state.category;
    const publishedTime = item.publishedAt ? new Date(item.publishedAt).getTime() : NaN;
    const timeMatch = Number.isNaN(publishedTime) || publishedTime >= cutoff;
    const queryMatch =
      !query ||
      [item.title, item.summary, item.source].some((value) =>
        String(value).toLowerCase().includes(query),
      );
    return categoryMatch && timeMatch && queryMatch;
  });
}

function render() {
  const items = filteredItems();
  elements.newsList.replaceChildren();
  elements.emptyState.hidden = items.length > 0 || state.loading;

  const fragment = document.createDocumentFragment();

  items.forEach((item, index) => {
    const node = elements.template.content.cloneNode(true);
    const link = node.querySelector(".news-link");
    const arrow = node.querySelector(".news-arrow");
    const time = node.querySelector(".news-time");

    node.querySelector(".news-rank").textContent = String(index + 1).padStart(2, "0");
    node.querySelector(".news-category").textContent =
      categoryLabels[item.category] || item.category || "AI 动态";
    node.querySelector(".news-source").textContent = item.source;
    time.textContent = formatTime(item.publishedAt);
    if (item.publishedAt) time.dateTime = item.publishedAt;
    link.textContent = item.title;
    link.href = item.url;
    arrow.href = item.url;
    node.querySelector(".news-summary").textContent = item.summary;

    fragment.appendChild(node);
  });

  elements.newsList.appendChild(fragment);
  elements.newsList.setAttribute("aria-busy", String(state.loading));
  elements.totalCount.textContent = String(state.items.length).padStart(2, "0");
}

function setStatus(type, title, detail) {
  if (type === "hidden") {
    elements.statusPanel.hidden = true;
    return;
  }

  elements.statusPanel.hidden = false;
  elements.statusPanel.classList.toggle("is-error", type === "error");
  elements.statusPanel.innerHTML = `
    <span class="status-pulse" aria-hidden="true"></span>
    <p><strong>${title}</strong><br>${detail}</p>
  `;
}

async function fetchItems() {
  if (state.loading) return;

  state.loading = true;
  elements.refreshButton.disabled = true;
  elements.headerStatus.textContent = "正在同步精选动态";
  setStatus("loading", "正在加载 AI HOT 精选数据", "连接公开 API，请稍候。");
  render();

  const params = new URLSearchParams({
    mode: "selected",
    since: getSince(state.hours),
    take: "100",
  });

  try {
    const response = await fetch(`${API_BASE}?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(`API 返回 ${response.status}`);
    const data = await response.json();
    const rawItems = Array.isArray(data) ? data : data.items;
    if (!Array.isArray(rawItems)) throw new Error("API 数据格式无法识别");

    state.items = rawItems.map(normalizeItem);
    elements.headerStatus.textContent = `已同步 ${state.items.length} 条精选`;
    setStatus("hidden");
  } catch (liveError) {
    try {
      const cacheResponse = await fetch(`${CACHE_URL}?v=${Date.now()}`, {
        headers: { Accept: "application/json" },
      });
      if (!cacheResponse.ok) throw new Error(`快照返回 ${cacheResponse.status}`);

      const cache = await cacheResponse.json();
      if (!Array.isArray(cache.items) || cache.items.length === 0) {
        throw new Error("快照尚未生成");
      }

      state.items = cache.items.map(normalizeItem);
      const cachedAt = cache.cachedAt ? formatTime(cache.cachedAt) : "时间未标注";
      elements.headerStatus.textContent = `快照同步于 ${cachedAt}`;
      setStatus(
        "error",
        "实时连接不可用，正在展示 GitHub 快照",
        `快照同步时间：${cachedAt}。内容仍来自 AI HOT 公开 API。`,
      );
    } catch (cacheError) {
      state.items = [];
      elements.headerStatus.textContent = "数据源暂时不可达";
      setStatus(
        "error",
        "暂时无法读取 AI HOT 数据",
        `本页不会用旧新闻冒充实时数据。请稍后刷新，或前往 <a href="https://aihot.virxact.com" target="_blank" rel="noreferrer">AI HOT 原站 ↗</a>。`,
      );
      console.error(liveError, cacheError);
    }
  } finally {
    state.loading = false;
    elements.refreshButton.disabled = false;
    render();
  }
}

function setActiveButton(selector, activeButton) {
  document.querySelectorAll(selector).forEach((button) => {
    button.classList.toggle("is-active", button === activeButton);
  });
}

document.querySelectorAll("[data-hours]").forEach((button) => {
  button.addEventListener("click", () => {
    state.hours = Number(button.dataset.hours);
    elements.windowLabel.textContent =
      state.hours === 24 ? "最近 24 小时" : state.hours === 72 ? "最近 3 天" : "最近 7 天";
    setActiveButton("[data-hours]", button);
    if (state.items.length > 0) render();
    else fetchItems();
  });
});

document.querySelectorAll("[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    state.category = button.dataset.category;
    setActiveButton("[data-category]", button);
    render();
  });
});

elements.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

elements.refreshButton.addEventListener("click", fetchItems);

elements.resetButton.addEventListener("click", () => {
  state.category = "all";
  state.query = "";
  elements.searchInput.value = "";
  setActiveButton("[data-category]", document.querySelector('[data-category="all"]'));
  render();
});

elements.currentDate.textContent = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

fetchItems();
