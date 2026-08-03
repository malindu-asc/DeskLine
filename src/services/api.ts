const API_BASE_URL = "/api";
export async function api<T>(
    endpoint: string,
    options?: RequestInit
):Promise<T>{
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }
    return response.json();
}
//i applied this since later the backend is configured, i need only edit this place