// 這支 Edge Function 幫忙把族人投稿的照片直接存進 GitHub repo，
// 而不是存進 Supabase Storage，用來省 Supabase 的儲存空間。
//
// GITHUB_TOKEN 是存在 Supabase 的 secret 裡，不會出現在前端程式碼，
// 瀏覽器只會呼叫這支 function，不會直接碰到 GitHub 的金鑰。
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const GITHUB_OWNER = "cherylhsu222";
const GITHUB_REPO = "memory-map-cowork";
const GITHUB_BRANCH = "main";
const UPLOAD_DIR = "assets/submissions";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
  });
}

function guessExtension(mimeType: string) {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/heic": ".heic",
    "image/heif": ".heif"
  };
  return map[mimeType] || "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "只接受 POST 請求" }, 405);
  }

  const token = Deno.env.get("GITHUB_TOKEN");
  if (!token) {
    return jsonResponse({ error: "伺服器還沒設定 GITHUB_TOKEN，請去 Supabase 後台的 Edge Function Secrets 補上" }, 500);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return jsonResponse({ error: "沒有收到照片檔案" }, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return jsonResponse({ error: `不支援的照片格式：${file.type || "未知"}` }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return jsonResponse({ error: "照片太大了，請壓縮到 50MB 以內再試一次" }, 400);
    }

    const originalExtMatch = file.name.match(/\.[a-zA-Z0-9]+$/);
    const ext = originalExtMatch ? originalExtMatch[0].toLowerCase() : guessExtension(file.type);
    const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`;
    const path = `${UPLOAD_DIR}/${safeName}`;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64Content = encodeBase64(bytes);

    const githubResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "nanao-memory-map-upload"
        },
        body: JSON.stringify({
          message: `Add submitted photo: ${safeName}`,
          content: base64Content,
          branch: GITHUB_BRANCH
        })
      }
    );

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text();
      console.error("GitHub commit failed", githubResponse.status, errorText);
      return jsonResponse({ error: "上傳到 GitHub 失敗，請稍後再試一次" }, 502);
    }

    const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
    return jsonResponse({ url });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: "上傳失敗，請稍後再試一次" }, 500);
  }
});
