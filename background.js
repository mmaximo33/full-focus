const DEFAULT_RULES = [
  {
    name: "Facebook",
    url: "https://facebook.com",
    url_type: "domain",
    patterns: [],
    hour_start: "08:00",
    hour_end: "17:00",
    days: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
    enabled: true
  },
  {
    name: "Instagram",
    url: "https://instagram.com",
    url_type: "pattern",
    patterns: ["/reels/", "/stories/"],
    hour_start: "08:00",
    hour_end: "17:00",
    days: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
    enabled: true
  },
  {
    name: "Netflix",
    url: "https://netflix.com",
    url_type: "domain",
    patterns: [],
    hour_start: "08:00",
    hour_end: "17:00",
    days: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
    enabled: true
  },
  {
    name: "TikTok",
    url: "https://tiktok.com",
    url_type: "pattern",
    patterns: ["/video/*", "/@*/video"],
    hour_start: "08:00",
    hour_end: "17:00",
    days: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
    enabled: true
  },
  {
    name: "YouTube",
    url: "https://youtube.com",
    url_type: "pattern",
    patterns: ["/shorts/"],
    hour_start: "08:00",
    hour_end: "17:00",
    days: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
    enabled: true
  }
];

const DEFAULT_MESSAGES = [
  { message: "¿De verdad vas a perder más tiempo en %rule_name%?", enabled: true },
  { message: "¡Otra vez entrando a %rule_url%! Ya deberías saber que está bloqueado.", enabled: true },
  { message: "¡Bloqueado! %rule_name% está bloqueado de %rule_hour_start% a %rule_hour_end%.", enabled: true },
  { message: "El bloqueo de %rule_name% es de %rule_hour_start% a %rule_hour_end%. Ahora no puedes entrar.", enabled: true },
  { message: "Día no permitido. %rule_name% está bloqueado los días: %rule_days%", enabled: true },
  { message: "¡Espera hasta las %rule_hour_end%! El bloqueo termina a esa hora.", enabled: true },
  { message: "¿Otra vez con %rule_url%? El bloqueo está activo hasta %rule_datetime_end%", enabled: true },
  { message: "Hora de enfocarte en algo productivo, no en %rule_name%.", enabled: true },
  { message: "Este sitio está bloqueado ahora. Horario: %rule_hour_start% - %rule_hour_end% (%rule_days%)", enabled: true },
  { message: "¡%rule_name% puede esperar! El bloqueo termina a las %rule_hour_end%.", enabled: true },
  { message: "¡Piensa en lo que podrías hacer! %rule_name% espera.", enabled: true },
  { message: "Fuera de horario. Vuelve a las %rule_hour_end% para usar %rule_name%.", enabled: true }
];

let cachedRules = [];
let cachedMessages = [];

function getCurrentTimeInMinutes() {
  return new Date().getHours() * 60 + new Date().getMinutes();
}

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function getCurrentDayName() {
  const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  return days[new Date().getDay()];
}

function formatDateTimeEnd(hourEnd) {
  const now = new Date();
  const [hours, minutes] = hourEnd.split(":").map(Number);
  const end = new Date(now);
  end.setHours(hours, minutes, 0, 0);
  if (end <= now) {
    end.setDate(end.getDate() + 1);
  }
  return `${end.getDate().toString().padStart(2, "0")}/${(end.getMonth() + 1).toString().padStart(2, "0")}/${end.getFullYear()} ${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`;
}

function shouldBlock(rule) {
  if (!rule.enabled) return false;
  const currentDay = getCurrentDayName();
  if (!rule.days.includes(currentDay)) return false;
  const currentTime = getCurrentTimeInMinutes();
  const startTime = parseTime(rule.hour_start);
  const endTime = parseTime(rule.hour_end);
  return currentTime >= startTime && currentTime < endTime;
}

const DAYS_SHORT = {
  "Lunes": "Lun", "Martes": "Mar", "Miercoles": "Mie", "Jueves": "Jue",
  "Viernes": "Vie", "Sabado": "Sáb", "Domingo": "Dom"
};

function getShortDays(days) {
  return days.map(d => DAYS_SHORT[d] || d).join(", ");
}

function replaceVariables(message, rule) {
  return message
    .replace(/%rule_name%/g, rule.name)
    .replace(/%rule_url%/g, rule.url)
    .replace(/%rule_hour_start%/g, rule.hour_start)
    .replace(/%rule_hour_end%/g, rule.hour_end)
    .replace(/%rule_days%/g, getShortDays(rule.days))
    .replace(/%rule_datetime_end%/g, formatDateTimeEnd(rule.hour_end));
}

function getRandomMessage(messages, rule) {
  const enabled = messages.filter(m => m.enabled);
  if (!enabled.length) return "Acceso bloqueado.";
  const msg = enabled[Math.floor(Math.random() * enabled.length)];
  return replaceVariables(msg.message, rule);
}

function normalizeUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function urlMatchesRule(pageUrl, rule) {
  const pageHostname = normalizeUrl(pageUrl).toLowerCase();
  const ruleHostname = normalizeUrl(rule.url).toLowerCase();

  // Verificar si el hostname coincide
  if (!pageHostname.includes(ruleHostname) && !pageHostname.endsWith("." + ruleHostname)) {
    return false;
  }

  // Si es domain o no tiene url_type, bloquear todo el dominio
  if (rule.url_type === "domain" || !rule.url_type || !rule.url_type) {
    return true;
  }

  // Si es pattern, verificar los patterns
  if (rule.url_type === "pattern") {
    const patterns = rule.patterns || [];
    
    // Si no hay patterns definidos, bloquear todo el dominio
    if (patterns.length === 0) {
      return true;
    }
    
    // Verificar si algún pattern coincide
    return patterns.some(pattern => {
      if (pattern.includes('*')) {
        // Glob: convertir * a regex
        const regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
        try {
          const regex = new RegExp(regexPattern, 'i');
          return regex.test(pageUrl);
        } catch (e) {
          return false;
        }
      } else {
        // Contains: verificar que contenga el texto
        return pageUrl.includes(pattern);
      }
    });
  }

  return true;
}

function getBlockerUrl(rule, message) {
  const data = btoa(JSON.stringify({
    rule_name: rule.name,
    rule_url: rule.url,
    rule_message: message,
    rule_hour_start: rule.hour_start,
    rule_hour_end: rule.hour_end,
    rule_days: rule.days.join(","),
    rule_datetime_end: formatDateTimeEnd(rule.hour_end)
  }));
  return chrome.runtime.getURL(`blocker/blocker.html?data=${data}`);
}

function onTabUpdated(tabId, changeInfo, tab) {
  if (changeInfo.status !== "loading") return;
  if (!tab || !tab.url) return;

  const rules = cachedRules.length ? cachedRules : DEFAULT_RULES;
  const messages = cachedMessages.length ? cachedMessages : DEFAULT_MESSAGES;

  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (!urlMatchesRule(tab.url, rule)) continue;

    if (shouldBlock(rule)) {
      const blockMessage = getRandomMessage(messages, rule);
      const blockerUrl = getBlockerUrl(rule, blockMessage);

      setTimeout(() => {
        chrome.tabs.update(tabId, { url: blockerUrl });
      }, 100);
      return;
    }
  }
}

chrome.tabs.onUpdated.addListener(onTabUpdated);

function loadCachedData() {
  chrome.storage.sync.get(["restriction_rules", "messages"]).then((stored) => {
    // Normalizar reglas: agregar url_type y patterns si no existen
    cachedRules = (stored.restriction_rules || DEFAULT_RULES).map(rule => ({
      ...rule,
      url_type: rule.url_type || 'domain',
      patterns: rule.patterns || []
    }));
    cachedMessages = stored.messages || DEFAULT_MESSAGES;
  });
}

loadCachedData();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    if (changes.restriction_rules) {
      cachedRules = changes.restriction_rules.newValue || DEFAULT_RULES;
    }
    if (changes.messages) {
      cachedMessages = changes.messages.newValue || DEFAULT_MESSAGES;
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["restriction_rules", "messages"]).then((stored) => {
    if (!stored.restriction_rules) {
      chrome.storage.sync.set({ restriction_rules: DEFAULT_RULES });
    }
    if (!stored.messages) {
      chrome.storage.sync.set({ messages: DEFAULT_MESSAGES });
    }
    chrome.runtime.openOptionsPage();
  });
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});