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

const DAYS_SHORT = {
  "Lunes": "Lun", "Martes": "Mar", "Miercoles": "Mie", "Jueves": "Jue",
  "Viernes": "Vie", "Sabado": "Sáb", "Domingo": "Dom"
};

let restrictionRules = [];
let messagesList = [];
let editingRuleIndex = undefined;
let editingMessageIndex = undefined;
let currentPatterns = [];

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  setupTabs();
  setupModals();
  setupFormListeners();
  setupUrlTypeToggle();
  renderRules();
  renderMessages();
  updateCounts();
});

async function loadData() {
  const stored = await chrome.storage.sync.get(["restriction_rules", "messages"]);
  restrictionRules = stored.restriction_rules || DEFAULT_RULES;
  messagesList = stored.messages || DEFAULT_MESSAGES;
}

async function saveData() {
  await chrome.storage.sync.set({ restriction_rules: restrictionRules, messages: messagesList });
}

function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`${tabName}-tab`).classList.add("active");
    });
  });
}

function setupModals() {
  document.getElementById("add-rule-btn").addEventListener("click", () => openRuleModal());
  document.getElementById("add-message-btn").addEventListener("click", () => openMessageModal());

  document.getElementById("rule-modal-close").addEventListener("click", closeRuleModal);
  document.getElementById("rule-cancel-btn").addEventListener("click", closeRuleModal);
  document.getElementById("rule-modal").addEventListener("click", (e) => {
    if (e.target.id === "rule-modal") closeRuleModal();
  });

  document.getElementById("message-modal-close").addEventListener("click", closeMessageModal);
  document.getElementById("message-cancel-btn").addEventListener("click", closeMessageModal);
  document.getElementById("message-modal").addEventListener("click", (e) => {
    if (e.target.id === "message-modal") closeMessageModal();
  });
}

function setupFormListeners() {
  document.getElementById("rule-form").addEventListener("submit", handleRuleSubmit);
  document.getElementById("message-form").addEventListener("submit", handleMessageSubmit);
  document.getElementById("add-pattern-btn").addEventListener("click", addPattern);
  document.getElementById("pattern-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addPattern(); }
  });
}

function setupUrlTypeToggle() {
  const urlTypeRadios = document.querySelectorAll('input[name="url_type"]');
  const patternsSection = document.getElementById("patterns-section");

  urlTypeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.value === "pattern") {
        patternsSection.style.display = "block";
      } else {
        patternsSection.style.display = "none";
      }
    });
  });
}

function addPattern() {
  const input = document.getElementById("pattern-input");
  const pattern = input.value.trim();

  if (!pattern) return;

  if (!currentPatterns.includes(pattern)) {
    currentPatterns.push(pattern);
  }

  input.value = "";
  renderPatterns();
}

function removePattern(index) {
  currentPatterns.splice(index, 1);
  renderPatterns();
}

function renderPatterns() {
  const container = document.getElementById("patterns-list");
  container.innerHTML = "";

  currentPatterns.forEach((pattern, index) => {
    const div = document.createElement("div");
    div.className = "pattern-item";
    div.innerHTML = `
      <span class="pattern-text">${pattern}</span>
      <button type="button" class="pattern-remove" data-index="${index}">×</button>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".pattern-remove").forEach(btn => {
    btn.addEventListener("click", () => removePattern(parseInt(btn.dataset.index)));
  });
}

function openRuleModal(rule = null, index = undefined) {
  editingRuleIndex = index;
  currentPatterns = [];
  const modal = document.getElementById("rule-modal");
  const title = document.getElementById("rule-modal-title");
  const submitBtn = document.getElementById("rule-submit-btn");
  const patternsSection = document.getElementById("patterns-section");

  if (rule) {
    title.textContent = "Editar Regla";
    submitBtn.textContent = "Guardar Cambios";
    document.getElementById("rule-name").value = rule.name;
    document.getElementById("rule-url").value = rule.url;
    document.getElementById("rule-hour-start").value = rule.hour_start;
    document.getElementById("rule-hour-end").value = rule.hour_end;

    document.querySelector(`input[name="url_type"][value="${rule.url_type || 'domain'}"]`).checked = true;

    if (rule.url_type === "pattern") {
      patternsSection.style.display = "block";
      currentPatterns = [...(rule.patterns || [])];
    } else {
      patternsSection.style.display = "none";
    }

    document.querySelectorAll('#rule-form .day-chip input').forEach(cb => {
      cb.checked = rule.days.includes(cb.value);
    });
  } else {
    title.textContent = "Agregar Nueva Regla";
    submitBtn.textContent = "Agregar Regla";
    clearRuleForm();
    patternsSection.style.display = "none";
  }

  renderPatterns();
  modal.classList.add("active");
  document.body.classList.add("modal-open");
  document.getElementById("rule-name").focus();
}

function closeRuleModal() {
  document.getElementById("rule-modal").classList.remove("active");
  document.body.classList.remove("modal-open");
  editingRuleIndex = undefined;
  currentPatterns = [];
}

function openMessageModal(msg = null, index = undefined) {
  editingMessageIndex = index;
  const modal = document.getElementById("message-modal");
  const title = document.getElementById("message-modal-title");
  const submitBtn = document.getElementById("message-submit-btn");

  if (msg) {
    title.textContent = "Editar Mensaje";
    submitBtn.textContent = "Guardar Cambios";
    document.getElementById("message-text").value = msg.message;
  } else {
    title.textContent = "Agregar Nuevo Mensaje";
    submitBtn.textContent = "Agregar Mensaje";
    document.getElementById("message-text").value = "";
  }

  modal.classList.add("active");
  document.body.classList.add("modal-open");
  document.getElementById("message-text").focus();
}

function closeMessageModal() {
  document.getElementById("message-modal").classList.remove("active");
  document.body.classList.remove("modal-open");
  editingMessageIndex = undefined;
}

async function handleRuleSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("rule-name").value.trim();
  const url = document.getElementById("rule-url").value.trim();
  const hourStart = document.getElementById("rule-hour-start").value;
  const hourEnd = document.getElementById("rule-hour-end").value;
  const urlType = document.querySelector('input[name="url_type"]:checked').value;

  const selectedDays = Array.from(document.querySelectorAll('#rule-form .day-chip input:checked'))
    .map(cb => cb.value);

  if (!name || !url) {
    alert("Por favor completa el nombre y el dominio.");
    return;
  }

  if (selectedDays.length === 0) {
    alert("Selecciona al menos un día.");
    return;
  }

  // Preservar los patterns existentes si estamos editando
  const existingPatterns = (editingRuleIndex !== undefined) 
    ? restrictionRules[editingRuleIndex].patterns 
    : [];

  const rule = {
    name,
    url: url.startsWith("http") ? url : `https://${url}`,
    url_type: urlType,
    patterns: urlType === "pattern" ? [...currentPatterns] : existingPatterns,
    hour_start: hourStart,
    hour_end: hourEnd,
    days: selectedDays,
    enabled: true
  };

  if (editingRuleIndex !== undefined) {
    rule.enabled = restrictionRules[editingRuleIndex].enabled;
    restrictionRules[editingRuleIndex] = rule;
  } else {
    restrictionRules.push(rule);
  }

  await saveData();
  closeRuleModal();
  renderRules();
  updateCounts();
}

async function handleMessageSubmit(e) {
  e.preventDefault();

  const messageText = document.getElementById("message-text").value.trim();

  if (!messageText) {
    alert("Por favor escribe un mensaje.");
    return;
  }

  const msg = {
    message: messageText,
    enabled: true
  };

  if (editingMessageIndex !== undefined) {
    msg.enabled = messagesList[editingMessageIndex].enabled;
    messagesList[editingMessageIndex] = msg;
  } else {
    messagesList.push(msg);
  }

  await saveData();
  closeMessageModal();
  renderMessages();
  updateCounts();
}

async function deleteRule(index) {
  if (confirm("¿Estás seguro de eliminar esta regla?")) {
    restrictionRules.splice(index, 1);
    await saveData();
    renderRules();
    updateCounts();
  }
}

async function toggleRule(index) {
  restrictionRules[index].enabled = !restrictionRules[index].enabled;
  await saveData();
  renderRules();
}

async function editRule(index) {
  openRuleModal(restrictionRules[index], index);
}

async function deleteMessage(index) {
  if (confirm("¿Estás seguro de eliminar este mensaje?")) {
    messagesList.splice(index, 1);
    await saveData();
    renderMessages();
    updateCounts();
  }
}

async function toggleMessage(index) {
  messagesList[index].enabled = !messagesList[index].enabled;
  await saveData();
  renderMessages();
}

async function editMessage(index) {
  openMessageModal(messagesList[index], index);
}

function getShortDays(days) {
  return days.map(d => DAYS_SHORT[d] || d).join(", ");
}

function renderRules() {
  const tbody = document.getElementById("rules-tbody");
  const empty = document.getElementById("rules-empty");
  const table = document.getElementById("rules-table");

  tbody.innerHTML = "";

  if (restrictionRules.length === 0) {
    table.style.display = "none";
    empty.style.display = "flex";
    return;
  }

  table.style.display = "table";
  empty.style.display = "none";

  restrictionRules.forEach((rule, index) => {
    let patternDisplay = rule.url;
    if (rule.url_type === "pattern" && rule.patterns && rule.patterns.length > 0) {
      patternDisplay = `${rule.url}{${rule.patterns.join(", ")}}`;
    }

    const tr = document.createElement("tr");
    tr.className = rule.enabled ? "" : "disabled";
    tr.innerHTML = `
      <td class="cell-name">${rule.name}</td>
      <td class="cell-pattern">${patternDisplay}</td>
      <td class="cell-schedule">${rule.hour_start} - ${rule.hour_end}</td>
      <td class="cell-days">${getShortDays(rule.days)}</td>
      <td class="cell-status">
        <span class="status-badge ${rule.enabled ? "active" : "inactive"}">
          ${rule.enabled ? "Activo" : "Inactivo"}
        </span>
      </td>
      <td class="cell-actions">
        <button class="btn-action btn-edit" data-index="${index}">Editar</button>
        <button class="btn-action btn-toggle" data-index="${index}">${rule.enabled ? "Desactivar" : "Activar"}</button>
        <button class="btn-action btn-delete" data-index="${index}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => editRule(parseInt(btn.dataset.index)));
  });

  tbody.querySelectorAll(".btn-toggle").forEach(btn => {
    btn.addEventListener("click", () => toggleRule(parseInt(btn.dataset.index)));
  });

  tbody.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => deleteRule(parseInt(btn.dataset.index)));
  });
}

function renderMessages() {
  const grid = document.getElementById("messages-grid");
  const empty = document.getElementById("messages-empty");

  grid.innerHTML = "";

  if (messagesList.length === 0) {
    empty.style.display = "flex";
    return;
  }

  empty.style.display = "none";

  messagesList.forEach((msg, index) => {
    const card = document.createElement("div");
    card.className = `message-card ${msg.enabled ? "" : "disabled"}`;
    card.innerHTML = `
      <div class="message-content">${msg.message}</div>
      <div class="message-footer">
        <span class="status-badge ${msg.enabled ? "active" : "inactive"}">
          ${msg.enabled ? "Activo" : "Inactivo"}
        </span>
        <div class="message-actions">
          <button class="btn-action btn-edit" data-index="${index}">Editar</button>
          <button class="btn-action btn-toggle" data-index="${index}">${msg.enabled ? "Desactivar" : "Activar"}</button>
          <button class="btn-action btn-delete" data-index="${index}">Eliminar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".btn-edit").forEach(btn => {
    btn.addEventListener("click", () => editMessage(parseInt(btn.dataset.index)));
  });

  grid.querySelectorAll(".btn-toggle").forEach(btn => {
    btn.addEventListener("click", () => toggleMessage(parseInt(btn.dataset.index)));
  });

  grid.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", () => deleteMessage(parseInt(btn.dataset.index)));
  });
}

function updateCounts() {
  document.getElementById("rules-count").textContent = restrictionRules.length;
  document.getElementById("messages-count").textContent = messagesList.length;
  document.getElementById("rules-tab-count").textContent = restrictionRules.length;
  document.getElementById("messages-tab-count").textContent = messagesList.length;
}

function clearRuleForm() {
  document.getElementById("rule-name").value = "";
  document.getElementById("rule-url").value = "";
  document.getElementById("rule-hour-start").value = "08:00";
  document.getElementById("rule-hour-end").value = "17:00";
  document.querySelector('input[name="url_type"][value="domain"]').checked = true;
  currentPatterns = [];
  renderPatterns();
  document.querySelectorAll('#rule-form .day-chip input').forEach((cb, i) => {
    cb.checked = i < 5;
  });
}