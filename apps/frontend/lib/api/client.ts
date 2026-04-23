const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/v1";

interface FetchOptions extends RequestInit {
  session?: {
    user?: {
      id?: string;
      role?: string;
    };
  } | null;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { session, ...restOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData =
    typeof FormData !== "undefined" && restOptions.body instanceof FormData;

  const headers: Record<string, string> = {
    ...((restOptions.headers as Record<string, string>) || {}),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (session?.user?.id) {
    headers["x-user-id"] = session.user.id;
  }
  if (session?.user?.role) {
    headers["x-user-role"] = session.user.role;
  }

  let response;
  try {
    response = await fetch(url, {
      ...restOptions,
      headers,
    });
  } catch (err) {
    throw new Error(
      `Failed to fetch ${url}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!response.ok) {
    const rawText = await response.text().catch(() => "");
    let errorData: { message?: string } | null = null;
    if (rawText) {
      try {
        errorData = JSON.parse(rawText);
      } catch {
        errorData = null;
      }
    }
    const proxyFailure =
      typeof rawText === "string" &&
      rawText.toLowerCase().includes("error occurred while trying to proxy");

    throw new Error(
      errorData?.message ||
        (proxyFailure
          ? "Backend API is unavailable. Please start the backend server on port 3001."
          : undefined) ||
        `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
