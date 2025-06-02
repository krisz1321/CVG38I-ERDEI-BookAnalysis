export class LoginModel implements LoginDto {
  public userName: string = '';
  public password: string = '';
}

export interface LoginDto {
  userName: string;
  password: string;
}

export interface UserInputDto {
  userName: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UserViewDto {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}
