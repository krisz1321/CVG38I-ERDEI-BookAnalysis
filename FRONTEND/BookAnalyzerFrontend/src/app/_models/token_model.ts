export class TokenModel implements TokenDto {
  public expiration: Date = new Date();
  public token: string = '';
}

export interface TokenDto {
  expiration: Date;
  token: string;
}
