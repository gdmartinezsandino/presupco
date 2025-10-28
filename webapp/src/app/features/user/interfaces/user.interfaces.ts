export interface User {
  id: string;
  name: string;
  email: string;
  birthday: Date;
  roles: string[];
  lastLogin: Date;
  avatar: string;
  state: string;
  createdAt: Date;
  updatedAt: Date;
}
