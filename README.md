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
- `supabase-reports-setup.sql`
- `assets/gujumu-lin-guizhen.JPG`
- `.github/workflows/deploy-pages.yml`
- `supabase/functions/upload-to-github/index.ts`（照片上傳用的 Edge Function，見下面「照片改存到 GitHub」）

## 你要先做的事

1. 去 `Supabase SQL Editor`
2. 執行 `supabase-review-setup.sql`
3. 再執行一次 `supabase-reports-setup.sql`（這個是「回報修正」功能要用的資料表，只要跑一次）
4. 不要直接把金鑰寫進 `app.js`
5. 選一種你要用的方式

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

## 照片改存到 GitHub（省 Supabase 儲存空間）

族人上傳照片時，現在不是存進 Supabase Storage，而是透過一支 Supabase Edge Function，把照片直接 commit 進這個 GitHub repo 的 `assets/submissions/` 資料夾。GitHub 的金鑰只存在 Supabase 後台的 secret 裡，不會出現在網頁程式碼裡，比較安全。

你要做的設定（只要做一次）：

### 1. 去 GitHub 建一組「只能寫這個 repo」的權限金鑰

1. 打開 https://github.com/settings/personal-access-tokens/new
2. `Token name` 隨便取，例如 `nanao-memory-map-upload`
3. `Expiration` 建議選 90 天或 1 年（到期要記得換新的）
4. `Repository access` 選 `Only select repositories`，選 `memory-map-cowork` 這個 repo，**不要選全部 repo**
5. `Permissions` → `Repository permissions` → 找到 `Contents`，改成 `Read and write`，其他都維持 `No access`
6. 點 `Generate token`，複製那串 `github_pat_` 開頭的金鑰（只會顯示一次，先貼到記事本存好）

### 2. 去 Supabase 建立 Edge Function

1. 打開 Supabase Dashboard → 左側選單 `Edge Functions`
2. 點 `Deploy a new function` → 選 `Via Editor`（不用裝任何工具）
3. Function 名稱填 `upload-to-github`
4. 把 `supabase/functions/upload-to-github/index.ts` 這個檔案的內容整份貼進去
5. 點 `Deploy function`

### 3. 把金鑰存成 Supabase 的 Secret

1. 同樣在 `Edge Functions` 頁面，找 `Secrets`（或 `Manage secrets`）
2. 新增一個 secret：
   - Name：`GITHUB_TOKEN`
   - Value：貼上第 1 步拿到的那串 `github_pat_...`
3. 存檔

設定完，之後族人在網站上傳的照片就會自動出現在 GitHub 的 `assets/submissions/` 資料夾裡，`memories` 表裡的 `image_url` 也會自動指向 GitHub 上的圖片網址，不會再佔用 Supabase Storage 的空間。

如果沒有做這個設定，上傳照片時會顯示錯誤訊息，提醒你去 Supabase 後台補 `GITHUB_TOKEN`。

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

### 第二階段：回報修正

族人可以在地圖彈出卡片上點「回報修正」，針對已經存在的一筆記憶提出修正或補充建議（可勾選標題／地點／時間／內容／照片／其他，加一段文字說明）。這些回報會存到另一張表 `memory_reports`，狀態一樣先是 `pending`。

1. 打開 `Supabase Dashboard` → `Table Editor` → `memory_reports`
2. 看 `memory_title_snapshot` 確認是哪一筆記憶、`fields` 是族人勾的項目、`description` 是說明內容
3. 覺得合理的話，自己去 `memories` 那張表手動修改對應那一筆的內容
4. 改完之後，把這筆 `memory_reports` 的 `status` 改成 `approved`（不合理就改 `rejected`）

`memory_reports` 只是「建議」，不會自動覆蓋 `memories` 裡的資料，一定要你自己確認後手動修改，避免錯誤的回報直接上線。

## 你之後可以改的地方

- `app.js` 裡的 `categoryOptions`
- `localSuggestions`
- `historyLayerOptions`

## 注意

- `Publishable key` 可以放前端
- 不要把 `Secret key` 放進 `app.js`
- `GitHub Pages` 是靜態站，所以後台管理先用 `Supabase Dashboard`
- `config.js` 不要 commit，正式上線時改用 `GitHub Secrets` 自動產生
