import React from 'react';

export enum StateEvent {
  GetAddress = 'GetAddress',
  ActivityStats = 'ActivityStats',
  GetTokenPortfolio = 'GetTokenPortfolio',
  GetNftPortfolio = 'GetNftPortfolio',
  GetTokenActivity = 'GetTokenActivity',
  GetNftActivity = 'GetNftActivity',
  GetTalentScore = 'GetTalentScore',
  GetOnchainScore = 'GetOnchainScore',
  GetMultichainData = 'GetMultichainData',
}

export enum BinaryState {
  True = 'True',
  False = 'False',
}

export enum ThreeStageState {
  Idle = 'Idle',
  InProgress = 'InProgress',
  Finished = 'Finished',
}

export type StateOption = BinaryState | ThreeStageState;

export type StateEventRegistry = Partial<Record<StateEvent, StateOption>>;

export interface Toastable<T> {
  toast?: string;
  value: T;
}

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
export type UseState<T> = [T, SetState<T>];
