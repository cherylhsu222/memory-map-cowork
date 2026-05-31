import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const CONFIG = {
  mapboxToken: window.APP_CONFIG?.mapboxToken || "",
  geoapifyKey: window.APP_CONFIG?.geoapifyKey || "",
  supabaseUrl: window.APP_CONFIG?.supabaseUrl || "",
  supabasePublishableKey: window.APP_CONFIG?.supabasePublishableKey || ""
};

const defaultCenter = [121.805, 24.45];
const villageOptions = ["全部村落", "南澳村", "武塔村", "金洋村", "澳花村", "金岳村", "碧候村", "東岳村"];
const eraOptions = ["全部年代", "1940 年代", "1950 年代", "1960 年代", "1970 年代", "1980 年代", "1990 年代", "2000 年代", "2010 年代", "2020 年代", "2026"];
const categoryOptions = ["老照片", "生活故事", "遷村", "地景", "產業", "童年", "家族", "文化"];
const historyLayerOptions = [
  { id: "none", label: "僅現代底圖", title: "Mapbox 現代底圖", tiles: null, source: "Mapbox" },
  {
    id: "jm20k1904",
    label: "1904 堡圖",
    title: "1904-日治臺灣堡圖(明治版)-1:20,000",
    tiles: ["https://gis.sinica.edu.tw/tileserver/file-exists.php?img=JM20K_1904-jpg-{z}-{x}-{y}"],
    source: "中央研究院 台灣百年歷史地圖 WMTS"
  },
  {
    id: "jm50k1920",
    label: "1920 地形圖",
    title: "1920-日治五萬分一地形圖(總督府土木局)-1:50,000",
    tiles: ["https://gis.sinica.edu.tw/tileserver/file-exists.php?img=JM50K_1920-png-{z}-{x}-{y}"],
    source: "中央研究院 台灣百年歷史地圖 WMTS"
  },
  {
    id: "jm25k1921",
    label: "1921 二萬五地形圖",
    title: "1921-日治二萬五千分之一地形圖-1:25,000",
    tiles: ["https://gis.sinica.edu.tw/tileserver/file-exists.php?img=JM25K_1921-png-{z}-{x}-{y}"],
    source: "中央研究院 台灣百年歷史地圖 WMTS"
  },
  {
    id: "jm25k1944",
    label: "1944 地形圖",
    title: "1944-日治地形圖(航照修正版)-1:25,000",
    tiles: ["https://gis.sinica.edu.tw/tileserver/file-exists.php?img=JM25K_1944-png-{z}-{x}-{y}"],
    source: "中央研究院 台灣百年歷史地圖 WMTS"
  },
  {
    id: "tm25k1950",
    label: "1950 臺灣地形圖",
    title: "1950-臺灣地形圖-1:25,000",
    tiles: ["https://gis.sinica.edu.tw/tileserver/file-exists.php?img=TM25K_1950-png-{z}-{x}-{y}"],
    source: "中央研究院 台灣百年歷史地圖 WMTS"
  }
];

const localSuggestions = [
  { id: "local-nanao", name: "南澳", aliases: ["南澳鄉", "南澳村", "Nan-ao", "Nanao"], center: [121.802, 24.465] },
  { id: "local-wuta", name: "武塔", aliases: ["武塔村", "Wuta"], center: [121.795, 24.459] },
  { id: "local-jinyang", name: "金洋", aliases: ["金洋村", "Jinyang"], center: [121.742, 24.482] },
  { id: "local-aohua", name: "澳花", aliases: ["澳花村", "Aohua"], center: [121.766, 24.338] },
  { id: "local-jinyue", name: "金岳", aliases: ["金岳村", "Jinyue"], center: [121.764, 24.408] },
  { id: "local-bihou", name: "碧候", aliases: ["碧候村", "Bihou"], center: [121.700, 24.41] },
  { id: "local-nanao-creek", name: "南澳南溪", aliases: ["南澳溪", "南溪", "Nanao Creek"], center: [121.783, 24.438] },
  { id: "local-siyuan", name: "思源埡口", aliases: ["思源", "Siyuan"], center: [121.349, 24.373] },
  { id: "local-ruiyan", name: "瑞岩", aliases: ["瑞岩部落", "Ruiyan"], center: [121.321, 24.25] },
  { id: "local-township-office", name: "南澳鄉公所", aliases: ["南澳公所", "Nanao Township Office"], center: [121.799, 24.463] }
];

const localizedReplacements = [
  ["Nan-ao", "南澳"],
  ["Nanao", "南澳"],
  ["Wuta", "武塔"],
  ["Aohua", "澳花"],
  ["Jinyang", "金洋"],
  ["Jinyue", "金岳"],
  ["Bihou", "碧候"],
  ["Siyuan", "思源埡口"],
  ["Ruiyan", "瑞岩"],
  ["Yilan County", "宜蘭縣"],
  ["Taiwan", "台灣"],
  ["Township Office", "鄉公所"],
  ["Township", "鄉"],
  ["Village", "村"],
  ["Creek", "溪"],
  ["Road", "路"],
  ["Section", "段"]
];

const seedMemories = [
  {
    id: "gujumu-shiitake",
    type: "story",
    title: "谷久牧 – 段木香菇",
    summary: "林桂珍從小跟著家人上山種香菇，山林、木頭與潮濕的菇寮，成了她最熟悉的童年風景。",
    content:
      "在南澳的山林裡，段木香菇的氣味，陪伴著許多家庭長大。林桂珍是南澳段木香菇種植的第三代，這項技術從外公傳給父親，再一路延續到她身上。她從國小開始，就跟著父母上山種菇，山林、木頭與潮濕的菇寮，成了她童年最熟悉的風景。\n\n後來，她與丈夫成立了「谷久牧」，名字來自泰雅語「鞋子」的諧音。最初，他們曾嘗試推廣泰雅傳統織布鞋，如今則專心經營段木香菇，希望把這份來自部落的技藝繼續傳下去。\n\n南澳的段木香菇已有超過百年歷史，最早由日本人引入。對許多在地人而言，種香菇不只是工作，更是一種與土地連結的記憶。即使收入未必穩定，許多人仍選擇繼續種植，只因「割捨不掉那個歷史的情感」。林桂珍說，對這一代的人來說，種香菇早已成為生活的一部分，「不種，反而會覺得奇怪。」\n\n過去，部落裡盛行「換工」文化，親戚鄰居彼此幫忙植菌、搬運段木，也讓許多婦女有了工作機會。有時大家還會一起種香菇，將收入作為興建教會會堂的經費。如今，這樣的互助景象雖逐漸減少，但林桂珍仍持續教下一代學習植菌技術，希望這份山林中的記憶，不會在南澳消失。",
    placeName: "南澳村中正路 22 巷 8-1 號",
    village: "南澳村",
    periodLabel: "2010 年",
    decade: "2010 年代",
    sharer: "林桂珍",
    category: "產業",
    hashtags: ["#段木香菇", "#谷久牧", "#南澳村"],
    sourceLabel: "田野訪談整理",
    position: [121.801, 24.463],
    accent: "forest",
    imagePath: "./assets/gujumu-lin-guizhen.JPG",
    status: "approved"
  }
];

const state = {
  supabase: null,
  memories: [],
  filteredMemories: [],
  selectedType: "all",
  selectedVillage: "全部村落",
  selectedEra: "全部年代",
  search: "",
  selectedMemoryId: null,
  expandedMemoryId: null,
  selectedTags: ["生活故事"],
  customTags: [],
  activeLayerId: "none",
  pickerCoords: { lng: defaultCenter[0], lat: defaultCenter[1] },
  pickerResults: [],
  mainMap: null,
  pickerMap: null,
  mainMarkers: [],
  pickerMarker: null,
  sessionToken: createSessionToken(),
  uploading: false
};

const overlaySourceId = "historic-overlay-source";
const overlayLayerId = "historic-overlay-layer";

const elements = {};

function createSessionToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function localizeText(text = "") {
  return localizedReplacements.reduce((current, [from, to]) => current.replaceAll(from, to), text);
}

function inferVillage(placeName) {
  return villageOptions.find((village) => village !== "全部村落" && placeName.includes(village)) || "南澳村";
}

function inferType(category, imageUrl) {
  if (category === "老照片") return "photo";
  return imageUrl ? "photo" : "story";
}

function inferDecade(periodText) {
  const match = String(periodText).match(/(19|20)\d{2}/);
  if (!match) return periodText;
  return `${match[0].slice(0, 3)}0 年代`;
}

function inferAccent(category) {
  if (category === "老照片") return "gold";
  if (category === "產業") return "forest";
  return "earth";
}

function summarize(text) {
  return text.length > 68 ? `${text.slice(0, 68)}…` : text;
}

function mapMemoryRow(row) {
  return {
    id: row.id,
    type: inferType(row.category, row.image_url),
    title: row.title,
    summary: summarize(row.content),
    content: row.content,
    placeName: row.place_name,
    village: inferVillage(row.place_name),
    periodLabel: row.period_text,
    decade: inferDecade(row.period_text),
    sharer: row.sharer_name,
    category: row.category,
    hashtags: (row.tags || []).map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)),
    sourceLabel: row.source_label || "民眾投稿",
    position: [row.longitude, row.latitude],
    accent: inferAccent(row.category),
    imagePath: row.image_url || null,
    status: row.status || "approved"
  };
}

function getSelectedMemory() {
  return state.filteredMemories.find((memory) => memory.id === state.selectedMemoryId) || state.filteredMemories[0] || null;
}

function setFeedback(message, isError = false) {
  elements.submitFeedback.textContent = message;
  elements.submitFeedback.classList.remove("hidden");
  elements.submitFeedback.style.background = isError ? "rgba(217, 111, 75, 0.12)" : "rgba(31, 93, 84, 0.10)";
  elements.submitFeedback.style.color = isError ? "#a24d32" : "#194b44";
}

function clearFeedback() {
  elements.submitFeedback.classList.add("hidden");
  elements.submitFeedback.textContent = "";
}

function bindElements() {
  Object.assign(elements, {
    memoryCount: document.querySelector("#memory-count"),
    searchInput: document.querySelector("#search-input"),
    villageSelect: document.querySelector("#village-select"),
    eraSelect: document.querySelector("#era-select"),
    memoryList: document.querySelector("#memory-list"),
    popupCard: document.querySelector("#map-popup-card"),
    popupImage: document.querySelector("#popup-image"),
    popupCategory: document.querySelector("#popup-category"),
    popupPlace: document.querySelector("#popup-place"),
    popupPeriod: document.querySelector("#popup-period"),
    popupTitle: document.querySelector("#popup-title"),
    popupTags: document.querySelector("#popup-tags"),
    popupText: document.querySelector("#popup-text"),
    popupSharer: document.querySelector("#popup-sharer"),
    popupSource: document.querySelector("#popup-source"),
    popupToggle: document.querySelector("#popup-toggle"),
    layerToggle: document.querySelector("#layer-toggle"),
    layerPanel: document.querySelector("#layer-panel"),
    layerOptions: document.querySelector("#layer-options"),
    composerPanel: document.querySelector("#composer-panel"),
    fabButton: document.querySelector("#fab-button"),
    closeComposer: document.querySelector("#close-composer"),
    categoryOptions: document.querySelector("#category-options"),
    customTagInput: document.querySelector("#custom-tag-input"),
    addTagButton: document.querySelector("#add-tag-button"),
    customTagList: document.querySelector("#custom-tag-list"),
    pickerSearchInput: document.querySelector("#picker-search-input"),
    pickerSearchButton: document.querySelector("#picker-search-button"),
    pickerLocateButton: document.querySelector("#picker-locate-button"),
    pickerResults: document.querySelector("#picker-results"),
    pickerMessage: document.querySelector("#picker-message"),
    pickerMap: document.querySelector("#picker-map"),
    uploadLabel: document.querySelector("#upload-label"),
    photoInput: document.querySelector("#photo-input"),
    titleInput: document.querySelector("#title-input"),
    placeInput: document.querySelector("#place-input"),
    periodInput: document.querySelector("#period-input"),
    contentInput: document.querySelector("#content-input"),
    sharerInput: document.querySelector("#sharer-input"),
    form: document.querySelector("#memory-form"),
    submitButton: document.querySelector("#submit-button"),
    submitFeedback: document.querySelector("#submit-feedback")
  });
}

function populateSelect(select, options) {
  select.innerHTML = options.map((option) => `<option value="${option}">${option}</option>`).join("");
}

function renderCategoryOptions() {
  elements.categoryOptions.innerHTML = categoryOptions
    .map(
      (option) =>
        `<button class="${state.selectedTags.includes(option) ? "choice-pill is-active" : "choice-pill"}" data-tag="${option}" type="button">${option}</button>`
    )
    .join("");

  elements.categoryOptions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const tag = button.dataset.tag;
      if (state.selectedTags.includes(tag)) {
        state.selectedTags = state.selectedTags.filter((item) => item !== tag);
      } else {
        state.selectedTags = [...state.selectedTags, tag];
      }
      renderCategoryOptions();
    });
  });
}

function renderCustomTags() {
  elements.customTagList.innerHTML = state.customTags.map((tag) => `<span class="hash-tag">#${tag}</span>`).join("");
}

function renderMemoryList() {
  elements.memoryCount.textContent = `${state.filteredMemories.length} 筆內容`;

  if (state.filteredMemories.length === 0) {
    elements.memoryList.innerHTML = `
      <div class="empty-state">
        <strong>目前沒有已公開的內容</strong>
        <p>投稿會先進待審核，你通過之後才會出現在地圖和文章區。</p>
      </div>
    `;
    return;
  }

  elements.memoryList.innerHTML = state.filteredMemories
    .map((memory) => {
      const isSelected = memory.id === state.selectedMemoryId;
      const isExpanded = memory.id === state.expandedMemoryId;
      const thumbClass = memory.imagePath ? "memory-thumb has-image" : `memory-thumb tone-${memory.accent}`;
      const thumbStyle = memory.imagePath ? `style="background-image:url('${memory.imagePath}')"` : "";

      return `
        <article class="memory-card ${isSelected ? "is-selected" : ""}" data-memory-id="${memory.id}">
          <button class="memory-card-main" data-action="select" type="button">
            <div class="${thumbClass}" ${thumbStyle}>
              <span>${memory.category}</span>
            </div>
            <div class="memory-copy">
              <div class="memory-meta">
                <span>${memory.placeName}</span>
                <span>${memory.periodLabel}</span>
              </div>
              <h3>${memory.title}</h3>
              <p>${memory.summary}</p>
              <div class="tag-row compact">
                ${memory.hashtags.map((tag) => `<span class="hash-tag">${tag}</span>`).join("")}
              </div>
            </div>
          </button>
          <div class="memory-card-footer">
            <button class="memory-expand-button" data-action="expand" type="button">${isExpanded ? "收合" : "完整內容…"}</button>
          </div>
          ${
            isExpanded
              ? `<div class="memory-expanded-copy">
                  <p>${memory.content.replace(/\n/g, "<br />")}</p>
                  <div class="popup-source">
                    <span>分享者：${memory.sharer}</span>
                    <span>來源：${memory.sourceLabel}</span>
                  </div>
                </div>`
              : ""
          }
        </article>
      `;
    })
    .join("");

  elements.memoryList.querySelectorAll(".memory-card").forEach((card) => {
    const memoryId = card.dataset.memoryId;
    card.querySelector('[data-action="select"]').addEventListener("click", () => {
      state.selectedMemoryId = memoryId;
      state.expandedMemoryId = null;
      renderAll();
      focusSelectedMemoryOnMap();
    });
    card.querySelector('[data-action="expand"]').addEventListener("click", () => {
      state.expandedMemoryId = state.expandedMemoryId === memoryId ? null : memoryId;
      renderAll();
    });
  });
}

function renderPopup() {
  const memory = getSelectedMemory();
  if (!memory) {
    elements.popupCard.classList.add("hidden");
    return;
  }

  const isExpanded = state.expandedMemoryId === memory.id;
  elements.popupCard.classList.remove("hidden");
  elements.popupCategory.textContent = memory.category;
  elements.popupPlace.textContent = memory.placeName;
  elements.popupPeriod.textContent = memory.periodLabel;
  elements.popupTitle.textContent = memory.title;
  elements.popupText.innerHTML = (isExpanded ? memory.content : memory.summary).replace(/\n/g, "<br />");
  elements.popupSharer.textContent = `分享者：${memory.sharer}`;
  elements.popupSource.textContent = `來源：${memory.sourceLabel}`;
  elements.popupToggle.textContent = isExpanded ? "收合返回" : "完整內容…";
  elements.popupTags.innerHTML = `
    <span class="category-badge">${memory.category}</span>
    ${memory.hashtags.map((tag) => `<span class="hash-tag">${tag}</span>`).join("")}
  `;

  elements.popupImage.className = memory.imagePath ? "popup-image has-image" : `popup-image tone-${memory.accent}`;
  elements.popupImage.style.backgroundImage = memory.imagePath ? `url('${memory.imagePath}')` : "";
  elements.popupToggle.onclick = () => {
    state.expandedMemoryId = isExpanded ? null : memory.id;
    renderPopup();
    renderMemoryList();
  };
}

function renderLayerOptions() {
  elements.layerOptions.innerHTML = historyLayerOptions
    .map(
      (option) => `
        <button class="layer-option ${state.activeLayerId === option.id ? "is-active" : ""}" data-layer-id="${option.id}" type="button">
          <span class="radio-dot"></span>
          <div class="layer-option-copy">
            <strong>${option.label}</strong>
            <span>${option.title}</span>
          </div>
        </button>
      `
    )
    .join("");

  elements.layerOptions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeLayerId = button.dataset.layerId;
      syncHistoricLayer();
      renderLayerOptions();
    });
  });
}

function filterMemories() {
  state.filteredMemories = state.memories.filter((memory) => {
    const matchType = state.selectedType === "all" || memory.type === state.selectedType;
    const matchVillage = state.selectedVillage === "全部村落" || memory.village === state.selectedVillage;
    const matchEra = state.selectedEra === "全部年代" || memory.decade === state.selectedEra || memory.periodLabel === state.selectedEra;
    const query = state.search.trim().toLowerCase();
    const matchSearch =
      query === "" ||
      [memory.title, memory.summary, memory.placeName, memory.sharer, memory.village, memory.category, ...memory.hashtags].some((field) =>
        field.toLowerCase().includes(query)
      );
    return matchType && matchVillage && matchEra && matchSearch;
  });

  if (!state.filteredMemories.find((memory) => memory.id === state.selectedMemoryId)) {
    state.selectedMemoryId = state.filteredMemories[0]?.id || null;
    state.expandedMemoryId = null;
  }
}

function renderAll() {
  filterMemories();
  renderMemoryList();
  renderPopup();
  renderMainMarkers();
}

function initMainMap() {
  mapboxgl.accessToken = CONFIG.mapboxToken;
  state.mainMap = new mapboxgl.Map({
    container: "main-map",
    style: "mapbox://styles/mapbox/outdoors-v12",
    center: defaultCenter,
    zoom: 10.7,
    pitch: 0
  });

  state.mainMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
  state.mainMap.on("load", () => {
    syncHistoricLayer();
    renderMainMarkers();
  });
}

function syncHistoricLayer() {
  if (!state.mainMap?.isStyleLoaded()) return;
  if (state.mainMap.getLayer(overlayLayerId)) state.mainMap.removeLayer(overlayLayerId);
  if (state.mainMap.getSource(overlaySourceId)) state.mainMap.removeSource(overlaySourceId);

  const activeLayer = historyLayerOptions.find((option) => option.id === state.activeLayerId);
  if (!activeLayer?.tiles) return;

  state.mainMap.addSource(overlaySourceId, {
    type: "raster",
    tiles: activeLayer.tiles,
    tileSize: 256
  });

  state.mainMap.addLayer({
    id: overlayLayerId,
    type: "raster",
    source: overlaySourceId,
    paint: { "raster-opacity": 0.72 }
  });
}

function renderMainMarkers() {
  if (!state.mainMap) return;
  state.mainMarkers.forEach((marker) => marker.remove());
  state.mainMarkers = state.filteredMemories.map((memory) => {
    const markerNode = document.createElement("button");
    markerNode.className = `mapbox-memory-marker ${memory.id === state.selectedMemoryId ? "is-active" : ""}`;
    markerNode.type = "button";
    markerNode.addEventListener("click", () => {
      state.selectedMemoryId = memory.id;
      state.expandedMemoryId = null;
      renderAll();
      focusSelectedMemoryOnMap();
    });

    return new mapboxgl.Marker({ element: markerNode, anchor: "center" }).setLngLat(memory.position).addTo(state.mainMap);
  });
}

function focusSelectedMemoryOnMap() {
  const memory = getSelectedMemory();
  if (memory && state.mainMap) {
    state.mainMap.easeTo({ center: memory.position, duration: 600, zoom: 11.6 });
  }
}

function initPickerMap() {
  state.pickerMap = new mapboxgl.Map({
    container: "picker-map",
    style: "mapbox://styles/mapbox/outdoors-v12",
    center: defaultCenter,
    zoom: 11
  });

  state.pickerMap.on("load", () => {
    state.pickerMarker = new mapboxgl.Marker({ color: "#d96f4b" }).setLngLat(defaultCenter).addTo(state.pickerMap);
  });

  state.pickerMap.on("click", (event) => {
    applyPickerCoords([event.lngLat.lng, event.lngLat.lat], elements.placeInput.value || "手動選點位置");
  });
}

function updatePickerMessage(message) {
  elements.pickerMessage.textContent = message;
}

function renderPickerResults(results) {
  state.pickerResults = results;
  if (!results.length) {
    elements.pickerResults.classList.add("hidden");
    elements.pickerResults.innerHTML = "";
    return;
  }

  elements.pickerResults.classList.remove("hidden");
  elements.pickerResults.innerHTML = results
    .map(
      (result) => `
        <button class="picker-result" data-result-id="${result.id}" type="button">
          <strong>${result.name}</strong>
          <span>${result.subtitle || result.source}</span>
        </button>
      `
    )
    .join("");

  elements.pickerResults.querySelectorAll(".picker-result").forEach((button) => {
    button.addEventListener("click", () => {
      const result = state.pickerResults.find((item) => item.id === button.dataset.resultId);
      if (result) handleSelectResult(result);
    });
  });
}

function applyPickerCoords(center, name) {
  state.pickerCoords = { lng: center[0], lat: center[1] };
  state.pickerMarker?.setLngLat(center);
  state.pickerMap?.flyTo({ center, zoom: 13, duration: 900 });
  if (name && !elements.placeInput.value) {
    elements.placeInput.value = name;
  }
  updatePickerMessage(`目前選點：${state.pickerCoords.lat.toFixed(5)}, ${state.pickerCoords.lng.toFixed(5)}`);
  elements.pickerResults.classList.add("hidden");
}

function dedupeResults(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.name}-${(item.center || []).join(",")}-${item.mapboxId || item.id}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function runPickerSearch() {
  const query = elements.pickerSearchInput.value.trim();
  if (query.length < 1) {
    renderPickerResults([]);
    updatePickerMessage(`目前選點：${state.pickerCoords.lat.toFixed(5)}, ${state.pickerCoords.lng.toFixed(5)}`);
    return;
  }

  updatePickerMessage("搜尋中…");

  const localMatches = localSuggestions
    .filter((item) => [item.name, ...(item.aliases || [])].some((value) => value.toLowerCase().includes(query.toLowerCase())))
    .slice(0, 5)
    .map((item) => ({ ...item, source: "南澳在地字典", subtitle: "南澳在地字典" }));

  const requests = [];

  if (CONFIG.mapboxToken !== "pk.eyJ1IjoiY2hlcnlsaHN1MjIiLCJhIjoiY21vd2U5NTJwMDBlaDQ4cHo2OTNrMmpnbyJ9.ifHh3e3n_B2FZpG9rcHFnw") {
    requests.push(
      fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&language=zh-Hant&country=TW&limit=5&proximity=${state.pickerCoords.lng},${state.pickerCoords.lat}&session_token=${state.sessionToken}&access_token=${CONFIG.mapboxToken}`
      )
        .then((response) => response.json())
        .catch(() => null)
    );
  } else {
    requests.push(Promise.resolve(null));
  }

  if (CONFIG.geoapifyKey !== "9e0958e2acb549e5a66cafbf43d19f6f") {
    requests.push(
      fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&filter=countrycode:tw&bias=proximity:${state.pickerCoords.lng},${state.pickerCoords.lat}&lang=zh&limit=5&apiKey=${CONFIG.geoapifyKey}`
      )
        .then((response) => response.json())
        .catch(() => null)
    );
  } else {
    requests.push(Promise.resolve(null));
  }

  const [mapboxData, geoapifyData] = await Promise.all(requests);

  const mapboxResults = ((mapboxData && mapboxData.suggestions) || []).map((suggestion) => ({
    id: `mapbox-${suggestion.mapbox_id}`,
    name: localizeText(suggestion.name_preferred || suggestion.name),
    subtitle: localizeText(suggestion.place_formatted || suggestion.full_address || suggestion.name),
    source: "Mapbox Search Box",
    mapboxId: suggestion.mapbox_id
  }));

  const geoapifyResults = ((geoapifyData && geoapifyData.features) || []).map((feature, index) => ({
    id: `geoapify-${feature.properties.place_id || index}`,
    name: localizeText(feature.properties.name || feature.properties.formatted),
    subtitle: localizeText(feature.properties.formatted),
    center: feature.geometry?.coordinates,
    source: "Geoapify"
  }));

  const merged = dedupeResults([
    ...localMatches,
    ...mapboxResults,
    ...geoapifyResults.filter((item) => Array.isArray(item.center) && item.center.length === 2)
  ]).slice(0, 8);

  renderPickerResults(merged);
  updatePickerMessage(merged.length ? `找到 ${merged.length} 筆結果，可直接自動定位` : "找不到結果，可改用點地圖選位置");
}

async function handleSelectResult(result) {
  if (result.source === "Mapbox Search Box" && result.mapboxId) {
    const response = await fetch(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${result.mapboxId}?session_token=${state.sessionToken}&access_token=${CONFIG.mapboxToken}`
    ).catch(() => null);
    const data = response ? await response.json() : null;
    const center = data?.features?.[0]?.geometry?.coordinates;
    if (Array.isArray(center) && center.length === 2) {
      applyPickerCoords(center, result.name);
      elements.placeInput.value = result.name;
      state.sessionToken = createSessionToken();
      return;
    }
  }

  if (Array.isArray(result.center) && result.center.length === 2) {
    applyPickerCoords(result.center, result.name);
    elements.placeInput.value = result.name;
    return;
  }

  updatePickerMessage("找不到結果，可改用點地圖選位置");
}

function getFormValues() {
  return {
    title: elements.titleInput.value.trim(),
    placeName: elements.placeInput.value.trim(),
    periodText: elements.periodInput.value.trim(),
    content: elements.contentInput.value.trim(),
    sharerName: elements.sharerInput.value.trim(),
    photo: elements.photoInput.files?.[0] || null
  };
}

async function uploadImage(file) {
  if (!file) return null;
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(16).slice(2)}.${fileExt}`;
  const { error: uploadError } = await state.supabase.storage.from("memory-images").upload(fileName, file);
  if (uploadError) throw uploadError;
  const { data } = state.supabase.storage.from("memory-images").getPublicUrl(fileName);
  return data.publicUrl;
}

function formatSupabaseFailure(stepLabel, error) {
  const message = error?.message || "未知錯誤";

  if (message.includes("Failed to fetch")) {
    return `${stepLabel}失敗：目前網站有成功載入，但連到 Supabase 時沒有拿到回應。通常是 Storage bucket / 資料表權限還沒設好，或瀏覽器把請求擋掉。`;
  }

  return `${stepLabel}失敗：${message}`;
}

async function submitMemory(event) {
  event.preventDefault();

  if (!state.supabase) {
    setFeedback("你還沒把 Supabase 金鑰填進 app.js，所以目前不能投稿。", true);
    return;
  }

  const values = getFormValues();
  if (!values.title || !values.placeName || !values.periodText || !values.content || !values.sharerName) {
    setFeedback("請先把標題、地點、時間、故事內容和分享者填完整。", true);
    return;
  }

  try {
    state.uploading = true;
    elements.submitButton.disabled = true;
    elements.submitButton.textContent = "送出中…";
    clearFeedback();

    let imageUrl = null;
    if (values.photo) {
      try {
        imageUrl = await uploadImage(values.photo);
      } catch (error) {
        setFeedback(formatSupabaseFailure("圖片上傳", error), true);
        return;
      }
    }

    const payload = {
      title: values.title,
      content: values.content,
      place_name: values.placeName,
      latitude: state.pickerCoords.lat,
      longitude: state.pickerCoords.lng,
      period_text: values.periodText,
      sharer_name: values.sharerName,
      category: state.selectedTags[0] || "生活故事",
      tags: [...state.selectedTags, ...state.customTags].map((tag) => tag.replace(/^#/, "")),
      image_url: imageUrl,
      source_label: "民眾投稿",
      status: "pending"
    };

    const { error } = await state.supabase.from("memories").insert(payload);
    if (error) {
      setFeedback(formatSupabaseFailure("資料寫入", error), true);
      return;
    }

    elements.form.reset();
    elements.uploadLabel.textContent = "上傳照片或舊影像";
    state.selectedTags = ["生活故事"];
    state.customTags = [];
    renderCategoryOptions();
    renderCustomTags();
    setFeedback("投稿成功，這筆內容已進入待審核。你在 Supabase 後台通過後，才會顯示到地圖上。");
  } catch (error) {
    setFeedback(formatSupabaseFailure("送出", error), true);
  } finally {
    state.uploading = false;
    elements.submitButton.disabled = false;
    elements.submitButton.textContent = "送出記憶";
  }
}

async function loadApprovedMemories() {
  if (!state.supabase) {
    state.memories = [...seedMemories];
    renderAll();
    return;
  }

  const { data, error } = await state.supabase
    .from("memories")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    state.memories = [...seedMemories];
    renderAll();
    return;
  }

  const remoteMemories = (data || []).map(mapMemoryRow);
  state.memories = remoteMemories.length ? [...seedMemories, ...remoteMemories] : [...seedMemories];
  state.selectedMemoryId = state.memories[0]?.id || null;
  renderAll();
}

function initSupabase() {
  if (!CONFIG.supabaseUrl || !CONFIG.supabasePublishableKey) {
    return null;
  }
  return createClient(CONFIG.supabaseUrl, CONFIG.supabasePublishableKey);
}

function wireEvents() {
  document.querySelectorAll("#type-chip-group .chip").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedType = button.dataset.type;
      document.querySelectorAll("#type-chip-group .chip").forEach((chip) => chip.classList.remove("is-active"));
      button.classList.add("is-active");
      renderAll();
    });
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderAll();
  });
  elements.villageSelect.addEventListener("change", (event) => {
    state.selectedVillage = event.target.value;
    renderAll();
  });
  elements.eraSelect.addEventListener("change", (event) => {
    state.selectedEra = event.target.value;
    renderAll();
  });
  elements.layerToggle.addEventListener("click", () => {
    elements.layerPanel.classList.toggle("hidden");
    elements.layerToggle.classList.toggle("is-active");
  });
  elements.fabButton.addEventListener("click", () => {
    elements.composerPanel.classList.toggle("hidden");
    elements.fabButton.textContent = elements.composerPanel.classList.contains("hidden") ? "＋" : "×";
  });
  elements.closeComposer.addEventListener("click", () => {
    elements.composerPanel.classList.add("hidden");
    elements.fabButton.textContent = "＋";
  });
  elements.addTagButton.addEventListener("click", () => {
    const nextTag = elements.customTagInput.value.trim().replace(/^#/, "");
    if (!nextTag || state.customTags.includes(nextTag)) return;
    state.customTags.push(nextTag);
    state.selectedTags.push(nextTag);
    elements.customTagInput.value = "";
    renderCategoryOptions();
    renderCustomTags();
  });
  elements.photoInput.addEventListener("change", () => {
    const file = elements.photoInput.files?.[0];
    elements.uploadLabel.textContent = file ? file.name : "上傳照片或舊影像";
  });
  elements.pickerSearchButton.addEventListener("click", runPickerSearch);
  elements.pickerSearchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      runPickerSearch();
    }
  });
  elements.pickerLocateButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      updatePickerMessage("這台裝置不支援定位，請改用搜尋或點地圖。");
      return;
    }
    updatePickerMessage("定位中…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center = [position.coords.longitude, position.coords.latitude];
        applyPickerCoords(center, "目前位置");
        updatePickerMessage(`已抓到目前位置：${state.pickerCoords.lat.toFixed(5)}, ${state.pickerCoords.lng.toFixed(5)}`);
      },
      () => {
        updatePickerMessage("定位失敗，請改用搜尋或點地圖。");
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  });
  elements.form.addEventListener("submit", submitMemory);
}

async function init() {
  bindElements();
  populateSelect(elements.villageSelect, villageOptions);
  populateSelect(elements.eraSelect, eraOptions);
  renderCategoryOptions();
  renderCustomTags();
  renderLayerOptions();
  wireEvents();

  if (!CONFIG.mapboxToken) {
    document.querySelector("#main-map").innerHTML = '<div class="empty-state"><strong>還沒設定 Mapbox token</strong><p>先到 app.js 把 CONFIG.mapboxToken 換成你的 token。</p></div>';
    document.querySelector("#picker-map").innerHTML = '<div class="empty-state"><strong>還沒設定 Mapbox token</strong><p>設定後這裡才會出現可選點地圖。</p></div>';
  } else {
    initMainMap();
    initPickerMap();
  }

  state.supabase = initSupabase();
  await loadApprovedMemories();
}

init();
