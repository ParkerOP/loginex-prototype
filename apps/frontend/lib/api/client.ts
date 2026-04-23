const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(restOptions.headers as Record<string, string> || {}),
  };

  if (session?.user?.id) {
    headers['x-user-id'] = session.user.id;
  }
  if (session?.user?.role) {
    headers['x-user-role'] = session.user.role;
  }

  const response = await fetch(url, {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API request failed with status ${response.status}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
