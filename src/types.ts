export type LookupType = 'mobile' | 'adhar' | 'upi' | 'vehicle' | 'pan' | 'domain' | 'ifsc' | 'instagram' | string;

export interface BotConfig {
  botToken: string;
  apiKey: string;
  apiUrl: string;
  autoStartPolling: boolean;
  welcomeMessage: string;
  autoReplyEnabled?: boolean;
  autoReplyMessage?: string;
  botUsername?: string;
  botFirstName?: string;
  isPollingActive: boolean;
  webhookUrl?: string;
  maintenanceMode?: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
}

export interface LookupRequest {
  type: LookupType;
  term: string;
}

export interface LookupResponse {
  status: boolean;
  type: LookupType;
  term: string;
  data: Record<string, any>;
  rawJson: any;
  source: 'api' | 'demo';
  statusCode?: number;
  message?: string;
  timestamp: string;
}

export interface BotLogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'lookup' | 'error' | 'bot_event' | 'broadcast' | 'admin';
  message: string;
  details?: any;
}

export interface ChatSession {
  chatId: number;
  username?: string;
  firstName?: string;
  state: string;
  lastType?: LookupType;
  lastTerm?: string;
  updatedAt: string;
}

export interface SimulatedInlineButton {
  text: string;
  callbackData: string;
}

export interface SimulatedMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  buttons?: SimulatedInlineButton[][];
  jsonResult?: any;
  timestamp: string;
  type?: LookupType;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers24h: number;
  blockedUsersCount: number;
  totalGroups: number;
  messagesToday: number;
  totalApiRequests: number;
  creditsUsedToday: number;
  creditsRemainingTotal: number;
  totalLookups: number;
  mobileCount: number;
  adharCount: number;
  upiCount: number;
  ifscCount: number;
  instagramCount: number;
  totalLogs: number;
  isPolling: boolean;
  botInfo: {
    username?: string;
    first_name?: string;
    id?: number;
    can_join_groups?: boolean;
    can_read_all_group_messages?: boolean;
    supports_inline_queries?: boolean;
  } | null;
}

// Admin Panel Specific Types

export interface TelegramUser {
  id: string;
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  languageCode?: string;
  isPremium: boolean;
  isBlocked: boolean;
  isWatched: boolean;
  joinedAt: string;
  lastActive: string;
  credits: number;
  totalLookupsPerformed: number;
  referralCode?: string;
  referredBy?: string;
  referralsCount: number;
  adminNotes?: string;
  avatarUrl?: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  telegramId: number;
  actionType: 'command' | 'lookup' | 'broadcast_received' | 'credit_update' | 'block_toggle';
  commandName?: string;
  searchTerm?: string;
  lookupType?: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  details?: string;
}

export interface TelegramGroup {
  id: string;
  groupId: number;
  title: string;
  username?: string;
  membersCount: number;
  botPermissions: {
    canDeleteMessages: boolean;
    canRestrictMembers: boolean;
    canPromoteMembers: boolean;
    canChangeInfo: boolean;
    canInviteUsers: boolean;
    canPinMessages: boolean;
  };
  inviteLink?: string;
  createdAt: string;
  lastActive: string;
  isMuted: boolean;
  messagesHandledCount: number;
  recentMessages?: Array<{
    id: string;
    senderName: string;
    text: string;
    timestamp: string;
  }>;
}

export type BroadcastMediaType = 
  | 'text'
  | 'photo'
  | 'video'
  | 'voice'
  | 'audio'
  | 'sticker'
  | 'animation'
  | 'document'
  | 'location'
  | 'poll';

export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callbackData?: string;
}

export interface BroadcastCampaign {
  id: string;
  title: string;
  targetType: 'dm' | 'groups' | 'filtered';
  mediaType: BroadcastMediaType;
  content: string;
  mediaUrl?: string;
  parseMode: 'HTML' | 'MarkdownV2' | 'None';
  buttons?: InlineKeyboardButton[][];
  scheduledFor?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'paused';
  createdAt: string;
  completedAt?: string;
  stats: {
    totalRecipients: number;
    sentCount: number;
    failedCount: number;
    pendingCount: number;
    progressPercentage: number;
  };
  failedUserIds?: number[];
}

export interface ModulePermission {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  allowedRoles: string[];
  maxDailyQuota?: number;
}

export interface ApiKeyConfig {
  id: string;
  name: string;
  key: string;
  service: string;
  status: 'active' | 'rate_limited' | 'disabled';
  usageToday: number;
  limitPerDay: number;
}

export interface PlanConfig {
  id: string;
  name: string;
  priceINR: number;
  dailyCredits: number;
  maxGroups: number;
  allowedLookupTypes: string[];
  supportRichMessages: boolean;
  isPopular?: boolean;
}

export interface DailyMetric {
  date: string;
  usersCount: number;
  lookupsCount: number;
  broadcastsCount: number;
  creditsUsed: number;
}

export interface CommandUsageMetric {
  command: string;
  type: string;
  count: number;
  percentage: number;
}

export interface ServerUsageMetric {
  cpuUsage: number;
  memoryUsage: number;
  uptimeSeconds: number;
  activeWebsockets: number;
  apiLatencyMs: number;
}

export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Moderator' | 'Support';
  lastLogin: string;
  avatar: string;
  isOnline: boolean;
}

export interface TelegramChatMessage {
  id: string;
  telegramMessageId?: number;
  chatId: number;
  sender: 'bot' | 'user';
  senderName: string;
  senderAvatar?: string;
  senderUsername?: string;
  text: string;
  mediaType?: 'photo' | 'video' | 'voice' | 'audio' | 'document' | 'sticker' | 'animation' | 'poll' | 'location';
  mediaUrl?: string;
  mediaFileName?: string;
  mediaCaption?: string;
  buttons?: InlineKeyboardButton[][];
  replyToMessage?: {
    id: string;
    senderName: string;
    text: string;
  };
  forwardFrom?: {
    senderName: string;
  };
  pollDetails?: {
    question: string;
    options: string[];
  };
  locationDetails?: {
    latitude: number;
    longitude: number;
    title?: string;
  };
  status?: 'sending' | 'sent' | 'failed' | 'delivered';
  timestamp: string;
  isPinned?: boolean;
}

export interface TelegramChatConversation {
  chatId: number;
  id: string;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  memberCount?: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  timestamp: string;
}

export interface AnalyticsData {
  dailyUsersGrowth: DailyMetric[];
  broadcastStats: {
    totalSent: number;
    successRatePercent: number;
    failedCount: number;
  };
  topCommands: CommandUsageMetric[];
  serverMetrics: {
    cpuUsage: number;
    memoryUsageMB: number;
    avgLatencyMs: number;
    uptimeDays: number;
  };
}

export interface SystemConfig {
  botToken: string;
  webhookUrl?: string;
  botUsername?: string;
  isPollingActive: boolean;
  maintenanceMode?: boolean;
}


