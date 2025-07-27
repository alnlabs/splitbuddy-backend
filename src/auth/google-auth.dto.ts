import { ApiProperty } from '@nestjs/swagger';

export class GoogleSignupDto {
  @ApiProperty() idToken: string;
  @ApiProperty({ required: false }) firstName?: string;
  @ApiProperty({ required: false }) lastName?: string;
  @ApiProperty({ required: false }) clientId?: string;
  @ApiProperty({ required: false }) appId?: string;
}

export class GoogleLoginDto {
  @ApiProperty() idToken: string;
}

export class GoogleVerifyDto {
  @ApiProperty() idToken: string;
}
