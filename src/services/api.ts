import { ApiError } from "./errors";
import { getSession } from "./session";

const API_BASE_URL = "/api";
export async function api<T>(
    endpoint: string,
    options?: RequestInit
):Promise<T>{
    const session = getSession();
    const headers = new Headers(options?.headers);

    if (session) {
        headers.set("Authorization", `Bearer ${session.token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new ApiError(response.status, `Request failed with status ${response.status}`);
    }
    return response.json();
}
//i applied this since later the backend is configured, i need only edit this place