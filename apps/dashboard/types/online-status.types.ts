export interface OnlineStatusContextType {
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => Promise<boolean>;
  getOnlineCount: () => number;
}
