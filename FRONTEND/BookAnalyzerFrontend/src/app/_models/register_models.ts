export class RegisterModel {
  public userName: string = '';
  public password: string = '';
  public firstName?: string = '';
  public lastName?: string = '';
}

export interface UserInputDto {
  userName: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
