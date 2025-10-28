export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  birthday: number;
  roles: string[];
  lastLogin: number;
  avatar: string;
  state: string;
  createdAt: number;
  updatedAt: number;
}
