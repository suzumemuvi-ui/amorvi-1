import { API_BASE_URL } from '../config/api';

export type User = {
  id: string;
  email: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  goals: string[];
  location: {
    latitude: number;
    longitude: number;
  } | null;
  images: string[];
};

export type Post = {
  id: string;
  userId: string;
  images: string[];
  caption: string;
  createdAt: string;
};

class UserService {
  private getAuthHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errorMessage = `Request failed with status ${res.status}`;
      try {
        const data: unknown = await res.json();
        if (
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof (data as { error?: unknown }).error === 'string'
        ) {
          errorMessage = (data as { error: string }).error;
        }
      } catch {
        // Response is not JSON
      }
      throw new Error(errorMessage);
    }
    return (await res.json()) as T;
  }

  async updateProfile(
    token: string,
    data: {
      name?: string;
      age?: number;
      bio?: string;
      interests?: string[];
      goals?: string[];
      images?: string[];
    }
  ): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE_URL}/me/profile`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    return this.handleResponse(res);
  }

  async updateLocation(
    token: string,
    latitude: number,
    longitude: number
  ): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE_URL}/me/location`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ latitude, longitude }),
    });

    return this.handleResponse(res);
  }

  async getCurrentUser(token: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    return this.handleResponse(res);
  }

  async createPost(
    token: string,
    images: string[],
    caption: string
  ): Promise<{ post: Post }> {
    const res = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ images, caption }),
    });

    return this.handleResponse(res);
  }

  async updatePost(
    token: string,
    postId: string,
    caption: string
  ): Promise<{ post: Post }> {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ caption }),
    });

    return this.handleResponse(res);
  }

  async deletePost(token: string, postId: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    return this.handleResponse(res);
  }
}

export const userService = new UserService();
