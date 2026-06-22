# Sistema de Agendamento — Elis Miranda

Agendamento online premium para **elismiranda.com.br**, com design luxury-minimalista e integração WhatsApp via Evolution GO + n8n.

---

## Design & Identidade Visual

| Token           | Valor                          |
|-----------------|-------------------------------|
| Fonte headings  | Instrument Serif (Google Fonts)|
| Fonte corpo     | Plus Jakarta Sans (Google Fonts)|
| Rosa primário   | `#f472b6` → `#ec4899` (gradient)|
| Ouro            | `#d4af37`                     |
| Fundo           | `#faf9f7` → `#fdf2f8` (gradient)|
| Texto principal | `#2d1b35`                     |
| Card            | Glassmorphism (`rgba(255,255,255,0.75)` + blur 22px)|

---

## Arquivos do Projeto

```
src/
  agendamento-elis.html     ← versão standalone (zero dependências)
  scheduling-system.jsx     ← componente React reutilizável
docs/
  GUIA-AGENDAMENTO-ELIS.md  ← este arquivo
  EVOLUTION-GO-SETUP.md     ← setup Evolution GO passo a passo
  WEBHOOK-EVOLUTION-GO.md   ← exemplos de integração
env.example                 ← variáveis de ambiente necessárias
```

---

## 1. Opção Standalone (HTML puro)

Use `src/agendamento-elis.html` diretamente — sem frameworks, sem build.

```html
<!-- Hospedar no servidor ou GitHub Pages -->
<!-- Só precisa atualizar WEBHOOK_URL no <script> -->
const WEBHOOK_URL = 'https://seu-n8n.com/webhook/agendamento-elis';
```

Pode ser embeddado em qualquer página via iframe:

```html
<iframe
  src="https://elismiranda.com.br/agendamento.html"
  style="width:100%;border:none;min-height:700px;"
  title="Agendamento Elis Miranda"
></iframe>
```

---

## 2. Opção React / Next.js

```bash
# Copie o componente
cp src/scheduling-system.jsx components/SchedulingSystem.jsx
```

```jsx
// pages/agendar.jsx  (ou app/agendar/page.jsx no Next 13+)
import SchedulingSystem from '@/components/SchedulingSystem';

export default function AgendarPage() {
  return <SchedulingSystem />;
}
```

O componente injeta seu próprio CSS e carrega as fontes do Google Fonts automaticamente.

---

## 3. Configurar Webhook URL

Em **ambos** os arquivos, localize e atualize:

```javascript
const WEBHOOK_URL = 'https://seu-webhook-n8n.com/webhook/agendamento-elis';
//                          ↑ substitua pelo URL real do seu n8n
```

---

## 4. Configurar Evolution GO + n8n

Veja o guia completo: [`docs/EVOLUTION-GO-SETUP.md`](./EVOLUTION-GO-SETUP.md)

Resumo do fluxo n8n:

```
Webhook trigger (POST /agendamento-elis)
        ↓
Function node — extrai name, phone, date, time
        ↓
HTTP Request → Evolution GO API (envia WhatsApp para cliente)
        ↓
HTTP Request → Evolution GO API (notifica Elis do novo agendamento)
        ↓
Respond to Webhook → { "success": true }
```

Payload enviado pelo formulário:

```json
{
  "name":      "Maria Silva",
  "phone":     "5551999999999",
  "date":      "2026-06-25",
  "time":      "14:00",
  "message":   "*Nova Solicitação de Agendamento — Elis Miranda*\n...",
  "timestamp": "2026-06-20T10:30:00.000Z"
}
```

---

## 5. Variáveis de Ambiente

Copie `env.example` para `.env.local` e preencha:

```bash
cp env.example .env.local
```

Campos obrigatórios:

```env
EVOLUTION_GO_TOKEN=eyJhbGci...
EVOLUTION_GO_INSTANCE=elis-miranda
EVOLUTION_GO_PHONE=5551999999999   # número da Elis em formato internacional
N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/agendamento-elis
```

> Número no formato `5551999999999` = 55 (Brasil) + 51 (Porto Alegre) + número.
> Nunca use `+`, espaços ou hífens.

---

## 6. Personalizar Horários

No HTML ou no JSX, localize:

```javascript
// HTML: função generateTimes()
for (let h = 9; h <= 17; h++) { ... }

// JSX: constante no topo do arquivo
const timeSlots = getTimeSlots(9, 17);
```

Exemplos comuns:

```javascript
getTimeSlots(9, 17)   // 09:00–17:00 (padrão)
getTimeSlots(10, 19)  // 10:00–19:00
```

Para intervalos de 30 min, edite a função `getTimeSlots` em `scheduling-system.jsx`:

```javascript
function getTimeSlots(from = 9, to = 17) {
  const slots = [];
  for (let h = from; h <= to; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
    if (h < to) slots.push(`${String(h).padStart(2,'0')}:30`);
  }
  return slots;
}
```

---

## 7. Personalizar Dias Disponíveis

```javascript
// HTML: função generateDates()
// JSX: getBusinessDays(7)  ← altere o número de dias

getBusinessDays(14)  // próximos 14 dias úteis
```

Para incluir sábados, edite `getBusinessDays` e remova a condição:
```javascript
if (dow !== 0 && dow !== 6) ...  // remova a condição de sábado (6)
```

---

## 8. Troubleshooting

| Sintoma | Causa | Solução |
|---------|-------|---------|
| "Erro de conexão" | WEBHOOK_URL incorreta ou n8n inativo | Cheque URL e se o workflow está ativado |
| WhatsApp não entrega | Número com formato errado | Use `5551999999999` sem `+` |
| CORS error | Webhook sem header CORS | Configure `Access-Control-Allow-Origin: *` no n8n |
| Telefone desconecta | Celular offline por dias | Reconecte via QR Code no dashboard Evolution GO |

---

## 9. Checklist de Implementação

- [ ] `env.example` copiado e preenchido como `.env.local`
- [ ] Evolution GO: conta criada, instance criada, QR Code scaneado
- [ ] n8n: workflow criado, URL do webhook copiada
- [ ] `WEBHOOK_URL` atualizada no HTML/JSX
- [ ] Teste com número próprio antes de publicar
- [ ] Testado em mobile (320px mínimo)
- [ ] Testado em desktop
- [ ] Formulário embedado ou publicado em `elismiranda.com.br/agendar`

---

## 10. Próximos Passos (opcionais)

1. **Bloquear horários já ocupados** — integrar com Google Sheets ou banco para checar disponibilidade
2. **Lembrete 24h antes** — n8n com cron job + Evolution GO
3. **Painel da Elis** — tela simples para ver/confirmar/cancelar agendamentos
4. **Google Calendar sync** — n8n → Google Calendar node
5. **Email de confirmação** — n8n → Gmail/SendGrid node

---

**Última atualização**: junho 2026 · Desenvolvido para Elis Miranda Estética & Beleza
