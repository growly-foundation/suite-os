import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class ExtractDescriptionDto {
  @IsUrl()
  url: string;
}
export class ExtractDescriptionResponseDto {
  @IsString()
  description: string;
  @IsBoolean()
  success: boolean;
  @IsOptional()
  @IsString()
  message?: string;
}
