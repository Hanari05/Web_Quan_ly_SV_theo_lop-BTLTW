export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5007/api').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(message, status = 0, details = []) {
    super(message); this.name = 'ApiError'; this.status = status; this.details = details;
    this.fields = Object.fromEntries(details.filter(item => item && typeof item === 'object' && item.field).map(item => [item.field, item.message]));
  }
}
export async function request(path, options = {}) {
  const { headers, ...rest } = options;
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...rest, headers: { ...(rest.body ? { 'Content-Type': 'application/json' } : {}), ...headers } });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Không thể kết nối máy chủ. Vui lòng kiểm tra backend và thử lại.');
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || 'Yêu cầu không thành công.', response.status, data.details || []);
  }
  return response;
}
export async function api(path, options = {}) {
  const response = await request(path, options);
  return response.status === 204 ? null : response.json();
}
export function queryString(values) {
  return new URLSearchParams(Object.entries(values).filter(([, value]) => value !== '' && value !== undefined && value !== null)).toString();
}
