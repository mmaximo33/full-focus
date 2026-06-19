const DAYS_SHORT = {
  "Lunes": "Lun", "Martes": "Mar", "Miercoles": "Mie", "Jueves": "Jue",
  "Viernes": "Vie", "Sabado": "Sáb", "Domingo": "Dom"
};

function getShortDays(daysStr) {
  const days = daysStr.split(",");
  return days.map(d => DAYS_SHORT[d.trim()] || d.trim()).join(", ");
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get("data");

  if (!dataParam) {
    document.body.innerHTML = '<div class="blocker-container"><h1>Error</h1><p>No se recibieron datos de bloqueo.</p></div>';
    return;
  }

  try {
    const data = JSON.parse(atob(dataParam));

    document.getElementById("site-info").textContent = `intentaste acceder a: ${data.rule_name} (${data.rule_url})`;
    document.getElementById("block-message").textContent = data.rule_message;
    document.getElementById("schedule-time").textContent = `${data.rule_hour_start} - ${data.rule_hour_end}`;
    document.getElementById("schedule-days").textContent = getShortDays(data.rule_days);
    document.getElementById("schedule-days").setAttribute("data-datetime-end", data.rule_datetime_end);
  } catch (error) {
    document.body.innerHTML = '<div class="blocker-container"><h1>Error</h1><p>Error al procesar los datos de bloqueo.</p></div>';
  }

  document.getElementById("go-back-btn").addEventListener("click", () => {
    window.history.back();
  });
});