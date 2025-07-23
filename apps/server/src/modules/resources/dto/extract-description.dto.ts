export class ExtractDescriptionDto {
  url: string;
}

export class ExtractDescriptionResponseDto {
  description: string;
  success: boolean;
  message?: string;
}
