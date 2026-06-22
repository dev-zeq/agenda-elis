// 📲 WEBHOOK EVOLUTION GO - EXEMPLO PARA n8n

// ═══════════════════════════════════════════════════════════════════
// OPÇÃO 1: VIA HTTP REQUEST NODE (Recomendado)
// ═══════════════════════════════════════════════════════════════════

/*

No n8n, adicione um nó HTTP Request APÓS receber os dados do agendamento:

┌─────────────────────┐
│  WEBHOOK (trigger)  │
└──────────┬──────────┘
           │
     ┌─────▼─────┐
     │ FUNCTION  │ (processar dados)
     └─────┬─────┘
           │
  ┌────────▼────────┐
  │ HTTP REQUEST    │ ← AQUI ENVIAMOS PRA EVOLUTION GO
  └────────┬────────┘
           │
    ┌──────▼──────┐
    │ RESPOND 200 │
    └─────────────┘

CONFIGURAÇÃO DO NÓ HTTP REQUEST:

Method: POST

URL: https://api.evolution-api.com/message/sendText

Headers:
┌─────────────────────────────────────────┐
│ Content-Type    application/json        │
│ Authorization   Bearer {seu_token}      │
└─────────────────────────────────────────┘

Body (Raw - JSON):
{
  "number": "5551999999999",
  "text": "Oi {{name}}! 👋\n\nSeu agendamento foi confirmado:\n📅 Data: {{date}}\n⏰ Horário: {{time}}\n\nQualquer dúvida, é só chamar! 💫\n\n- Elis Miranda"
}

Ou com variáveis n8n (melhor):
{
  "number": "{{$json.phone}}",
  "text": "Oi {{$json.name}}! 👋\n\nSeu agendamento foi confirmado:\n📅 Data: {{$json.date}}\n⏰ Horário: {{$json.time}}\n\nQualquer dúvida, é só chamar! 💫\n\n- Elis Miranda"
}

*/


// ═══════════════════════════════════════════════════════════════════
// OPÇÃO 2: VIA JAVASCRIPT (Node.js)
// ═══════════════════════════════════════════════════════════════════

/*

Se você está rodando seu próprio servidor (Express, Next.js, etc):

```javascript
const axios = require('axios');

async function sendWhatsAppMessage(name, phone, date, time) {
  const evolutionToken = process.env.EVOLUTION_GO_TOKEN;
  const phoneNumber = phone; // Format: 5551999999999

  const message = `Oi ${name}! 👋\n\nSeu agendamento foi confirmado:\n📅 Data: ${date}\n⏰ Horário: ${time}\n\nQualquer dúvida, é só chamar! 💫\n\n- Elis Miranda`;

  try {
    const response = await axios.post(
      'https://api.evolution-api.com/message/sendText',
      {
        number: phoneNumber,
        text: message,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${evolutionToken}`,
        },
      }
    );

    console.log('WhatsApp enviado:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Usar em sua API:
app.post('/api/agendamentos', async (req, res) => {
  const { name, phone, date, time } = req.body;
  
  // Salvar no banco...
  const agendamento = await Agendamento.create({ name, phone, date, time });
  
  // Enviar WhatsApp
  await sendWhatsAppMessage(name, phone, date, time);
  
  return res.json({ success: true, id: agendamento._id });
});
```

*/


// ═══════════════════════════════════════════════════════════════════
// OPÇÃO 3: CURL (Para testar rápido)
// ═══════════════════════════════════════════════════════════════════

/*

Cole no terminal para testar:

curl -X POST https://api.evolution-api.com/message/sendText \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "number": "5551999999999",
    "text": "Teste de mensagem ✅"
  }'

*/


// ═══════════════════════════════════════════════════════════════════
// OPÇÃO 4: PYTHON (Se preferir)
// ═══════════════════════════════════════════════════════════════════

/*

import requests

def send_whatsapp_message(name, phone, date, time):
    token = "seu_token_aqui"
    url = "https://api.evolution-api.com/message/sendText"
    
    message = f"""Oi {name}! 👋

Seu agendamento foi confirmado:
📅 Data: {date}
⏰ Horário: {time}

Qualquer dúvida, é só chamar! 💫

- Elis Miranda"""
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    payload = {
        "number": phone,
        "text": message
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

# Usar:
result = send_whatsapp_message(
    name="Maria Silva",
    phone="5551999999999",
    date="2026-06-23",
    time="14:00"
)
print(result)

*/


// ═══════════════════════════════════════════════════════════════════
// RESPOSTA ESPERADA DO EVOLUTION GO
// ═══════════════════════════════════════════════════════════════════

/*

Se tudo der certo, você recebe:

{
  "status": "success",
  "message": "Message sent successfully",
  "id": "msg_123456789",
  "timestamp": "2026-06-19T10:30:00Z"
}

Se der erro, você recebe:

{
  "status": "error",
  "error": "Invalid phone number",
  "code": "INVALID_PHONE"
}

*/


// ═══════════════════════════════════════════════════════════════════
// N8N: WORKFLOW COMPLETO
// ═══════════════════════════════════════════════════════════════════

/*

PASSO A PASSO NO N8N:

1️⃣ WEBHOOK (Trigger)
   ├─ Path: agendamento-elis
   ├─ Method: POST
   └─ Activar: ✅

2️⃣ FUNCTION (Processar)
   └─ Code:
   return {
     name: $json.body.name,
     phone: $json.body.phone,
     date: $json.body.date,
     time: $json.body.time,
   };

3️⃣ HTTP REQUEST (Enviar WhatsApp)
   ├─ Method: POST
   ├─ URL: https://api.evolution-api.com/message/sendText
   ├─ Headers:
   │  ├─ Content-Type: application/json
   │  └─ Authorization: Bearer YOUR_TOKEN
   ├─ Body Mode: JSON
   └─ Body:
      {
        "number": "=5551999999999",
        "text": "=Oi {{ $json.name }}! 👋\n\nSeu agendamento foi confirmado:\n📅 Data: {{ $json.date }}\n⏰ Horário: {{ $json.time }}\n\nQualquer dúvida, é só chamar! 💫\n\n- Elis Miranda"
      }

4️⃣ RESPOND TO WEBHOOK
   └─ Body:
      {
        "success": true,
        "message": "Agendamento recebido!"
      }

*/


// ═══════════════════════════════════════════════════════════════════
// VARIÁVEIS DE AMBIENTE (.env)
// ═══════════════════════════════════════════════════════════════════

/*

EVOLUTION_GO_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EVOLUTION_GO_INSTANCE=elis-miranda
EVOLUTION_GO_PHONE=5551999999999
WEBHOOK_URL=https://seu-n8n.com/webhook/agendamento-elis

*/


// ═══════════════════════════════════════════════════════════════════
// TESTE FINAL (Checklist)
// ═══════════════════════════════════════════════════════════════════

/*

✅ Conta Evolution GO criada
✅ Instance conectada (status CONNECTED)
✅ Token obtido e salvo
✅ Webhook testado via curl/Postman
✅ n8n conectado ao Evolution GO
✅ Mensagem de teste enviada
✅ Elis recebeu no WhatsApp dela ✅
✅ Sistema pronto para produção 🚀

*/


// ═══════════════════════════════════════════════════════════════════
// TROUBLESHOOTING RÁPIDO
// ═══════════════════════════════════════════════════════════════════

/*

❌ "Unauthorized" (erro 401)
   → Token inválido ou expirado
   → Regenere o token no dashboard Evolution GO

❌ "Invalid phone number" (erro 400)
   → Formato deve ser: 5551999999999
   → Sem +, sem espaços, sem hífens
   → Verifique se número começa com 55

❌ "Instance not found" (erro 404)
   → Instance não está CONNECTED
   → Faça QR Code scan novamente
   → Verifique nome da instance

❌ "Rate limit exceeded" (erro 429)
   → Você está enviando muitas mensagens
   → Aguarde alguns minutos
   → Considere upgrade de plano

❌ Webhook não dispara
   → Verifique URL do webhook no Dashboard Evolution
   → URL deve ser pública (HTTPS)
   → Teste com curl primeiro

*/
