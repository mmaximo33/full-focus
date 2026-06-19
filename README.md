# Full Focus - Site Blocker

## Restricción de sitios por horario

Extensión de Chrome para restringir el acceso a sitios web según franjas horarias y días específicos.

![Accessible description of the image](/docs/img/settings_rules.png)
![Accessible description of the image](/docs/img/settings_messages.png)
![Accessible description of the image](/docs/img/block.png)

## Características

- Restringe el acceso a sitios web según horarios configurables
- Dos tipos de bloqueo: **Dominio** (todo el sitio) o **Pattern** (rutas específicas)
- Soporta patrones con wildcards (`*`) y contains
- Muestra mensajes aleatorios personalizados cuando se bloquea el acceso
- Sincroniza la configuración con tu cuenta de Google
- Interfaz moderna en modo oscuro
- Modal flotante para agregar/editar reglas y mensajes

## Reglas precargadas

La extensión incluye 5 reglas por defecto:

| Sitio | Tipo | Patrones | Horario | Días |
|-------|------|----------|--------|-----|
| Facebook | Dominio | - | 08:00-17:00 | Lun-Vie |
| Instagram | Pattern | /reels/, /stories/ | 08:00-17:00 | Lun-Vie |
| Netflix | Dominio | - | 08:00-17:00 | Lun-Vie |
| TikTok | Pattern | /video/*, /@*/video | 08:00-17:00 | Lun-Vie |
| YouTube | Pattern | /shorts/ | 08:00-17:00 | Lun-Vie |

## Cómo funciona

- **Horario de bloqueo**: Indica la franja horaria donde el sitio está **bloqueado**
- Fuera de ese horario, el sitio es accesible
- Ejemplo: Si configuras 08:00-17:00, el sitio estará bloqueado de 8am a 5pm

### Tipo de coincidencia

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Dominio** | Bloquea todo el dominio | `facebook.com` → bloquea todo |
| **Pattern** | Solo bloquea las rutas especificadas | `youtube.com` + `/shorts/` → solo shorts |

### Patrones

Los patterns soportan dos formatos:

1. **Contains**: Texto que debe contener la URL
   - `/shorts/` → bloquea cualquier URL que contenga "/shorts/"
   - `/reels/` → bloquea cualquier URL que contenga "/reels/"

2. **Glob** (con wildcard `*`): Usa `*` para reemplazar cualquier texto
   - `/video/*` → bloquea `/video/123`, `/video/abc`, etc.
   - `/@*/video` → bloquea `/@usuario/video`

## Estructura de datos

### Reglas de restricción (restriction_rules)

| Campo | Descripción | Ejemplo |
|------|-------------|---------|
| `name` | Nombre del sitio | "Facebook" |
| `url` | Dominio del sitio | "https://facebook.com" |
| `url_type` | Tipo de coincidencia | "domain" o "pattern" |
| `patterns` | Array de patrones | ["/shorts/", "/reels/"] |
| `hour_start` | Hora de inicio de bloqueo | "08:00" |
| `hour_end` | Hora de fin de bloqueo | "17:00" |
| `days` | Días de bloqueo | ["Lunes","Martes","Miercoles","Jueves","Viernes"] |
| `enabled` | Regla activa | true/false |

### Mensajes (messages)

| Campo | Descripción | Ejemplo |
|------|-------------|---------|
| `message` | Texto del mensaje | "¿De verdad vas a perder más tiempo en %rule_name%?" |
| `enabled` | Mensaje activo | true/false |

### Variables disponibles en mensajes

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `%rule_name%` | Nombre del sitio | "Facebook" |
| `%rule_url%` | URL completa | "https://facebook.com" |
| `%rule_hour_start%` | Hora de inicio | "08:00" |
| `%rule_hour_end%` | Hora de fin | "17:00" |
| `%rule_days%` | Días (formato corto) | "Lun, Mar, Mie" |
| `%rule_datetime_end%` | Fecha y hora de fin | "14/06/2026 17:00" |

## Instalación

### Opción 1: Desde código fuente

1. Clona el repositorio:
   ```bash
   git clone https://github.com/mmaximo33/full-focus.git
   ```
2. Abre Chrome y navega a `chrome://extensions/`
3. Activa el **"Modo de desarrollador"** (esquina superior derecha)
4. Haz clic en **"Cargar descomprimida"**
5. Selecciona la carpeta `full-focus`
6. La extensión se instalará y se abrirá automáticamente la página de configuración
7. Para acceder nuevamente, haz clic en el ícono de la extensión


### Repositorio

- **GitHub**: https://github.com/mmaximo33/full-focus

## Uso

### Agregar una regla

1. Haz clic en el ícono de Site Blocker en la barra de herramientas
2. Haz clic en **"+ Agregar Regla"**
3. Completa el formulario:
   - Nombre del sitio
   - Dominio (ej: facebook.com)
   - Hora de inicio y fin
   - Días de bloqueo
   - Tipo de coincidencia (Dominio o Pattern)
   - Patrones (si es Pattern)
4. Haz clic en "Agregar Regla"

### Editar una regla

1. En la tabla de reglas, haz clic en **"Editar"**
2. Se abrirá el modal con los datos cargados
3. Modifica los campos deseados
4. Los patrones se preservan al cambiar entre Dominio y Pattern

### Agregar patrones

1. Selecciona **"Pattern"** como tipo de coincidencia
2. Agrega patrones usando el campo de texto + botón [+]
3. Usa `/ruta/` para contains o `/ruta/*` para glob

Ejemplos de patrones:
- `/shorts/` → bloquea todos los shorts de YouTube
- `/reels/` → bloquea todos los reels de Instagram
- `/video/*` → bloquea todas las rutas bajo /video/
- `/watch?v=*` → bloquea videos individuales

### Agregar/editar mensajes

1. Ve a la pestaña **"Mensajes"**
2. Haz clic en **"+ Agregar Mensaje"**
3. Escribe tu mensaje usando las variables disponibles
4. Haz clic en "Agregar Mensaje"


## Permisos utilizados

- `storage` - Para guardar la configuración sincronizada
- `tabs` - Para monitorear y redirigir pestañas
- `<all_urls>` - Para monitorear todos los sitios

## Notas

- Los datos se sincronizan con tu cuenta de Google
- Si un sitio no está en las reglas, el acceso es completamente libre
- Los mensajes se muestran de forma aleatoria cada vez que se bloquea un sitio
- Los días se muestran en formato corto (Lun, Mar, Mie, etc.)
- Al editar una regla, los patrones se preservan aunque cambies el tipo de coincidencia

## Licencia

MIT
