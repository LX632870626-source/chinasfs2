import Taro from "@tarojs/taro";

declare const process: {
  env: {
    TARO_APP_API_BASE?: string;
  };
};

// Taro exposes TARO_APP_* env values at build time.
const API_BASE = process.env.TARO_APP_API_BASE?.trim() || "http://127.0.0.1:4000";

function assertOk(statusCode: number, path: string) {
  if (statusCode >= 400) {
    throw new Error(`Public request failed for ${path}: ${statusCode}`);
  }
}

export async function publicGet<T>(path: string): Promise<T> {
  const response = await Taro.request<T>({
    url: `${API_BASE}/api/public${path}`,
    method: "GET"
  });

  assertOk(response.statusCode, path);
  return response.data;
}

export async function publicPost<T>(path: string, data: unknown): Promise<T> {
  const response = await Taro.request<T>({
    url: `${API_BASE}/api/public${path}`,
    method: "POST",
    data,
    header: { "content-type": "application/json" }
  });

  assertOk(response.statusCode, path);
  return response.data;
}
