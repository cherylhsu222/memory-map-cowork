import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const CONFIG = {
  mapboxToken: window.APP_CONFIG?.mapboxToken || "",
  geoapifyKey: window.APP_CONFIG?.geoapifyKey || "",
  supabaseUrl: window.APP_CONFIG?.supabaseUrl || "",
  supabasePublishableKey: window.APP_CONFIG?.supabasePublishableKey || ""
};

const defaultCenter = [121.805, 24.45];
const pageSize = 10;
const overlaySourceId = "historic-overlay-source";
const overlayLayerId = "historic-overlay-layer";

const villageOptions = ["全部村落", "南澳村", "武塔村", "金洋村", "澳花村", "金岳村", "碧候村", "東岳村"];
const eraOptions = ["全部年代", "1940 年代", "1950 年代", "1960 年代", "1970 年代", "1980 年代", "1990 年代", "2000 年代", "2010 年代", "2020 年代", "2026"];
const categoryOptions = ["人物", "地景", "生活", "產業", "文化", "其他"];
const reportFieldOptions = ["標題", "地點", "時間", "內容", "照片", "其他"];

const historyLayerOptions = [
  { id: "none", label: "僅現代底圖", title: "Mapbox 現代底圖", tiles: null, source: "Mapbox" },
  {
    id: "yilan1911",
    label: "1911 宜蘭廳管內圖",
    title: "宜蘭廳管內圖(1911)",
    tiles: ["https://gis.sinica.edu.tw/yilan/file-exists.php?img=Yilan_1911-png-{z}-{x}-{y}"],
    source: "中央研究院 宜蘭百年歷史地圖 WMTS"
  },
  {
    id: "yilan1917",
    label: "1917 宜蘭廳管內圖",
    title: "宜蘭廳管內圖(1917)",
    tiles: ["https://gis.sinica.edu.tw/yilan/file-exists.php?img=Yilan_1917-png-{z}-{x}-{y}"],
    source: "中央研究院 宜蘭百年歷史地圖 WMTS"
  },
  {
    id: "yilan1920",
    label: "1920 宜蘭廳管內圖",
    title: "宜蘭廳管內圖(1920)",
    tiles: ["https://gis.sinica.edu.tw/yilan/file-exists.php?img=Yilan_1920-png-{z}-{x}-{y}"],
    source: "中央研究院 宜蘭百年歷史地圖 WMTS"
  },
  {
    id: "yilan1976",
    label: "1976 宜蘭縣地圖",
    title: "宜蘭縣地圖(1976)",
    tiles: ["https://gis.sinica.edu.tw/yilan/file-exists.php?img=Yilan_123K_1976-png-{z}-{x}-{y}"],
    source: "中央研究院 宜蘭百年歷史地圖 WMTS"
  },
  {
    id: "yilan1997",
    label: "1997 宜蘭縣行政區域圖",
    title: "宜蘭縣行政區域圖(1997)",
    tiles: ["https://gis.sinica.edu.tw/yilan/file-exists.php?img=Yilan_65K_1997-png-{z}-{x}-{y}"],
    source: "中央研究院 宜蘭百年歷史地圖 WMTS"
  }
];

const localSuggestions = [
  { title: "南澳", subtitle: "宜蘭縣南澳鄉", placeName: "南澳鄉", center: [121.7995, 24.4654] },
  { title: "南澳鄉公所", subtitle: "南澳鄉公所", placeName: "南澳鄉公所", center: [121.8026, 24.4661] },
  { title: "南澳車站", subtitle: "台鐵南澳車站", placeName: "南澳車站", center: [121.8046, 24.464] },
  { title: "武塔", subtitle: "南澳鄉武塔村", placeName: "武塔村", center: [121.7831, 24.4095] },
  { title: "武塔車站", subtitle: "台鐵武塔車站", placeName: "武塔車站", center: [121.7862, 24.4084] },
  { title: "金洋", subtitle: "南澳鄉金洋村", placeName: "金洋村", center: [121.6325, 24.4544] },
  { title: "澳花", subtitle: "南澳鄉澳花村", placeName: "澳花村", center: [121.6552, 24.3246] },
  { title: "澳花車站", subtitle: "台鐵澳花車站", placeName: "澳花車站", center: [121.6525, 24.3265] },
  { title: "金岳", subtitle: "南澳鄉金岳村", placeName: "金岳村", center: [121.7463, 24.477] },
  { title: "碧候", subtitle: "南澳鄉碧候村", placeName: "碧候村", center: [121.7545, 24.4978] },
  { title: "東岳", subtitle: "南澳鄉東岳村", placeName: "東岳村", center: [121.8255, 24.4521] },
  { title: "南澳南溪", subtitle: "南澳南溪", placeName: "南澳南溪", center: [121.7358, 24.4295] },
  { title: "南澳北溪", subtitle: "南澳北溪", placeName: "南澳北溪", center: [121.7444, 24.4853] },
  { title: "思源埡口", subtitle: "思源埡口", placeName: "思源埡口", center: [121.3416, 24.3637] },
  { title: "那山那谷", subtitle: "南澳金洋村溪谷營地", placeName: "那山那谷", center: [121.74949, 24.43671] },
  { title: "大南澳震安宮", subtitle: "南澳重要信仰地景", placeName: "大南澳震安宮", center: [121.8162, 24.4644] },
  { title: "朝陽國家步道", subtitle: "朝陽步道", placeName: "朝陽國家步道", center: [121.8234, 24.3431] },
  { title: "碧候溫泉", subtitle: "碧候溫泉", placeName: "碧候溫泉", center: [121.7344, 24.4937] },
  { title: "金岳瀑布", subtitle: "金岳瀑布", placeName: "金岳瀑布", center: [121.7368, 24.4911] }
];

const localizedReplacements = new Map([
  ["Nan-ao", "南澳"],
  ["Nan’ao", "南澳"],
  ["Aohua", "澳花"],
  ["Wuta", "武塔"],
  ["Jinyang", "金洋"],
  ["Jinyue", "金岳"],
  ["Bihou", "碧候"],
  ["Dongyue", "東岳"],
  ["Nanao Township", "南澳鄉"],
  ["Suao Township", "蘇澳鎮"],
  ["Yilan County", "宜蘭縣"],
  ["Taiwan", "台灣"]
]);

const seedMemories = [
  {
    id: "seed-gujumu",
    title: "谷久牧 – 段木香菇",
    content:
      "在南澳的山林裡，段木香菇的氣味，陪伴著許多家庭長大。林桂珍是南澳段木香菇種植的第三代，這項技術從外公傳給父親，再一路延續到她身上。她從國小開始，就跟著父母上山種菇，山林、木頭與潮濕的菇寮，成了她童年最熟悉的風景。",
    place_name: "南澳村中正路 22 巷 8-1 號",
    latitude: 24.4501,
    longitude: 121.8052,
    period_text: "2010 年",
    sharer_name: "林桂珍",
    category: "產業",
    tags: ["段木香菇", "谷久牧", "南澳村"],
    image_url: "./assets/gujumu-lin-guizhen.JPG",
    source_label: "田野訪談整理",
    status: "approved"
  }
];

const state = {
  memories: [],
  filteredMemories: [],
  selectedId: null,
  currentPage: 1,
  category: "全部",
  village: "全部村落",
  era: "全部年代",
  keyword: "",
  popupExpanded: false,
  formCategory: "生活",
  pickerLngLat: [...defaultCenter],
  pickerResults: [],
  activeLayerId: "none",
  reportTargetMemory: null,
  reportFields: []
};

const supabase = CONFIG.supabaseUrl && CONFIG.supabasePublishableKey
  ? createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey)
  : null;

const els = {
  memoryCount: document.getElementById("memory-count"),
  searchInput: document.getElementById("search-input"),
  typeChipGroup: document.getElementById("type-chip-group"),
  villageSelect: document.getElementById("village-select"),
  eraSelect: document.getElementById("era-select"),
  memoryList: document.getElementById("memory-list"),
  memoryPagination: document.getElementById("memory-pagination"),
  memoryPaginationInfo: document.getElementById("memory-pagination-info"),
  pagePrev: document.getElementById("page-prev"),
  pageNext: document.getElementById("page-next"),
  popupCard: document.getElementById("map-popup-card"),
  popupImage: document.getElementById("popup-image"),
  popupCategory: document.getElementById("popup-category"),
  popupPlace: document.getElementById("popup-place"),
  popupPeriod: document.getElementById("popup-period"),
  popupTitle: document.getElementById("popup-title"),
  popupTags: document.getElementById("popup-tags"),
  popupText: document.getElementById("popup-text"),
  popupSharer: document.getElementById("popup-sharer"),
  popupSource: document.getElementById("popup-source"),
  popupToggle: document.getElementById("popup-toggle"),
  popupReport: document.getElementById("popup-report"),
  reportOverlay: document.getElementById("report-overlay"),
  reportTargetTitle: document.getElementById("report-target-title"),
  closeReport: document.getElementById("close-report"),
  reportForm: document.getElementById("report-form"),
  reportFieldOptionsEl: document.getElementById("report-field-options"),
  reportDescriptionInput: document.getElementById("report-description-input"),
  reportNameInput: document.getElementById("report-name-input"),
  reportFeedback: document.getElementById("report-feedback"),
  reportSubmitButton: document.getElementById("report-submit-button"),
  layerToggle: document.getElementById("layer-toggle"),
  layerPanel: document.getElementById("layer-panel"),
  layerOptions: document.getElementById("layer-options"),
  categoryOptions: document.getElementById("category-options"),
  fabButton: document.getElementById("fab-button"),
  composerPanel: document.getElementById("composer-panel"),
  closeComposer: document.getElementById("close-composer"),
  memoryForm: document.getElementById("memory-form"),
  photoInput: document.getElementById("photo-input"),
  uploadLabel: document.getElementById("upload-label"),
  titleInput: document.getElementById("title-input"),
  placeInput: document.getElementById("place-input"),
  periodInput: document.getElementById("period-input"),
  contentInput: document.getElementById("content-input"),
  sharerInput: document.getElementById("sharer-input"),
  submitFeedback: document.getElementById("submit-feedback"),
  pickerSearchInput: document.getElementById("picker-search-input"),
  pickerSearchButton: document.getElementById("picker-search-button"),
  pickerLocateButton: document.getElementById("picker-locate-button"),
  pickerResults: document.getElementById("picker-results"),
  pickerMessage: document.getElementById("picker-message")
};

let mainMap;
let pickerMap;
let pickerMarker;
let searchTimer;
const markers = new Map();

function summaryText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function compactSummary(text = "") {
  const normalized = summaryText(text);
  if (normalized.length <= 34) return normalized;
  return `${normalized.slice(0, 34)}…`;
}

function normalizeCategory(value) {
  return categoryOptions.includes(value) ? value : "其他";
}

function inferVillage(placeName = "") {
  return villageOptions.find((item) => item !== "全部村落" && placeName.includes(item)) || "";
}

function inferEra(periodText = "") {
  if (!periodText) return "";
  if (periodText.includes("2026")) return "2026";
  const match = periodText.match(/(19|20)\d{2}/);
  if (!match) return "";
  const year = Number(match[0]);
  if (year >= 2020) return "2020 年代";
  return `${String(year).slice(0, 3)}0 年代`;
}

function uniqueById(memories) {
  const seen = new Map();
  memories.forEach((item) => {
    seen.set(item.id, item);
  });
  return [...seen.values()];
}

function normalizeMemory(row) {
  return {
    id: row.id,
    title: row.title || "未命名記憶",
    content: row.content || "",
    place_name: row.place_name || "未標示地點",
    latitude: Number(row.latitude) || defaultCenter[1],
    longitude: Number(row.longitude) || defaultCenter[0],
    period_text: row.period_text || "未標示年代",
    sharer_name: row.sharer_name || "未具名",
    category: normalizeCategory(row.category || "其他"),
    tags: Array.isArray(row.tags) ? row.tags : [],
    image_url: row.image_url || "",
    source_label: row.source_label || "民眾投稿",
    status: row.status || "approved",
    summary: compactSummary(row.content || "")
  };
}

function mergeMemories(rows) {
  const normalizedRows = rows.map(normalizeMemory);
  const merged = [...seedMemories.map(normalizeMemory)];
  normalizedRows.forEach((row) => {
    if (!merged.some((item) => item.title === row.title && item.place_name === row.place_name)) {
      merged.push(row);
    }
  });
  return uniqueById(merged);
}

async function loadMemories() {
  if (!supabase) {
    state.memories = seedMemories.map(normalizeMemory);
    return;
  }

  const { data, error } = await supabase
    .from("memories")
    .select("id, title, content, place_name, latitude, longitude, period_text, sharer_name, category, tags, image_url, source_label, status, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    state.memories = seedMemories.map(normalizeMemory);
    return;
  }

  state.memories = mergeMemories(data || []);
}

function populateSelect(select, options) {
  select.innerHTML = "";
  options.forEach((option) => {
    const el = document.createElement("option");
    el.value = option;
    el.textContent = option;
    select.appendChild(el);
  });
}

function renderFormCategories() {
  els.categoryOptions.innerHTML = "";
  categoryOptions.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.formCategory === category ? " is-active" : ""}`;
    button.textContent = category;
    button.addEventListener("click", () => {
      state.formCategory = category;
      renderFormCategories();
    });
    els.categoryOptions.appendChild(button);
  });
}

function currentSelectedMemory() {
  return state.filteredMemories.find((memory) => memory.id === state.selectedId) || null;
}

function renderReportFieldOptions() {
  els.reportFieldOptionsEl.innerHTML = "";
  reportFieldOptions.forEach((field) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${state.reportFields.includes(field) ? " is-active" : ""}`;
    button.textContent = field;
    button.addEventListener("click", () => {
      state.reportFields = state.reportFields.includes(field)
        ? state.reportFields.filter((item) => item !== field)
        : [...state.reportFields, field];
      renderReportFieldOptions();
    });
    els.reportFieldOptionsEl.appendChild(button);
  });
}

function setReportFeedback(message, isError = false) {
  els.reportFeedback.textContent = message;
  els.reportFeedback.classList.remove("hidden");
  els.reportFeedback.style.background = isError ? "rgba(248, 235, 224, 0.96)" : "rgba(31, 93, 84, 0.1)";
  els.reportFeedback.style.color = isError ? "#9c4b2d" : "var(--green-deep)";
}

function clearReportFeedback() {
  els.reportFeedback.classList.add("hidden");
  els.reportFeedback.textContent = "";
}

function openReportModal(memory) {
  if (!memory) return;
  state.reportTargetMemory = memory;
  state.reportFields = [];
  els.reportTargetTitle.textContent = `你正在回報：《${memory.title}》`;
  els.reportForm.reset();
  clearReportFeedback();
  renderReportFieldOptions();
  els.reportOverlay.classList.remove("hidden");
}

function closeReportModal() {
  els.reportOverlay.classList.add("hidden");
  state.reportTargetMemory = null;
}

async function submitReport(event) {
  event.preventDefault();

  if (!state.reportTargetMemory) return;

  if (!supabase) {
    setReportFeedback("目前還沒接上 Supabase，所以這一版只能看畫面。", true);
    return;
  }

  const description = els.reportDescriptionInput.value.trim();
  if (state.reportFields.length === 0 && !description) {
    setReportFeedback("請至少勾選一個想修正的地方，或寫一下說明。", true);
    return;
  }

  setReportFeedback("送出中…");

  try {
    const { error } = await supabase.from("memory_reports").insert({
      memory_id: String(state.reportTargetMemory.id),
      memory_title_snapshot: state.reportTargetMemory.title,
      fields: state.reportFields,
      description,
      reporter_name: els.reportNameInput.value.trim() || null,
      status: "pending"
    });

    if (error) {
      setReportFeedback(`回報送出失敗：${error.message}`, true);
      return;
    }

    setReportFeedback("回報成功送出，感謝你的補充，審核通過後會更新到記憶庫。");
    window.setTimeout(() => {
      closeReportModal();
    }, 1600);
  } catch (error) {
    setReportFeedback(`回報送出失敗：${error.message}`, true);
  }
}

function applyFilters() {
  const keyword = state.keyword.trim().toLowerCase();
  state.filteredMemories = state.memories.filter((memory) => {
    const memoryVillage = inferVillage(memory.place_name);
    const memoryEra = inferEra(memory.period_text);
    const matchesCategory = state.category === "全部" || memory.category === state.category;
    const matchesVillage = state.village === "全部村落" || memoryVillage === state.village;
    const matchesEra = state.era === "全部年代" || memoryEra === state.era;
    const matchesKeyword = !keyword || [
      memory.title,
      memory.content,
      memory.place_name,
      memory.sharer_name,
      memory.category,
      ...(memory.tags || [])
    ].join(" ").toLowerCase().includes(keyword);
    return matchesCategory && matchesVillage && matchesEra && matchesKeyword;
  });

  const totalPages = Math.max(1, Math.ceil(state.filteredMemories.length / pageSize));
  state.currentPage = Math.min(state.currentPage, totalPages);
  if (state.currentPage < 1) state.currentPage = 1;

  if (!currentSelectedMemory() && state.filteredMemories.length) {
    state.selectedId = state.filteredMemories[0].id;
    state.popupExpanded = false;
  }

  if (!state.filteredMemories.length) {
    state.selectedId = null;
    state.popupExpanded = false;
  }
}

function currentPageItems() {
  const start = (state.currentPage - 1) * pageSize;
  return state.filteredMemories.slice(start, start + pageSize);
}

function renderLeftList() {
  els.memoryList.innerHTML = "";
  const items = currentPageItems();

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>目前沒有符合條件的記憶</strong><span>你可以換一個篩選，或新增一筆自己的故事。</span>";
    els.memoryList.appendChild(empty);
    return;
  }

  items.forEach((memory) => {
    const article = document.createElement("article");
    article.className = `memory-card${memory.id === state.selectedId ? " is-selected" : ""}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "memory-card-main";
    button.addEventListener("click", () => {
      state.selectedId = memory.id;
      state.popupExpanded = false;
      renderAll();
      focusMemory(memory);
    });

    const thumb = document.createElement("div");
    thumb.className = "memory-thumb";
    thumb.style.backgroundImage = `url('${memory.image_url || "./assets/gujumu-lin-guizhen.JPG"}')`;

    const copy = document.createElement("div");
    copy.className = "memory-card-copy";

    const title = document.createElement("h3");
    title.textContent = memory.title;

    const summary = document.createElement("p");
    summary.className = "memory-card-summary";
    summary.textContent = memory.summary;

    const category = document.createElement("div");
    category.className = "memory-card-tags";
    category.innerHTML = `<span class="category-badge">${memory.category}</span>`;

    copy.append(title, summary, category);
    button.append(thumb, copy);
    article.append(button);
    els.memoryList.appendChild(article);
  });
}

function renderPagination() {
  const total = state.filteredMemories.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const shouldShow = total > pageSize;
  els.memoryPagination.classList.toggle("hidden", !shouldShow);
  els.memoryPaginationInfo.textContent = `${state.currentPage} / ${totalPages} 頁`;
  els.pagePrev.disabled = state.currentPage <= 1;
  els.pageNext.disabled = state.currentPage >= totalPages;
}

function renderPopup() {
  const memory = currentSelectedMemory();
  if (!memory) {
    els.popupCard.classList.add("hidden");
    return;
  }

  els.popupCard.classList.remove("hidden");
  els.popupCard.classList.toggle("is-expanded", state.popupExpanded);
  els.popupImage.style.backgroundImage = `url('${memory.image_url || "./assets/gujumu-lin-guizhen.JPG"}')`;
  els.popupCategory.textContent = memory.category;
  els.popupPlace.textContent = memory.place_name;
  els.popupPeriod.textContent = memory.period_text;
  els.popupTitle.textContent = memory.title;
  els.popupText.textContent = state.popupExpanded ? memory.content : memory.summary;
  els.popupSharer.textContent = `分享者：${memory.sharer_name}`;
  els.popupSource.textContent = `來源：${memory.source_label}`;
  els.popupToggle.textContent = state.popupExpanded ? "收合" : "完整內容…";

  els.popupTags.innerHTML = "";
  (memory.tags || []).forEach((tag) => {
    const span = document.createElement("span");
    span.className = "hash-tag";
    span.textContent = `#${tag}`;
    els.popupTags.appendChild(span);
  });
}

function updateCount() {
  els.memoryCount.textContent = `${state.filteredMemories.length} 筆內容`;
}

function renderSidebarChips() {
  [...els.typeChipGroup.querySelectorAll(".chip")].forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.category === state.category);
  });
}

function renderAll() {
  applyFilters();
  updateCount();
  renderSidebarChips();
  renderLeftList();
  renderPagination();
  renderPopup();
  renderMarkers();
}

function buildMarker(memory) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "mapbox-memory-marker";
  element.addEventListener("click", () => {
    state.selectedId = memory.id;
    state.popupExpanded = false;
    renderAll();
    focusMemory(memory);
  });

  return new mapboxgl.Marker({ element })
    .setLngLat([memory.longitude, memory.latitude]);
}

function renderMarkers() {
  if (!mainMap) return;

  markers.forEach((marker) => marker.remove());
  markers.clear();

  state.filteredMemories.forEach((memory) => {
    const marker = buildMarker(memory).addTo(mainMap);
    if (memory.id === state.selectedId) {
      marker.getElement().classList.add("is-active");
    }
    markers.set(memory.id, marker);
  });
}

function focusMemory(memory) {
  if (!mainMap || !memory) return;
  mainMap.easeTo({ center: [memory.longitude, memory.latitude], zoom: 11.8, duration: 900 });
}

function createFallbackMessage(message) {
  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";
  wrapper.style.margin = "18px";
  wrapper.innerHTML = `<strong>${message}</strong><span>請先確認 config.js 或 GitHub Secrets 裡的 Mapbox token 是否正確。</span>`;
  document.getElementById("main-map")?.appendChild(wrapper);
}

function setHistoricLayer(layerId) {
  state.activeLayerId = layerId;
  if (!mainMap || !mainMap.isStyleLoaded()) return;

  const existingLayer = mainMap.getLayer(overlayLayerId);
  if (existingLayer) mainMap.removeLayer(overlayLayerId);
  const existingSource = mainMap.getSource(overlaySourceId);
  if (existingSource) mainMap.removeSource(overlaySourceId);

  const selected = historyLayerOptions.find((item) => item.id === layerId);
  if (selected && selected.tiles) {
    mainMap.addSource(overlaySourceId, {
      type: "raster",
      tiles: selected.tiles,
      tileSize: 256,
      attribution: selected.source
    });
    mainMap.addLayer({
      id: overlayLayerId,
      type: "raster",
      source: overlaySourceId,
      paint: { "raster-opacity": 0.72 }
    });
  }

  renderLayerOptions();
}

function renderLayerOptions() {
  els.layerOptions.innerHTML = "";
  historyLayerOptions.forEach((layer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `layer-option${layer.id === state.activeLayerId ? " is-active" : ""}`;
    button.innerHTML = `
      <span class="radio-dot"></span>
      <span class="layer-option-copy">
        <strong>${layer.label}</strong>
        <span>${layer.title}</span>
      </span>
    `;
    button.addEventListener("click", () => setHistoricLayer(layer.id));
    els.layerOptions.appendChild(button);
  });
}

function initMainMap() {
  if (!window.mapboxgl || !CONFIG.mapboxToken) {
    createFallbackMessage("還沒設定 Mapbox token");
    return;
  }

  mapboxgl.accessToken = CONFIG.mapboxToken;
  mainMap = new mapboxgl.Map({
    container: "main-map",
    style: "mapbox://styles/mapbox/outdoors-v12",
    center: defaultCenter,
    zoom: 9.6
  });

  mainMap.addControl(new mapboxgl.NavigationControl(), "top-right");
  mainMap.on("load", () => {
    renderMarkers();
    renderLayerOptions();
    setHistoricLayer(state.activeLayerId);
    const selected = currentSelectedMemory();
    if (selected) focusMemory(selected);
  });
}

function setPickerPoint(lngLat, placeName = "") {
  state.pickerLngLat = [lngLat.lng, lngLat.lat];
  els.pickerMessage.textContent = `目前選點：${lngLat.lat.toFixed(5)}, ${lngLat.lng.toFixed(5)}`;
  if (placeName) {
    els.placeInput.value = placeName;
    els.pickerSearchInput.value = placeName;
  }
  if (pickerMap) {
    if (!pickerMarker) {
      const markerEl = document.createElement("div");
      markerEl.className = "mapbox-picker-marker";
      pickerMarker = new mapboxgl.Marker({ element: markerEl }).setLngLat([lngLat.lng, lngLat.lat]).addTo(pickerMap);
    } else {
      pickerMarker.setLngLat([lngLat.lng, lngLat.lat]);
    }
    pickerMap.easeTo({ center: [lngLat.lng, lngLat.lat], duration: 600 });
  }
}

function initPickerMap() {
  if (!window.mapboxgl || !CONFIG.mapboxToken) return;

  pickerMap = new mapboxgl.Map({
    container: "picker-map",
    style: "mapbox://styles/mapbox/outdoors-v12",
    center: defaultCenter,
    zoom: 12.2,
    attributionControl: true
  });

  pickerMap.on("load", () => {
    setPickerPoint({ lng: defaultCenter[0], lat: defaultCenter[1] }, "南澳鄉");
  });

  pickerMap.on("click", (event) => setPickerPoint(event.lngLat, els.placeInput.value.trim()));
}

function localizeText(text = "") {
  let output = text;
  localizedReplacements.forEach((value, key) => {
    output = output.replaceAll(key, value);
  });
  return output;
}

function dedupeResults(results) {
  const seen = new Set();
  return results.filter((item) => {
    const key = `${item.title}|${item.center[0].toFixed(4)}|${item.center[1].toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function searchLocal(query) {
  const lowered = query.toLowerCase();
  return localSuggestions
    .filter((item) => `${item.title} ${item.subtitle} ${item.placeName}`.toLowerCase().includes(lowered))
    .map((item) => ({ ...item, source: "南澳在地字典" }));
}

async function searchMapbox(query) {
  if (!CONFIG.mapboxToken) return [];
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.searchParams.set("q", query);
  url.searchParams.set("language", "zh-Hant");
  url.searchParams.set("country", "tw");
  url.searchParams.set("limit", "5");
  url.searchParams.set("proximity", `${defaultCenter[0]},${defaultCenter[1]}`);
  url.searchParams.set("access_token", CONFIG.mapboxToken);

  const response = await fetch(url.toString());
  const json = await response.json();
  return (json.features || []).map((feature) => ({
    title: localizeText(feature.properties?.name || feature.properties?.full_address || feature.text || query),
    subtitle: localizeText(feature.properties?.full_address || feature.place_name || "Mapbox"),
    placeName: localizeText(feature.properties?.full_address || feature.properties?.name || query),
    center: feature.geometry?.coordinates || defaultCenter,
    source: "Mapbox"
  }));
}

async function searchGeoapify(query) {
  if (!CONFIG.geoapifyKey) return [];
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", query);
  url.searchParams.set("lang", "zh");
  url.searchParams.set("limit", "5");
  url.searchParams.set("apiKey", CONFIG.geoapifyKey);
  url.searchParams.set("filter", "countrycode:tw");
  url.searchParams.set("bias", `proximity:${defaultCenter[0]},${defaultCenter[1]}`);

  const response = await fetch(url.toString());
  const json = await response.json();
  return (json.features || []).map((feature) => ({
    title: feature.properties?.name || feature.properties?.address_line1 || query,
    subtitle: feature.properties?.formatted || "Geoapify",
    placeName: feature.properties?.formatted || feature.properties?.name || query,
    center: feature.geometry?.coordinates || defaultCenter,
    source: "Geoapify"
  }));
}

async function fetchPickerResults(query) {
  const local = searchLocal(query);
  const [mapboxResults, geoResults] = await Promise.allSettled([searchMapbox(query), searchGeoapify(query)]);
  const merged = [
    ...local,
    ...(mapboxResults.status === "fulfilled" ? mapboxResults.value : []),
    ...(geoResults.status === "fulfilled" ? geoResults.value : [])
  ];
  return dedupeResults(merged).slice(0, 8);
}

function renderPickerResults(results) {
  state.pickerResults = results;
  els.pickerResults.innerHTML = "";
  els.pickerResults.classList.toggle("hidden", !results.length);

  results.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "picker-result";
    button.innerHTML = `<strong>${item.title}</strong><span>${item.source} · ${item.subtitle}</span>`;
    button.addEventListener("click", () => {
      setPickerPoint({ lng: item.center[0], lat: item.center[1] }, item.placeName);
      els.pickerResults.classList.add("hidden");
    });
    els.pickerResults.appendChild(button);
  });
}

async function runPickerSearch(autoPickFirst = false) {
  const query = els.pickerSearchInput.value.trim();
  if (!query) {
    els.pickerResults.classList.add("hidden");
    return;
  }

  try {
    const results = await fetchPickerResults(query);
    renderPickerResults(results);
    if (autoPickFirst && results[0]) {
      setPickerPoint({ lng: results[0].center[0], lat: results[0].center[1] }, results[0].placeName);
      els.pickerResults.classList.add("hidden");
    }
  } catch (error) {
    console.error(error);
    els.pickerMessage.textContent = "搜尋失敗，請改用手動點地圖。";
  }
}

function setFeedback(message, isError = false) {
  els.submitFeedback.textContent = message;
  els.submitFeedback.classList.remove("hidden");
  els.submitFeedback.style.background = isError ? "rgba(248, 235, 224, 0.96)" : "rgba(31, 93, 84, 0.1)";
  els.submitFeedback.style.color = isError ? "#9c4b2d" : "var(--green-deep)";
}

async function uploadImageToGithub(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${CONFIG.supabaseUrl}/functions/v1/upload-to-github`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CONFIG.supabasePublishableKey}`,
      apikey: CONFIG.supabasePublishableKey
    },
    body: formData
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "圖片上傳失敗");
  }
  return result.url;
}

async function submitMemory(event) {
  event.preventDefault();

  if (!supabase) {
    setFeedback("目前還沒接上 Supabase，所以這一版只能看畫面。", true);
    return;
  }

  const title = els.titleInput.value.trim();
  const placeName = els.placeInput.value.trim();
  const periodText = els.periodInput.value.trim();
  const content = els.contentInput.value.trim();
  const sharerName = els.sharerInput.value.trim();
  const file = els.photoInput.files?.[0] || null;

  if (!title || !placeName || !periodText || !content || !sharerName) {
    setFeedback("請先把標題、地點、時間、故事內容和分享者都填好。", true);
    return;
  }

  setFeedback("送出中…");

  try {
    let imageUrl = "";
    if (file) {
      try {
        imageUrl = await uploadImageToGithub(file);
      } catch (uploadError) {
        setFeedback(`圖片上傳失敗：${uploadError.message}`, true);
        return;
      }
    }

    const { error: insertError } = await supabase.from("memories").insert({
      title,
      content,
      place_name: placeName,
      latitude: Number(state.pickerLngLat[1].toFixed(6)),
      longitude: Number(state.pickerLngLat[0].toFixed(6)),
      period_text: periodText,
      sharer_name: sharerName,
      category: state.formCategory,
      tags: [state.formCategory],
      image_url: imageUrl || null,
      source_label: "民眾投稿",
      status: "pending"
    });

    if (insertError) {
      setFeedback(`資料寫入失敗：${insertError.message}`, true);
      return;
    }

    els.memoryForm.reset();
    els.uploadLabel.textContent = "上傳照片或舊影像";
    state.formCategory = "生活";
    renderFormCategories();
    setFeedback("已送出成功，這筆內容會先進入待審核。", false);
  } catch (error) {
    console.error(error);
    setFeedback(`資料寫入失敗：${error.message}`, true);
  }
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.keyword = event.target.value;
    state.currentPage = 1;
    renderAll();
  });

  els.typeChipGroup.addEventListener("click", (event) => {
    const button = event.target.closest(".chip");
    if (!button) return;
    state.category = button.dataset.category;
    state.currentPage = 1;
    renderAll();
  });

  els.villageSelect.addEventListener("change", (event) => {
    state.village = event.target.value;
    state.currentPage = 1;
    renderAll();
  });

  els.eraSelect.addEventListener("change", (event) => {
    state.era = event.target.value;
    state.currentPage = 1;
    renderAll();
  });

  els.pagePrev.addEventListener("click", () => {
    state.currentPage -= 1;
    renderAll();
  });

  els.pageNext.addEventListener("click", () => {
    state.currentPage += 1;
    renderAll();
  });

  els.popupToggle.addEventListener("click", () => {
    state.popupExpanded = !state.popupExpanded;
    renderPopup();
  });

  els.popupReport.addEventListener("click", () => {
    openReportModal(currentSelectedMemory());
  });

  els.closeReport.addEventListener("click", closeReportModal);
  els.reportOverlay.addEventListener("click", (event) => {
    if (event.target === els.reportOverlay) closeReportModal();
  });
  els.reportForm.addEventListener("submit", submitReport);

  els.layerToggle.addEventListener("click", () => {
    els.layerPanel.classList.toggle("hidden");
  });

  els.fabButton.addEventListener("click", () => {
    els.composerPanel.classList.remove("hidden");
    els.fabButton.classList.add("hidden");
  });

  els.closeComposer.addEventListener("click", () => {
    els.composerPanel.classList.add("hidden");
    els.fabButton.classList.remove("hidden");
  });

  els.photoInput.addEventListener("change", () => {
    const file = els.photoInput.files?.[0];
    els.uploadLabel.textContent = file ? file.name : "上傳照片或舊影像";
  });

  els.memoryForm.addEventListener("submit", submitMemory);

  els.pickerSearchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runPickerSearch(false), 220);
  });

  els.pickerSearchButton.addEventListener("click", () => runPickerSearch(true));

  els.pickerLocateButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      els.pickerMessage.textContent = "目前瀏覽器不支援定位，請改用搜尋或手動點地圖。";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPickerPoint({ lng: position.coords.longitude, lat: position.coords.latitude }, els.placeInput.value.trim());
      },
      () => {
        els.pickerMessage.textContent = "定位失敗，請改用搜尋或手動點地圖。";
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

async function init() {
  populateSelect(els.villageSelect, villageOptions);
  populateSelect(els.eraSelect, eraOptions);
  renderFormCategories();
  bindEvents();
  await loadMemories();
  state.selectedId = state.memories[0]?.id || null;
  renderAll();
  initMainMap();
  initPickerMap();
}

init();
