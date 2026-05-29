# 南澳記憶庫 GitHub Pages 版

這一版是給 `GitHub Pages` 用的靜態網站，但保留了：

- 真 `Mapbox` 地圖
- 歷史年代圖層
- `Supabase` 投稿
- 投稿先進 `pending`，你審核後才公開

## 檔案

- `index.html`
- `style.css`
- `app.js`
- `config.example.js`
- `supabase-review-setup.sql`
- `assets/gujumu-lin-guizhen.JPG`
- `.github/workflows/deploy-pages.yml`

## 你要先做的事

1. 去 `Supabase SQL Editor`
2. 執行 `supabase-review-setup.sql`
3. 不要直接把金鑰寫進 `app.js`
4. 選一種你要用的方式

## 方式 1：本機測試用

1. 複製 `config.example.js`
2. 改名成 `config.js`
3. 把裡面的 4 個值換成你的

要填的是：

- `mapboxToken`
- `geoapifyKey`
- `supabaseUrl`
- `supabasePublishableKey`

因為 `.gitignore` 已經排除 `config.js`，所以這份不會被你不小心 commit 上去。

## 方式 2：正式上 GitHub Pages

這一版已經附好：

- `.github/workflows/deploy-pages.yml`

正式上線時，不要把 `config.js` 上傳到 GitHub。
改成在 GitHub repo 裡設定 `Secrets`，部署時會自動生出 `config.js`。

你要新增這 4 個 `Repository secrets`：

- `MAPBOX_TOKEN`
- `GEOAPIFY_KEY`
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

## GitHub Pages 上架方式

把這個資料夾裡的內容放進 GitHub repo 根目錄：

- `index.html`
- `style.css`
- `app.js`
- `config.example.js`
- `assets/`
- `.github/`
- `.nojekyll`

然後到 GitHub：

1. `Settings`
2. `Secrets and variables` → `Actions`
3. 新增上面那 4 個 secrets
4. `Settings` → `Pages`
5. `Source` 選 `GitHub Actions`
6. 回到 repo 的 `Actions` 頁面
7. 讓 `Deploy GitHub Pages` 跑完

幾分鐘後就會有網址。

## 你怎麼審核投稿

### 第一階段：直接用 Supabase 後台

1. 打開 `Supabase Dashboard`
2. 點 `Table Editor`
3. 點 `memories`
4. 新投稿會先是 `status = pending`
5. 你看完內容後：
   - 要公開：改成 `approved`
   - 不公開：改成 `rejected`

只要你改成 `approved`，這篇就會出現在網站的地圖和文章列表。

## 你之後可以改的地方

- `app.js` 裡的 `categoryOptions`
- `localSuggestions`
- `historyLayerOptions`

## 注意

- `Publishable key` 可以放前端
- 不要把 `Secret key` 放進 `app.js`
- `GitHub Pages` 是靜態站，所以後台管理先用 `Supabase Dashboard`
- `config.js` 不要 commit，正式上線時改用 `GitHub Secrets` 自動產生
