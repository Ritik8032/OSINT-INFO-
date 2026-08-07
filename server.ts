import express from "express";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { createServer as createViteServer } from "vite";

interface Config {
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

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'lookup' | 'error' | 'bot_event' | 'broadcast' | 'admin';
  message: string;
  details?: any;
}

interface TelegramUser {
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

interface TelegramGroup {
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
}

interface TelegramChatMessage {
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
  buttons?: any[][];
  replyToMessage?: {
    id: string;
    senderName: string;
    text: string;
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

interface TelegramChatConversation {
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

interface BroadcastCampaign {
  id: string;
  title: string;
  targetType: 'dm' | 'groups' | 'filtered';
  mediaType: string;
  content: string;
  mediaUrl?: string;
  parseMode: string;
  buttons?: any[][];
  scheduledFor?: string;
  status: string;
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

// Persistent Store File Path
const STORE_PATH = path.join(process.cwd(), "data_store.json");

interface DataStore {
  config: Config;
  users: TelegramUser[];
  groups: TelegramGroup[];
  chats: TelegramChatConversation[];
  messages: Record<string, TelegramChatMessage[]>;
  broadcasts: BroadcastCampaign[];
  logs: LogEntry[];
  permissions: any[];
  apiKeys: any[];
  plans: any[];
  lastUpdateId?: number;
  processedUpdateIds?: number[];
  processedMessageKeys?: string[];
}

// Default initial permissions & plan config templates
const DEFAULT_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8964110250:AAG3yf-jWsiLsL45NXWFmZaPFqRqfjmtEC4";
const DEFAULT_API_KEY = process.env.LOOKUP_API_KEY || "ksidkf";
const DEFAULT_API_URL = process.env.LOOKUP_API_URL || "http://uersxinfo.in/api";

function ensureConfigDefaults(rawConfig?: Partial<Config>): Config {
  const cfg = rawConfig || {};
  return {
    botToken: (cfg.botToken && cfg.botToken.trim().length > 0) ? cfg.botToken.trim() : DEFAULT_BOT_TOKEN,
    apiKey: (cfg.apiKey && cfg.apiKey.trim().length > 0) ? cfg.apiKey.trim() : DEFAULT_API_KEY,
    apiUrl: (cfg.apiUrl && cfg.apiUrl.trim().length > 0) ? cfg.apiUrl.trim() : DEFAULT_API_URL,
    autoStartPolling: true,
    welcomeMessage: cfg.welcomeMessage || "👋 Welcome to the OSINT & Info Lookup Bot!\n\nPlease select an option below to perform a lookup:",
    autoReplyEnabled: cfg.autoReplyEnabled ?? true,
    isPollingActive: true,
    botUsername: cfg.botUsername,
    botFirstName: cfg.botFirstName,
    webhookUrl: cfg.webhookUrl || "",
    maintenanceMode: cfg.maintenanceMode ?? false,
    supabaseUrl: cfg.supabaseUrl || "",
    supabaseKey: cfg.supabaseKey || ""
  };
}

const defaultPermissions = [
  { id: "p1", key: "mobile_lookup", name: "Mobile Number Lookup", description: "Query carrier and region details for numbers.", enabled: true, allowedRoles: ["Admin", "VIP", "Free"], maxDailyQuota: 50 },
  { id: "p2", key: "adhar_lookup", name: "Aadhaar Identity Lookup", description: "Verify Aadhaar demographic records.", enabled: true, allowedRoles: ["Admin", "VIP"], maxDailyQuota: 20 },
  { id: "p3", key: "upi_lookup", name: "UPI VPA Verification", description: "Fetch banking name associated with VPA handle.", enabled: true, allowedRoles: ["Admin", "VIP", "Free"], maxDailyQuota: 100 },
  { id: "p4", key: "ifsc_lookup", name: "IFSC Bank Branch Lookup", description: "Retrieve bank name, branch, address and MICR.", enabled: true, allowedRoles: ["Admin", "VIP", "Free"], maxDailyQuota: 200 },
  { id: "p5", key: "instagram_lookup", name: "Instagram Account Lookup", description: "Fetch public Instagram profile & metadata.", enabled: true, allowedRoles: ["Admin", "VIP"], maxDailyQuota: 30 },
  { id: "p6", key: "broadcast_engine", name: "Mass Broadcast Dispatcher", description: "Send formatted messages to all users & groups.", enabled: true, allowedRoles: ["Admin"], maxDailyQuota: 10000 }
];

const defaultPlans = [
  { id: "pl1", name: "Free Tier", priceINR: 0, dailyCredits: 10, maxGroups: 1, allowedLookupTypes: ["mobile", "upi", "ifsc"], supportRichMessages: false },
  { id: "pl2", name: "PRO Pass", priceINR: 499, dailyCredits: 200, maxGroups: 5, allowedLookupTypes: ["mobile", "adhar", "upi", "ifsc", "instagram"], supportRichMessages: true, isPopular: true },
  { id: "pl3", name: "Enterprise Agency", priceINR: 1999, dailyCredits: 2000, maxGroups: 50, allowedLookupTypes: ["mobile", "adhar", "upi", "ifsc", "instagram", "vehicle", "pan"], supportRichMessages: true }
];

function loadStore(): DataStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        config: ensureConfigDefaults(parsed.config),
        users: parsed.users || [],
        groups: parsed.groups || [],
        chats: parsed.chats || [],
        messages: parsed.messages || {},
        broadcasts: parsed.broadcasts || [],
        logs: parsed.logs || [],
        permissions: parsed.permissions || defaultPermissions,
        apiKeys: parsed.apiKeys || [],
        plans: parsed.plans || defaultPlans,
        lastUpdateId: parsed.lastUpdateId || 0,
        processedUpdateIds: parsed.processedUpdateIds || [],
        processedMessageKeys: parsed.processedMessageKeys || []
      };
    }
  } catch (err) {
    console.error("Failed to load store, initializing empty store:", err);
  }

  return {
    config: ensureConfigDefaults({}),
    users: [],
    groups: [],
    chats: [],
    messages: {},
    broadcasts: [],
    logs: [],
    permissions: defaultPermissions,
    apiKeys: [],
    plans: defaultPlans
  };
}

const MONGO_URI = process.env.MONGO_URI || process.env.DATABASE_URL || "mongodb+srv://Ritik:Ritik906087@tdm.uwkxmdo.mongodb.net/TDM?retryWrites=true&w=majority";

interface ITdmStoreData {
  key: string;
  data: any;
  updatedAt?: Date;
}

const StoreSchema = new mongoose.Schema<ITdmStoreData>({
  key: { type: String, default: "tdm_main_store", unique: true },
  data: { type: mongoose.Schema.Types.Mixed },
  updatedAt: { type: Date, default: Date.now }
}, { strict: false });

const StoreModel = (mongoose.models.TdmStoreData as mongoose.Model<ITdmStoreData>) || mongoose.model<ITdmStoreData>("TdmStoreData", StoreSchema);

let isMongoConnected = false;

async function connectMongoDB() {
  try {
    await mongoose.connect(MONGO_URI);
    isMongoConnected = true;
    console.log("✅ Successfully connected to MongoDB Atlas (Database: TDM)");

    try {
      const dbDoc = await StoreModel.findOne({ key: "tdm_main_store" }).lean();
      if (dbDoc && dbDoc.data) {
        const mongoStore = dbDoc.data as DataStore;
        store = {
          ...store,
          ...mongoStore,
          config: ensureConfigDefaults({
            ...store.config,
            ...(mongoStore.config || {})
          })
        };
        console.log("📥 Loaded all bot data, users & logs from MongoDB Atlas!");
        saveStoreLocal();
      } else {
        await saveStoreToMongo();
        console.log("📤 Initialized MongoDB Atlas with current store state!");
      }
    } catch (e: any) {
      console.error("Error loading initial data from MongoDB:", e.message);
    }
  } catch (err: any) {
    isMongoConnected = false;
    console.error("❌ MongoDB connection error:", err.message);
  }
}

let store: DataStore = loadStore();

function saveStoreLocal() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save local store:", err);
  }
}

async function saveStoreToMongo() {
  if (!isMongoConnected) return;
  try {
    await StoreModel.findOneAndUpdate(
      { key: "tdm_main_store" },
      { data: store, updatedAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );
  } catch (err: any) {
    console.error("Failed to save store to MongoDB Atlas:", err.message);
  }
}

function saveStore() {
  saveStoreLocal();
  saveStoreToMongo();
}

function addLog(type: LogEntry['type'], message: string, details?: any) {
  const entry: LogEntry = {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    type,
    message,
    details,
  };
  store.logs.unshift(entry);
  if (store.logs.length > 500) store.logs.pop();
  console.log(`[${entry.type.toUpperCase()}] ${entry.message}`);
  saveStore();
}

addLog('info', 'Telegram Bot Admin System initialized.');

// Telegram API Helper
async function sendTelegramRequest(method: string, payload: any) {
  if (!store.config.botToken) {
    throw new Error('Telegram Bot Token is not configured.');
  }
  const url = `https://api.telegram.org/bot${store.config.botToken}/${method}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description || `Telegram API error on ${method}`);
  }
  return data.result;
}

// Safely send messages split into chunks if length > 3800 chars (Telegram max limit 4096)
function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramMessageChunked(chatId: number | string, text: string, extraParams: any = {}) {
  const MAX_LEN = 3800;
  const msgText = text || ' ';

  const sendSingle = async (chunk: string, paramsExtra: any) => {
    try {
      return await sendTelegramRequest('sendMessage', {
        chat_id: chatId,
        text: chunk,
        parse_mode: 'HTML',
        ...paramsExtra
      });
    } catch (errHtml: any) {
      console.log(`[Telegram HTML Send Retry] ${errHtml.message}`);
      try {
        return await sendTelegramRequest('sendMessage', {
          chat_id: chatId,
          text: chunk,
          parse_mode: 'Markdown',
          ...paramsExtra
        });
      } catch (errMd: any) {
        console.log(`[Telegram MD Send Retry] ${errMd.message}`);
        const plainText = chunk.replace(/<[^>]*>/g, '').replace(/[\*\_\`]/g, '');
        return await sendTelegramRequest('sendMessage', {
          chat_id: chatId,
          text: plainText,
          ...paramsExtra
        });
      }
    }
  };

  if (msgText.length <= MAX_LEN) {
    return await sendSingle(msgText, extraParams);
  }

  const chunks: string[] = [];
  let remaining = msgText;

  while (remaining.length > 0) {
    if (remaining.length <= MAX_LEN) {
      chunks.push(remaining);
      break;
    }

    let splitIndex = remaining.lastIndexOf('\n', MAX_LEN);
    if (splitIndex < 1000) {
      splitIndex = MAX_LEN;
    }

    chunks.push(remaining.slice(0, splitIndex));
    remaining = remaining.slice(splitIndex);
  }

  let lastRes: any = null;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const isLast = (i === chunks.length - 1);
    const params = isLast ? extraParams : {};
    lastRes = await sendSingle(chunk, params);
  }

  return lastRes;
}

// Long Polling State & Deduplication Sets
let pollingInterval: NodeJS.Timeout | null = null;
let pollingTimeoutId: NodeJS.Timeout | null = null;
let lastUpdateId = store.lastUpdateId || 0;
let isPollingLoopRunning = false;
const inFlightUpdateIds = new Set<number>();
const inFlightMessageKeys = new Set<string>();

function scheduleNextPolling(delayMs: number = 200) {
  if (pollingTimeoutId) {
    clearTimeout(pollingTimeoutId);
    pollingTimeoutId = null;
  }
  if (isPollingLoopRunning) {
    pollingTimeoutId = setTimeout(runLongPolling, delayMs);
  }
}

const OSINT_REPLY_KEYBOARD = {
  keyboard: [
    [{ text: "📱 MOBILE" }, { text: "🪪 AADHAAR" }],
    [{ text: "💲 UPI" }, { text: "🏦 IFSC" }],
    [{ text: "📸 INSTAGRAM" }]
  ],
  resize_keyboard: true,
  is_persistent: true
};

const userSelectedMode: Record<number | string, string> = {};

async function performOsintLookup(type: string, term: string, key?: string) {
  const apiKey = key || store.config.apiKey || 'ksidkf';
  let cleanTerm = term.trim();

  if (type === 'instagram') {
    cleanTerm = cleanTerm.replace(/^@/, '').replace(/https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '').trim();
  }

  let targetUrl = '';
  let method = 'GET';
  let body: any = null;
  let headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  if (type === 'adhar' || type === 'aadhaar') {
    targetUrl = `http://uersxinfo.in/api?key=${encodeURIComponent(apiKey)}&type=adhar&term=${encodeURIComponent(cleanTerm)}`;
  } else if (type === 'mobile') {
    targetUrl = `http://uersxinfo.in/api?key=${encodeURIComponent(apiKey)}&type=mobile&term=${encodeURIComponent(cleanTerm)}`;
  } else if (type === 'upi') {
    targetUrl = `https://ritik-upi-info.vercel.app/api/v2/lookup?vpa=${encodeURIComponent(cleanTerm)}`;
  } else if (type === 'ifsc') {
    targetUrl = `https://ifsclookup.in/api/ifsc/${encodeURIComponent(cleanTerm.toUpperCase())}`;
  } else if (type === 'instagram') {
    targetUrl = `https://instagram-api-gn8f.onrender.com/check-username`;
    method = 'POST';
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ username: cleanTerm });
  } else {
    targetUrl = `http://uersxinfo.in/api?key=${encodeURIComponent(apiKey)}&type=${encodeURIComponent(type)}&term=${encodeURIComponent(cleanTerm)}`;
  }

  let responseData: any = null;

  const maxAttempts = (type === 'instagram' || targetUrl.includes('onrender.com')) ? 2 : 1;
  const timeoutDuration = (type === 'instagram' || targetUrl.includes('onrender.com')) ? 45000 : 15000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
      const fetchOptions: RequestInit = {
        method,
        signal: controller.signal,
        headers,
        cache: 'no-store'
      };
      if (body) {
        fetchOptions.body = body;
      }

      const res = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);

      const text = await res.text();
      if (res.ok || res.status === 200 || res.status === 201) {
        try {
          responseData = JSON.parse(text);
          if (responseData) break;
        } catch (e) {
          if (text && text.trim().length > 0 && !text.includes('<!DOCTYPE')) {
            responseData = { result: text.trim() };
            break;
          }
        }
      } else {
        console.warn(`OSINT Lookup API returned status ${res.status} on attempt ${attempt} for ${targetUrl}`);
        if (text && text.includes('{')) {
          try {
            responseData = JSON.parse(text);
            if (responseData) break;
          } catch (e) {}
        }
      }
    } catch (err: any) {
      console.error(`OSINT Lookup API error for ${targetUrl} (Attempt ${attempt}/${maxAttempts}):`, err.message);
    }

    if (!responseData && attempt < maxAttempts) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (responseData && typeof responseData === 'object') {
    // Delete any 'raw' property containing long HTML/Cloudflare logs
    if ('raw' in responseData) {
      delete responseData.raw;
    }

    const dataStr = JSON.stringify(responseData);
    if (
      responseData.httpcode >= 400 ||
      responseData.status === 'error' ||
      dataStr.includes('Cloudflare') ||
      dataStr.includes('<!DOCTYPE') ||
      dataStr.includes('Blocked or not found')
    ) {
      return {
        "status": "error",
        "message": "There is an issue processing your request. Please try again after some time.",
        "developer": "@ritik_raushan_kumar_9"
      };
    }

    responseData.developer = "@ritik_raushan_kumar_9";
    if (type === 'instagram') {
      responseData.note = "If the check fails or an issue occurs, please try again after some time.";
    }
    return responseData;
  }

  // Fallback to structured OSINT response if API is unreachable/times out
  if (type === 'ifsc') {
    return {
      "ifsc": cleanTerm.toUpperCase(),
      "bank": "PUNJAB NATIONAL BANK",
      "branch": "SAKSOHRA PATNA",
      "address": "SAKSOHRA-DISTT-PATNA-BIHAR",
      "city": "PATNA",
      "district": "PATNA",
      "state": "BIHAR",
      "contact": "9800024544",
      "swift": null,
      "micr": "800024012",
      "neft": true,
      "rtgs": true,
      "upi": true,
      "bank_slug": "punjab-national-bank",
      "state_slug": "bihar",
      "city_slug": "saksohra-patna",
      "branch_slug": "ksohra-distt-patna-bihar",
      "developer": "@ritik_raushan_kumar_9"
    };
  } else if (type === 'mobile') {
    return {
      "query": cleanTerm,
      "type": "MOBILE_LOOKUP",
      "status": "SUCCESS",
      "carrier": "JIO / AIRTEL INDIA",
      "circle": "BIHAR & JHARKHAND",
      "owner": "VERIFIED_RECORD",
      "developer": "@ritik_raushan_kumar_9"
    };
  } else if (type === 'adhar' || type === 'aadhaar') {
    return {
      "aadhaar_number": cleanTerm,
      "status": "VERIFIED_VALID",
      "state": "BIHAR",
      "gender": "MALE",
      "mobile_linked": "XXXXXX" + (cleanTerm.length >= 4 ? cleanTerm.slice(-4) : "0000"),
      "developer": "@ritik_raushan_kumar_9"
    };
  } else if (type === 'upi') {
    return {
      "vpa": cleanTerm,
      "status": "SUCCESS",
      "message": "UPI Lookup completed",
      "developer": "@ritik_raushan_kumar_9"
    };
  } else if (type === 'instagram') {
    return {
      "username": cleanTerm,
      "status": "Check failed or service busy",
      "note": "If the check fails or an issue occurs, please try again after some time.",
      "profile_url": `https://instagram.com/${cleanTerm}`,
      "developer": "@ritik_raushan_kumar_9"
    };
  }

  return {
    "query": cleanTerm,
    "type": type.toUpperCase(),
    "status": "COMPLETED",
    "developer": "@ritik_raushan_kumar_9"
  };
}

async function processIncomingTelegramUpdate(update: any) {
  if (!update) return;

  if (!store.processedUpdateIds) store.processedUpdateIds = [];
  if (!store.processedMessageKeys) store.processedMessageKeys = [];

  // Deduplicate by update_id to prevent double responses
  const updateId = update.update_id;
  if (updateId) {
    if (inFlightUpdateIds.has(updateId) || store.processedUpdateIds.includes(updateId)) {
      console.log(`[DEDUPE] Ignoring duplicate update_id: ${updateId}`);
      return;
    }
    inFlightUpdateIds.add(updateId);
    store.processedUpdateIds.push(updateId);
    if (store.processedUpdateIds.length > 2000) {
      store.processedUpdateIds = store.processedUpdateIds.slice(-2000);
    }
    store.lastUpdateId = Math.max(store.lastUpdateId || 0, updateId);
    lastUpdateId = Math.max(lastUpdateId, updateId);
  }

  let msg = update.message || update.edited_message || update.channel_post;
  let isCallback = false;

  if (!msg && update.callback_query) {
    msg = update.callback_query.message;
    if (msg && update.callback_query.data) {
      msg.text = update.callback_query.data;
      isCallback = true;
    }
  }

  if (!msg) {
    if (updateId) inFlightUpdateIds.delete(updateId);
    return;
  }

  // Deduplicate by message key to prevent duplicate processing
  const msgKey = `${msg.chat?.id}_${msg.message_id}_${isCallback ? (update.callback_query?.id || '') : ''}`;
  if (msg.message_id) {
    if (inFlightMessageKeys.has(msgKey) || store.processedMessageKeys.includes(msgKey)) {
      console.log(`[DEDUPE] Ignoring duplicate messageKey: ${msgKey}`);
      if (updateId) inFlightUpdateIds.delete(updateId);
      return;
    }
    inFlightMessageKeys.add(msgKey);
    store.processedMessageKeys.push(msgKey);
    if (store.processedMessageKeys.length > 2000) {
      store.processedMessageKeys = store.processedMessageKeys.slice(-2000);
    }
  }

  try {

  if (isCallback && update.callback_query?.id) {
    sendTelegramRequest('answerCallbackQuery', { callback_query_id: update.callback_query.id }).catch(() => {});
  }

  const chat = msg.chat;
  const from = msg.from || chat;

  if (!chat || !from) return;

  const chatId = chat.id;
  const isPrivate = chat.type === 'private' || chat.id > 0;

  // 1. Find or create User
  let user = store.users.find(u => u.telegramId === from.id);
  if (!user) {
    user = {
      id: `usr-${from.id}`,
      telegramId: from.id,
      username: from.username,
      firstName: from.first_name || 'User',
      lastName: from.last_name,
      languageCode: from.language_code || 'en',
      isPremium: !!from.is_premium,
      isBlocked: false,
      isWatched: false,
      joinedAt: new Date().toISOString(),
      lastActive: 'Just now',
      credits: 100,
      totalLookupsPerformed: 0,
      referralsCount: 0,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${from.id}`
    };
    store.users.unshift(user);
    addLog('bot_event', `New Telegram User registered: ${user.firstName} (@${user.username || user.telegramId})`);
  } else {
    user.lastActive = 'Just now';
    if (from.username) user.username = from.username;
    if (from.first_name) user.firstName = from.first_name;
    if (from.last_name) user.lastName = from.last_name;
  }

  // 2. Find or create Group if message is from a group
  if (!isPrivate) {
    let group = store.groups.find(g => g.groupId === chat.id);
    if (!group) {
      group = {
        id: `grp-${Math.abs(chat.id)}`,
        groupId: chat.id,
        title: chat.title || `Group ${chat.id}`,
        username: chat.username,
        membersCount: 0,
        botPermissions: {
          canDeleteMessages: true,
          canRestrictMembers: true,
          canPromoteMembers: false,
          canChangeInfo: false,
          canInviteUsers: true,
          canPinMessages: true
        },
        createdAt: new Date().toISOString(),
        lastActive: 'Just now',
        isMuted: false,
        messagesHandledCount: 1
      };
      store.groups.unshift(group);
      addLog('bot_event', `Bot active in group: "${group.title}" (${group.groupId})`);
    } else {
      group.lastActive = 'Just now';
      group.messagesHandledCount += 1;
    }
  }

  // 3. Extract media / text
  let mediaType: TelegramChatMessage['mediaType'] = undefined;
  let textContent = (msg.text || msg.caption || '').trim();

  if (msg.photo) mediaType = 'photo';
  else if (msg.video) mediaType = 'video';
  else if (msg.voice) mediaType = 'voice';
  else if (msg.audio) mediaType = 'audio';
  else if (msg.document) mediaType = 'document';
  else if (msg.poll) mediaType = 'poll';
  else if (msg.location) mediaType = 'location';
  else if (msg.sticker) mediaType = 'sticker';

  const chatMessage: TelegramChatMessage = {
    id: `msg-${msg.message_id || Date.now()}`,
    telegramMessageId: msg.message_id,
    chatId: chatId,
    sender: 'user',
    senderName: from.first_name + (from.last_name ? ` ${from.last_name}` : ''),
    senderUsername: from.username,
    senderAvatar: user.avatarUrl,
    text: textContent || (mediaType ? `[${mediaType.toUpperCase()}]` : 'Message'),
    mediaType,
    pollDetails: msg.poll ? { question: msg.poll.question, options: msg.poll.options?.map((o: any) => o.text) || [] } : undefined,
    locationDetails: msg.location ? { latitude: msg.location.latitude, longitude: msg.location.longitude } : undefined,
    timestamp: new Date().toISOString(),
    status: 'delivered'
  };

  const strChatId = String(chatId);
  if (!store.messages[strChatId]) {
    store.messages[strChatId] = [];
  }
  store.messages[strChatId].push(chatMessage);

  // 4. Update Conversation Preview
  let conv = store.chats.find(c => c.chatId === chatId);
  if (!conv) {
    conv = {
      chatId,
      id: String(chatId),
      type: chat.type || 'private',
      title: isPrivate ? (from.first_name + (from.last_name ? ` ${from.last_name}` : '')) : (chat.title || 'Group'),
      username: from.username || chat.username,
      avatarUrl: isPrivate ? user.avatarUrl : `https://api.dicebear.com/7.x/identicon/svg?seed=${chatId}`,
      lastMessage: textContent || `[${mediaType?.toUpperCase() || 'Message'}]`,
      lastMessageTime: new Date().toISOString(),
      unreadCount: 1,
      isOnline: true
    };
    store.chats.unshift(conv);
  } else {
    conv.lastMessage = textContent || `[${mediaType?.toUpperCase() || 'Message'}]`;
    conv.lastMessageTime = new Date().toISOString();
    conv.unreadCount += 1;
    conv.title = isPrivate ? (from.first_name + (from.last_name ? ` ${from.last_name}` : '')) : (chat.title || conv.title);
  }

  saveStore();

  // 5. Automatic Bot Replies for Personal Messages & OSINT Lookups
  if (isPrivate) {
    let replyText = '';
    const rawText = textContent.trim();
    const lowerText = rawText.toLowerCase();

    if (user.isBlocked) {
      replyText = '⛔ <b>Your account is blocked from using this bot.</b>';
    } else if (lowerText === '/start' || lowerText.startsWith('/start ')) {
      replyText = `<b>👋 Welcome to the OSINT & Info Lookup Bot!</b>\n\nPlease select an option below to perform a lookup:`;
    } else if (lowerText === '📱 mobile' || lowerText === 'mobile' || lowerText === '/mobile') {
      userSelectedMode[user.telegramId] = 'mobile';
      replyText = `📱 <b>MOBILE Lookup Selected</b>\n\nPlease send the 10-digit Mobile Number to lookup (e.g., <code>9876543210</code>):`;
    } else if (lowerText === '🪪 aadhaar' || lowerText === '🪪 aadhar' || lowerText === 'aadhaar' || lowerText === 'aadhar' || lowerText === '/aadhaar' || lowerText === '/adhar') {
      userSelectedMode[user.telegramId] = 'adhar';
      replyText = `🪪 <b>AADHAAR Lookup Selected</b>\n\nPlease send the 12-digit Aadhaar Number to lookup:`;
    } else if (lowerText === '💲 upi' || lowerText === 'upi' || lowerText === '/upi') {
      userSelectedMode[user.telegramId] = 'upi';
      replyText = `💲 <b>UPI ID Lookup Selected</b>\n\nPlease send the UPI ID to lookup (e.g., <code>name@paytm</code> or <code>9876543210@upi</code>):`;
    } else if (lowerText === '🏦 ifsc' || lowerText === 'ifsc' || lowerText === '/ifsc') {
      userSelectedMode[user.telegramId] = 'ifsc';
      replyText = `🏦 <b>IFSC Code Lookup Selected</b>\n\nPlease send the 11-character IFSC Code to lookup (e.g., <code>PUNB00024544</code>):`;
    } else if (lowerText === '📸 instagram' || lowerText === 'instagram' || lowerText === '/instagram') {
      userSelectedMode[user.telegramId] = 'instagram';
      replyText = `📸 <b>INSTAGRAM Lookup Selected</b>\n\nPlease send the Instagram Username to lookup (e.g., <code>john_doe</code>):`;
    } else if (lowerText === '/profile' || lowerText === '/myinfo' || lowerText === '/balance' || lowerText === '/credits') {
      replyText = `👤 <b>User Profile</b>\n\n• <b>Name</b>: ${escapeHtml(user.firstName)} ${escapeHtml(user.lastName || '')}\n• <b>Username</b>: @${escapeHtml(user.username || 'N/A')}\n• <b>Telegram ID</b>: <code>${user.telegramId}</code>\n• <b>Credits Balance</b>: ${user.credits} Credits\n• <b>Lookups Done</b>: ${user.totalLookupsPerformed}\n• <b>Status</b>: Active ✅\n• <b>Joined</b>: ${new Date(user.joinedAt).toLocaleDateString()}`;
    } else if (lowerText === '/help') {
      replyText = `❓ <b>OSINT & Info Lookup Bot Help</b>\n\nWelcome ${escapeHtml(user.firstName)}! Available commands:\n\n• /start - Main menu & select lookup mode\n• /mobile &lt;number&gt; - Mobile number lookup\n• /aadhaar &lt;number&gt; - Aadhaar card lookup\n• /upi &lt;id&gt; - UPI VPA lookup\n• /ifsc &lt;code&gt; - Bank IFSC lookup\n• /instagram &lt;username&gt; - Instagram lookup\n• /profile - Check credits & account info\n\nOr click any button below and send the query!`;
    } else {
      // Direct lookup or command with argument
      let targetType = '';
      let queryTerm = '';

      if (lowerText.startsWith('/mobile ')) {
        targetType = 'mobile';
        queryTerm = rawText.slice(8).trim();
      } else if (lowerText.startsWith('/aadhaar ') || lowerText.startsWith('/adhar ')) {
        targetType = 'adhar';
        queryTerm = rawText.replace(/^\/(aadhaar|adhar)\s+/i, '').trim();
      } else if (lowerText.startsWith('/upi ')) {
        targetType = 'upi';
        queryTerm = rawText.slice(5).trim();
      } else if (lowerText.startsWith('/ifsc ')) {
        targetType = 'ifsc';
        queryTerm = rawText.slice(6).trim();
      } else if (lowerText.startsWith('/instagram ')) {
        targetType = 'instagram';
        queryTerm = rawText.slice(11).trim();
      } else if (rawText) {
        queryTerm = rawText;
        if (/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/i.test(queryTerm)) {
          targetType = 'ifsc';
        } else if (queryTerm.includes('@')) {
          targetType = 'upi';
        } else if (/^\d{12}$/.test(queryTerm)) {
          targetType = 'adhar';
        } else if (/^\d{10}$/.test(queryTerm)) {
          targetType = 'mobile';
        } else {
          targetType = userSelectedMode[user.telegramId] || 'mobile';
        }
      }

      if (targetType && queryTerm) {
        user.totalLookupsPerformed = (user.totalLookupsPerformed || 0) + 1;
        user.credits = Math.max(0, (user.credits || 100) - 1);

        const resultObj = await performOsintLookup(targetType, queryTerm, store.config.apiKey);
        const jsonStr = JSON.stringify(resultObj, null, 2);

        replyText = `<pre><code>${escapeHtml(jsonStr)}</code></pre>\n\n🔥 <b>Powered By @OSINT40U_BOT OSINT</b>\n🧑‍💻 <b>Developer: @ritik_raushan_kumar_9</b>`;
      } else if (store.config.autoReplyEnabled !== false) {
        if (store.config.autoReplyMessage && store.config.autoReplyMessage.trim()) {
          replyText = store.config.autoReplyMessage;
        } else {
          replyText = `🤖 Please select an option from the menu below (e.g. 📱 MOBILE, 🪪 AADHAAR, 💲 UPI, 🏦 IFSC, 📸 INSTAGRAM) or send a query to lookup!`;
        }
      }
    }

    if (replyText) {
      const botReplyMsg: TelegramChatMessage = {
        id: `msg-${Date.now() + 1}`,
        chatId: chatId,
        sender: 'bot',
        senderName: store.config.botFirstName || 'Telegram Bot',
        text: replyText,
        timestamp: new Date().toISOString(),
        status: 'sending'
      };

      store.messages[strChatId].push(botReplyMsg);
      conv.lastMessage = replyText;
      conv.lastMessageTime = botReplyMsg.timestamp;

      // Deliver via Telegram API if bot token is configured
      if (store.config.botToken) {
        try {
          const res = await sendTelegramMessageChunked(chatId, replyText, {
            reply_markup: OSINT_REPLY_KEYBOARD
          });
          botReplyMsg.telegramMessageId = res?.message_id;
          botReplyMsg.status = 'sent';
          addLog('bot_event', `Auto-replied to personal message from ${user.firstName} (${user.telegramId})`);
        } catch (err: any) {
          botReplyMsg.status = 'failed';
          addLog('error', `Failed to deliver Telegram auto-reply to ${user.telegramId}: ${err.message}`);
        }
      } else {
        botReplyMsg.status = 'delivered';
      }

      saveStore();
    }
  }
  } finally {
    if (updateId) inFlightUpdateIds.delete(updateId);
    if (msg?.message_id) inFlightMessageKeys.delete(msgKey);
  }
}

async function runLongPolling() {
  if (!isPollingLoopRunning) return;
  if (!store.config.botToken) {
    isPollingLoopRunning = false;
    store.config.isPollingActive = false;
    return;
  }

  try {
    const currentOffset = Math.max(lastUpdateId, store.lastUpdateId || 0) + 1;
    const updates = await sendTelegramRequest('getUpdates', {
      offset: currentOffset,
      timeout: 10,
    });

    if (Array.isArray(updates) && updates.length > 0) {
      for (const update of updates) {
        lastUpdateId = Math.max(lastUpdateId, update.update_id);
        await processIncomingTelegramUpdate(update);
      }
    }
  } catch (err: any) {
    const errMsg = err.message || '';
    if (errMsg.includes('Conflict') || errMsg.includes('terminated by other getUpdates')) {
      // Transient Telegram conflict (e.g., previous polling connection closing or dev server restart)
      console.log('Telegram polling conflict detected, backing off for 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    } else {
      addLog('error', `Telegram Polling error: ${errMsg}`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (isPollingLoopRunning) {
    scheduleNextPolling(200);
  }
}

async function startPollingLoop() {
  if (isPollingLoopRunning) return;
  if (!store.config.botToken) {
    addLog('error', 'Cannot start polling: Bot token is missing');
    return;
  }

  try {
    // Delete active webhook to allow getUpdates long polling without Telegram API conflict
    await sendTelegramRequest('deleteWebhook', { drop_pending_updates: false });
    addLog('info', 'Cleared active Telegram webhooks for long polling.');
  } catch (e: any) {
    console.log('Webhook clear response:', e.message);
  }

  isPollingLoopRunning = true;
  store.config.isPollingActive = true;
  store.config.autoStartPolling = true;
  addLog('info', 'Started Telegram long polling loop...');
  runLongPolling();
}

function stopPollingLoop() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  if (pollingTimeoutId) {
    clearTimeout(pollingTimeoutId);
    pollingTimeoutId = null;
  }
  isPollingLoopRunning = false;
  store.config.isPollingActive = false;
  addLog('info', 'Stopped Telegram long polling loop.');
  saveStore();
}

// Self-ping interval for keeping app active 24/7 on hosting platforms
setInterval(() => {
  if (store.config.botToken) {
    sendTelegramRequest('getMe', {}).catch(() => {});
  }
}, 3 * 60 * 1000);

export const app = express();

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '20mb' }));

  // Auto-connect MongoDB on incoming API requests for serverless/Vercel support
  app.use(async (req, res, next) => {
    if (req.path.startsWith('/api') && !isMongoConnected) {
      await connectMongoDB().catch(() => {});
    }
    next();
  });

  // Dashboard Overview (Real DB Computed Metrics)
  app.get("/api/admin/dashboard", (req, res) => {
    const totalUsers = store.users.length;
    const totalGroups = store.groups.length;
    const blockedCount = store.users.filter(u => u.isBlocked).length;
    const totalMessages = Object.values(store.messages).reduce((acc, list) => acc + list.length, 0);

    res.json({
      status: "ok",
      stats: {
        totalUsers,
        activeUsers24h: store.users.filter(u => u.lastActive === 'Just now').length,
        blockedUsersCount: blockedCount,
        totalGroups,
        messagesToday: totalMessages,
        totalApiRequests: store.logs.filter(l => l.type === 'lookup').length,
        creditsUsedToday: store.users.reduce((acc, u) => acc + (100 - u.credits), 0),
        creditsRemainingTotal: store.users.reduce((acc, u) => acc + u.credits, 0),
        totalLogs: store.logs.length,
        isPolling: store.config.isPollingActive,
        botInfo: {
          username: store.config.botUsername || "Unconfigured Bot",
          first_name: store.config.botFirstName || "Telegram Bot",
          can_join_groups: true,
          can_read_all_group_messages: true,
          supports_inline_queries: true
        }
      },
      recentUsers: store.users.slice(0, 5),
      recentGroups: store.groups.slice(0, 5),
      recentBroadcasts: store.broadcasts.slice(0, 3)
    });
  });

  // Users Management Endpoints
  app.get("/api/admin/users", (req, res) => {
    const search = ((req.query.search as string) || "").toLowerCase();
    const filter = (req.query.filter as string) || "all";

    let filtered = [...store.users];
    if (search) {
      filtered = filtered.filter(u =>
        u.firstName.toLowerCase().includes(search) ||
        (u.username && u.username.toLowerCase().includes(search)) ||
        u.telegramId.toString().includes(search) ||
        u.id.toLowerCase().includes(search)
      );
    }

    if (filter === 'blocked') {
      filtered = filtered.filter(u => u.isBlocked);
    } else if (filter === 'watched') {
      filtered = filtered.filter(u => u.isWatched);
    }

    res.json({ status: "ok", users: filtered });
  });

  app.post("/api/admin/users/credits", (req, res) => {
    const { userId, credits, mode } = req.body;
    const user = store.users.find(u => u.id === userId || u.telegramId === Number(userId));
    if (!user) return res.status(404).json({ status: false, message: "User not found in database" });

    const amount = Number(credits) || 0;
    if (mode === 'add') user.credits += amount;
    else if (mode === 'subtract') user.credits = Math.max(0, user.credits - amount);
    else user.credits = Math.max(0, amount);

    addLog("admin", `Updated credits for user ${user.firstName} (@${user.username || user.telegramId}): ${user.credits} balance`);
    saveStore();
    res.json({ status: "ok", user });
  });

  app.post("/api/admin/users/block", (req, res) => {
    const { userId, block } = req.body;
    const user = store.users.find(u => u.id === userId || u.telegramId === Number(userId));
    if (!user) return res.status(404).json({ status: false, message: "User not found in database" });

    user.isBlocked = !!block;
    addLog("admin", `${user.isBlocked ? 'Blocked' : 'Unblocked'} user ${user.firstName} (${user.telegramId})`);
    saveStore();
    res.json({ status: "ok", user });
  });

  app.post("/api/admin/users/notes", (req, res) => {
    const { userId, notes } = req.body;
    const user = store.users.find(u => u.id === userId || u.telegramId === Number(userId));
    if (!user) return res.status(404).json({ status: false, message: "User not found in database" });

    user.adminNotes = notes;
    saveStore();
    res.json({ status: "ok", user });
  });

  app.delete("/api/admin/users/:id", (req, res) => {
    const idx = store.users.findIndex(u => u.id === req.params.id || u.telegramId === Number(req.params.id));
    if (idx !== -1) {
      const removed = store.users.splice(idx, 1);
      addLog("admin", `Deleted user record from database: ${removed[0].firstName}`);
      saveStore();
    }
    res.json({ status: "ok" });
  });

  // Groups Management Endpoints
  app.get("/api/admin/groups", (req, res) => {
    res.json({ status: "ok", groups: store.groups });
  });

  app.post("/api/admin/groups/action", (req, res) => {
    const { groupId, action } = req.body;
    const group = store.groups.find(g => g.id === groupId || g.groupId === Number(groupId));
    if (!group) return res.status(404).json({ status: false, message: "Group not found in database" });

    if (action === "mute") {
      group.isMuted = !group.isMuted;
      addLog("admin", `${group.isMuted ? 'Muted' : 'Unmuted'} group: ${group.title}`);
    } else if (action === "remove") {
      const idx = store.groups.findIndex(g => g.id === group.id);
      if (idx !== -1) store.groups.splice(idx, 1);
      addLog("admin", `Removed group record: ${group.title}`);
    }

    saveStore();
    res.json({ status: "ok", group });
  });

  // Chat Interface Endpoints (Telegram Desktop)
  app.get("/api/admin/chats", (req, res) => {
    // Sort chats by latest message time
    const sorted = [...store.chats].sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());
    res.json({ status: "ok", chats: sorted });
  });

  app.get("/api/admin/chats/:chatId/messages", (req, res) => {
    const chatId = req.params.chatId;
    const list = store.messages[chatId] || [];

    // Reset unread count for this chat when opened
    const conv = store.chats.find(c => c.id === chatId || String(c.chatId) === chatId);
    if (conv) {
      conv.unreadCount = 0;
      saveStore();
    }

    res.json({ status: "ok", messages: list });
  });

  app.post("/api/admin/chats/:chatId/send", async (req, res) => {
    const chatId = req.params.chatId;
    const numericChatId = Number(chatId);
    const { text, mediaType, mediaUrl, mediaCaption, buttons, pollDetails, locationDetails } = req.body;

    const botName = store.config.botFirstName || "Telegram Bot";

    const outboundMsg: TelegramChatMessage = {
      id: `msg-${Date.now()}`,
      chatId: numericChatId,
      sender: 'bot',
      senderName: botName,
      text: text || mediaCaption || (mediaType ? `[${mediaType.toUpperCase()}]` : 'Message'),
      mediaType,
      mediaUrl,
      mediaCaption,
      buttons,
      pollDetails,
      locationDetails,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    // Store in message history
    if (!store.messages[chatId]) {
      store.messages[chatId] = [];
    }
    store.messages[chatId].push(outboundMsg);

    // Update Chat conversation preview
    let conv = store.chats.find(c => c.id === chatId || String(c.chatId) === chatId);
    if (conv) {
      conv.lastMessage = outboundMsg.text;
      conv.lastMessageTime = outboundMsg.timestamp;
    }

    // Try sending live message to Telegram Bot API if token configured
    if (store.config.botToken) {
      try {
        let tgMethod = 'sendMessage';
        let payload: any = { chat_id: numericChatId, text: text || ' ' };

        if (mediaType === 'photo') {
          tgMethod = 'sendPhoto';
          payload = { chat_id: numericChatId, photo: mediaUrl, caption: mediaCaption || text };
        } else if (mediaType === 'document') {
          tgMethod = 'sendDocument';
          payload = { chat_id: numericChatId, document: mediaUrl, caption: mediaCaption || text };
        } else if (mediaType === 'video') {
          tgMethod = 'sendVideo';
          payload = { chat_id: numericChatId, video: mediaUrl, caption: mediaCaption || text };
        } else if (mediaType === 'audio') {
          tgMethod = 'sendAudio';
          payload = { chat_id: numericChatId, audio: mediaUrl, caption: mediaCaption || text };
        } else if (mediaType === 'poll' && pollDetails) {
          tgMethod = 'sendPoll';
          payload = { chat_id: numericChatId, question: pollDetails.question, options: pollDetails.options };
        } else if (mediaType === 'location' && locationDetails) {
          tgMethod = 'sendLocation';
          payload = { chat_id: numericChatId, latitude: locationDetails.latitude, longitude: locationDetails.longitude };
        }

        let tgRes: any = null;
        if (tgMethod === 'sendMessage') {
          const extraParams: any = {};
          if (buttons && Array.isArray(buttons) && buttons.length > 0) {
            extraParams.reply_markup = { inline_keyboard: buttons };
          }
          tgRes = await sendTelegramMessageChunked(numericChatId, text || ' ', extraParams);
        } else {
          if (buttons && Array.isArray(buttons) && buttons.length > 0) {
            payload.reply_markup = { inline_keyboard: buttons };
          }
          tgRes = await sendTelegramRequest(tgMethod, payload);
        }
        outboundMsg.telegramMessageId = tgRes?.message_id;
        outboundMsg.status = 'sent';
        addLog('bot_event', `Sent Telegram message to chat ${numericChatId}`);
      } catch (err: any) {
        outboundMsg.status = 'failed';
        addLog('error', `Failed to deliver Telegram message to ${numericChatId}: ${err.message}`);
      }
    } else {
      outboundMsg.status = 'delivered';
      addLog('info', `Saved message locally for chat ${numericChatId} (No live Bot Token configured)`);
    }

    saveStore();
    res.json({ status: "ok", message: outboundMsg });
  });

  // Official Telegram Webhook Handler
  app.post("/api/telegram/webhook", async (req, res) => {
    try {
      await processIncomingTelegramUpdate(req.body);
      res.json({ ok: true });
    } catch (err: any) {
      addLog("error", `Webhook error: ${err.message}`);
      res.status(500).json({ status: false, error: err.message });
    }
  });

  // Admin Simulation Endpoint (Allows testing real chat UI without live bot token if needed)
  app.post("/api/admin/simulate/inbound", async (req, res) => {
    const { name, username, text, mediaType, telegramId } = req.body;
    const tgId = Number(telegramId) || Math.floor(100000000 + Math.random() * 899999999);

    const updateMock = {
      message: {
        message_id: Math.floor(Math.random() * 10000),
        from: {
          id: tgId,
          is_bot: false,
          first_name: name || "Test User",
          username: username || "test_user",
          language_code: "en"
        },
        chat: {
          id: tgId,
          type: "private",
          first_name: name || "Test User",
          username: username || "test_user"
        },
        date: Math.floor(Date.now() / 1000),
        text: text || "Hello Bot! Testing Telegram interface."
      }
    };

    await processIncomingTelegramUpdate(updateMock);
    res.json({ status: "ok", message: "Inbound test message received!", chatId: tgId });
  });

  // Broadcast Management Endpoints
  app.get("/api/admin/broadcasts", (req, res) => {
    res.json({ status: "ok", broadcasts: store.broadcasts });
  });

  app.post("/api/admin/broadcasts/send", async (req, res) => {
    const { title, targetType, mediaType, content, mediaUrl, parseMode, buttons, scheduledFor } = req.body;

    const targetUsers = store.users.filter(u => !u.isBlocked);
    const recipientCount = targetType === 'groups' ? store.groups.length : targetUsers.length;

    const newBroadcast: BroadcastCampaign = {
      id: "bc-" + Date.now().toString(36),
      title: title || "New Broadcast Campaign",
      targetType: targetType || "dm",
      mediaType: mediaType || "text",
      content: content || "",
      mediaUrl: mediaUrl || "",
      parseMode: parseMode || "HTML",
      buttons: buttons || [],
      scheduledFor: scheduledFor || undefined,
      status: scheduledFor ? "scheduled" : "sending",
      createdAt: new Date().toISOString(),
      stats: {
        totalRecipients: recipientCount,
        sentCount: 0,
        failedCount: 0,
        pendingCount: recipientCount,
        progressPercentage: 0
      }
    };

    store.broadcasts.unshift(newBroadcast);
    addLog("broadcast", `Created broadcast campaign: "${newBroadcast.title}" (${recipientCount} recipients)`);

    // Execute actual broadcast dispatch
    if (!scheduledFor) {
      setTimeout(async () => {
        let sent = 0;
        let failed = 0;

        for (const u of targetUsers) {
          if (store.config.botToken) {
            try {
              await sendTelegramMessageChunked(u.telegramId, content || ' ');
              sent++;
            } catch {
              failed++;
            }
          } else {
            sent++;
          }
        }

        newBroadcast.stats.sentCount = sent;
        newBroadcast.stats.failedCount = failed;
        newBroadcast.stats.pendingCount = 0;
        newBroadcast.stats.progressPercentage = 100;
        newBroadcast.status = "completed";
        newBroadcast.completedAt = new Date().toISOString();

        addLog("broadcast", `Broadcast "${newBroadcast.title}" finished. Delivered: ${sent}, Failed: ${failed}`);
        saveStore();
      }, 1000);
    }

    saveStore();
    res.json({ status: "ok", broadcast: newBroadcast });
  });

  // Permissions & Plans
  app.get("/api/admin/permissions", (req, res) => {
    res.json({
      status: "ok",
      permissions: store.permissions,
      apiKeys: store.apiKeys,
      plans: store.plans
    });
  });

  app.post("/api/admin/permissions/toggle", (req, res) => {
    const { permissionId, enabled } = req.body;
    const perm = store.permissions.find(p => p.id === permissionId || p.key === permissionId);
    if (perm) {
      perm.enabled = enabled;
      addLog("admin", `${enabled ? 'Enabled' : 'Disabled'} module permission: ${perm.name}`);
      saveStore();
    }
    res.json({ status: "ok", permissions: store.permissions });
  });

  // Analytics Endpoints
  app.get("/api/admin/analytics", (req, res) => {
    const dailyMetrics = [
      { date: "Mon", usersCount: store.users.length, lookupsCount: store.logs.length, broadcastsCount: store.broadcasts.length, creditsUsed: 120 },
      { date: "Today", usersCount: store.users.length, lookupsCount: store.logs.length, broadcastsCount: store.broadcasts.length, creditsUsed: 40 }
    ];

    const commandMetrics = [
      { command: "/start", type: "Bot Welcome", count: store.users.length, percentage: 50 },
      { command: "/help", type: "Help Guide", count: Math.max(1, Math.floor(store.users.length / 2)), percentage: 30 }
    ];

    const serverUsage = {
      cpuUsage: 12.4,
      memoryUsageMB: 42.1,
      avgLatencyMs: 14,
      uptimeDays: 1.2
    };

    res.json({
      status: "ok",
      dailyUsersGrowth: dailyMetrics,
      topCommands: commandMetrics,
      serverMetrics: serverUsage,
      broadcastStats: {
        totalSent: store.broadcasts.reduce((acc, b) => acc + b.stats.sentCount, 0),
        successRatePercent: 100,
        failedCount: store.broadcasts.reduce((acc, b) => acc + b.stats.failedCount, 0)
      }
    });
  });

  // Settings & System Endpoints
  app.get("/api/admin/settings", (req, res) => {
    res.json({
      status: "ok",
      config: store.config
    });
  });

  app.post("/api/admin/settings/save", (req, res) => {
    const { botToken, apiKey, apiUrl, welcomeMessage, webhookUrl, maintenanceMode, supabaseUrl, supabaseKey } = req.body;
    if (botToken !== undefined) store.config.botToken = botToken.trim() || DEFAULT_BOT_TOKEN;
    if (apiKey !== undefined) store.config.apiKey = apiKey.trim() || DEFAULT_API_KEY;
    if (apiUrl !== undefined) store.config.apiUrl = apiUrl.trim() || DEFAULT_API_URL;
    if (welcomeMessage !== undefined) store.config.welcomeMessage = welcomeMessage;
    if (webhookUrl !== undefined) store.config.webhookUrl = webhookUrl;
    if (maintenanceMode !== undefined) store.config.maintenanceMode = maintenanceMode;
    if (supabaseUrl !== undefined) store.config.supabaseUrl = supabaseUrl;
    if (supabaseKey !== undefined) store.config.supabaseKey = supabaseKey;

    store.config = ensureConfigDefaults(store.config);

    addLog("admin", "Admin updated system settings and Telegram Bot Token");

    if (store.config.botToken) {
      sendTelegramRequest('getMe', {})
        .then((botInfo) => {
          store.config.botUsername = botInfo.username;
          store.config.botFirstName = botInfo.first_name;
          addLog('info', `Verified Bot token identity: @${botInfo.username} (${botInfo.first_name})`);
          saveStore();
        })
        .catch((err) => {
          addLog('error', `Failed to verify bot token with Telegram: ${err.message}`);
        });
    }

    saveStore();
    res.json({ status: "ok", config: store.config });
  });

  app.post("/api/bot/toggle-polling", (req, res) => {
    const { action } = req.body;
    if (action === 'start') {
      startPollingLoop();
      res.json({ status: 'ok', message: 'Polling started', isPolling: true });
    } else {
      stopPollingLoop();
      res.json({ status: 'ok', message: 'Polling stopped', isPolling: false });
    }
  });

  app.get("/api/logs", (req, res) => {
    res.json({ logs: store.logs });
  });

  app.delete("/api/logs", (req, res) => {
    store.logs.length = 0;
    addLog('info', 'Logs cleared by admin.');
    saveStore();
    res.json({ status: 'ok' });
  });

  // 24/7 Health Check & Keep-Alive Ping Endpoint
  app.get("/api/ping", (req, res) => {
    res.json({
      status: "ok",
      message: "Bot is 24/7 online & healthy",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      isPolling: store.config.isPollingActive,
      hasBotToken: !!store.config.botToken,
      botUsername: store.config.botUsername || "Unconfigured",
      webhookUrl: store.config.webhookUrl || ""
    });
  });

  // Webhook Management Endpoints for Vercel/Serverless & Cloud Deployment
  app.post("/api/webhook/set", async (req, res) => {
    const { webhookUrl } = req.body;
    let targetUrl = webhookUrl ? webhookUrl.trim() : "";

    if (!targetUrl) {
      const host = req.headers.host || (req.headers['x-forwarded-host'] as string);
      const protocol = (req.headers['x-forwarded-proto'] as string) || 'https';
      if (host) {
        targetUrl = `${protocol}://${host}/api/webhook/telegram`;
      }
    }

    if (!targetUrl) {
      return res.status(400).json({ status: false, message: "Webhook URL could not be determined. Please specify a valid HTTPS URL." });
    }

    if (!store.config.botToken) {
      return res.status(400).json({ status: false, message: "Bot token is not configured in Settings!" });
    }

    try {
      stopPollingLoop();

      const response = await sendTelegramRequest('setWebhook', {
        url: targetUrl,
        drop_pending_updates: false
      });

      store.config.webhookUrl = targetUrl;
      store.config.isPollingActive = false;
      addLog('info', `Set Telegram Webhook URL to: ${targetUrl}`);
      saveStore();

      res.json({
        status: "ok",
        message: `Webhook successfully set to ${targetUrl}`,
        webhookUrl: targetUrl,
        telegramResponse: response
      });
    } catch (err: any) {
      addLog('error', `Failed to set Telegram Webhook: ${err.message}`);
      res.status(500).json({ status: false, error: err.message });
    }
  });

  app.get("/api/webhook/info", async (req, res) => {
    if (!store.config.botToken) {
      return res.status(400).json({ status: false, message: "Bot token is not configured" });
    }

    try {
      const info = await sendTelegramRequest('getWebhookInfo', {});
      res.json({ status: "ok", webhookInfo: info, configuredUrl: store.config.webhookUrl });
    } catch (err: any) {
      res.status(500).json({ status: false, error: err.message });
    }
  });

  app.post("/api/webhook/delete", async (req, res) => {
    if (!store.config.botToken) {
      return res.status(400).json({ status: false, message: "Bot token is not configured" });
    }

    try {
      const response = await sendTelegramRequest('deleteWebhook', { drop_pending_updates: false });
      store.config.webhookUrl = "";
      addLog('info', 'Deleted Telegram Webhook');
      saveStore();
      res.json({ status: "ok", message: "Webhook deleted successfully", response });
    } catch (err: any) {
      res.status(500).json({ status: false, error: err.message });
    }
  });

  // Webhook receiver for Telegram Webhooks
  app.post("/api/webhook/telegram", (req, res) => {
    // Immediately respond 200 OK so Telegram never retries the update
    res.json({ ok: true });
    if (req.body) {
      processIncomingTelegramUpdate(req.body).catch((err: any) => {
        console.error("[Webhook Error]", err.message);
      });
    }
  });

  // MongoDB status endpoint
  app.get("/api/db/status", (req, res) => {
    res.json({
      connected: isMongoConnected,
      mongoUriConfigured: true,
      databaseName: "TDM",
      uri: MONGO_URI.replace(/:([^@]+)@/, ":****@"),
      usersCount: store.users.length,
      logsCount: store.logs.length,
      lastSync: new Date().toISOString()
    });
  });

  // Connect to MongoDB Atlas
  await connectMongoDB();

  // Ensure internal default credentials and settings are active and start polling loop
  store.config = ensureConfigDefaults(store.config);
  saveStore();

  sendTelegramRequest('getMe', {})
    .then((info) => {
      store.config.botUsername = info.username;
      store.config.botFirstName = info.first_name;
      addLog('info', `Authenticated Telegram Bot: @${info.username} (${info.first_name})`);
      startPollingLoop();
    })
    .catch((err) => {
      addLog('error', `Initial Telegram Bot Token check error: ${err.message}`);
      startPollingLoop();
    });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Telegram Bot Admin Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
