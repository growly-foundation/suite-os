export interface CafeFInterestRate {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  interestRates: InterestRate[];
}

export interface CafeFExchangeRate {
  id: string;
  currencyName: string;
  name: string;
  buyCash: number | null;
  buyCashStatus: number | null;
  purchaseTransfer: number;
  purchaseTransferStatus: number;
  price: number;
  priceStatus: number;
  buyCashStatusPercent: number | null;
  purchaseTransferStatusPercent: number;
  priceStatusPercent: number;
  timeSpinString: string;
  timeSpin: number;
  updatedAt: string; // Format "/Date(1745424969600)/"
  createdAt: string; // Format "/Date(1745424969600)/"
  tagType: string;
  index: number;
  stt: number;
  bank: string;
  classify: string;
}

export interface CafeFGoldPrice {
  goldPriceWorlds: GoldPriceWorlds;
  goldPriceWorldHistories: GoldPriceWorldHistory[];
}

export interface GoldPriceWorldHistory {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  createdAt: Date;
}

export interface GoldPriceWorlds {
  id: string;
  name: string;
  price: number;
  changePrice: number;
  changePricePercent: number;
  rate: number;
  goldPriceWorldVND: number;
  lastUpdate: Date;
}

export interface InterestRate {
  deposit: number;
  value: number | null;
}
