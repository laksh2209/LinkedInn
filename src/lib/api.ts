const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  title?: string;
  company?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  fullName: string;
  followerCount: number;
  followingCount: number;
  connectionCount: number;
}

export interface AuthResponse {
  success: boolean;
  data: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    token: string;
  };
}

export interface Post {
  _id: string;
  author: User;
  content: string;
  media: string[];
  hashtags: string[];
  mentions: string[];
  likes: Array<{ user: User; _id: string; createdAt: string }>;
  comments: Array<{
    user: string;
    content: string;
    likes: string[];
    replies: any[];
    _id: string;
    createdAt: string;
  }>;
  shares: Array<{ user: User; _id: string; createdAt: string }>;
  isPublic: boolean;
  isEdited: boolean;
  location: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser(): Promise<{ success: boolean; data: User }> {
    return this.request<{ success: boolean; data: User }>('/auth/me');
  }

  // Posts
  async getPosts(page = 1, limit = 10): Promise<{
    success: boolean;
    data: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.request(`/posts?page=${page}&limit=${limit}`);
  }

  async getUserPosts(userId: string, page = 1, limit = 10): Promise<{
    success: boolean;
    data: Post[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.request(`/posts/user/${userId}?page=${page}&limit=${limit}`);
  }

  async createPost(postData: {
    content: string;
    visibility?: string;
    location?: string;
  }): Promise<{ success: boolean; data: Post }> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async likePost(postId: string): Promise<{ success: boolean; message: string; liked: boolean }> {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async addComment(postId: string, content: string): Promise<{ success: boolean; data: any }> {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Users
  async getUserProfile(userId: string): Promise<{ success: boolean; data: User }> {
    return this.request(`/users/${userId}`);
  }

  async searchUsers(query: string): Promise<{ success: boolean; data: User[] }> {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  async followUser(userId: string): Promise<{ success: boolean; message: string; following: boolean }> {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
    });
  }

  async connectWithUser(userId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/users/${userId}/connect`, {
      method: 'POST',
    });
  }

  // Profile
  async updateProfile(profileData: Partial<User>): Promise<{ success: boolean; data: User }> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // File upload methods
  async uploadProfileImage(file: File): Promise<{ success: boolean; data: { profilePicture: string; user: User } }> {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/upload-profile-picture`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload profile image');
    }

    return data;
  }

  async uploadCoverPhoto(file: File): Promise<{ success: boolean; data: { coverPhoto: string; user: User } }> {
    const formData = new FormData();
    formData.append('coverPhoto', file);
    
    const token = this.getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/upload-cover-photo`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload cover photo');
    }

    return data;
  }
}

export const apiService = new ApiService(); 