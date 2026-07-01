// WORKFLOW N8N - AGENDAMENTO ELIS MIRANDA (WAHA)
// Importar no n8n: Menu > Import from File > colar o JSON abaixo
// WAHA: https://evo.ezstudio.com.br | Session: elis-miranda

{
  "name": "Agendamento Elis Miranda",
  "description": "Recebe agendamentos do site e envia confirmação via WhatsApp (WAHA)",
  "nodes": [
    {
      "parameters": {
        "path": "agendamento-elis",
        "responseMode": "responseNode",
        "responseData": "first",
        "options": {}
      },
      "id": "webhook_trigger",
      "name": "Webhook - Receber Agendamento",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "functionCode": "// Normaliza telefone: remove +55 e não-dígitos, garante formato para WAHA\nconst raw = ($json.body.phone || '').replace(/\\D/g, '');\nconst phone = raw.startsWith('55') ? raw : '55' + raw;\nreturn {\n  name: $json.body.name,\n  phone: phone,\n  chatId: phone + '@c.us',\n  date: $json.body.date,\n  time: $json.body.time,\n  service: $json.body.service || '',\n  duration: $json.body.duration || '',\n  timestamp: $json.body.timestamp\n};"
      },
      "id": "function_process",
      "name": "Processar Dados",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://evo.ezstudio.com.br/api/sendText",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "X-Api-Key",
              "value": "evoezstudiokey2026"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyContentType": "application/json",
        "jsonBody": "={\n  \"session\": \"elis-miranda\",\n  \"chatId\": \"{{ $json.chatId }}\",\n  \"text\": \"Oi {{ $json.name }}! \\n\\nSeu agendamento foi confirmado:\\n Data: {{ $json.date }}\\n Horário: {{ $json.time }}{{ $json.service ? '\\n Serviço: ' + $json.service : '' }}{{ $json.duration ? '\\n Duração: ' + $json.duration : '' }}\\n\\nQualquer dúvida, é só chamar!\\n\\n- Elis Miranda\"\n}"
      },
      "id": "waha_send",
      "name": "Enviar WhatsApp via WAHA",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [650, 300]
    },
    {
      "parameters": {
        "respondWithOptions": {
          "values": {
            "string": [
              {
                "name": "success",
                "value": "true"
              }
            ]
          }
        }
      },
      "id": "response_success",
      "name": "Responder com Sucesso",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [850, 300]
    }
  ],
  "connections": {
    "webhook_trigger": {
      "main": [
        [{ "node": "function_process", "type": "main", "index": 0 }]
      ]
    },
    "function_process": {
      "main": [
        [{ "node": "waha_send", "type": "main", "index": 0 }]
      ]
    },
    "waha_send": {
      "main": [
        [{ "node": "response_success", "type": "main", "index": 0 }]
      ]
    }
  }
}


/*
╔══════════════════════════════════════════════════════════════════╗
║              INSTRUÇÕES DE CONFIGURAÇÃO (WAHA)                   ║
╚══════════════════════════════════════════════════════════════════╝

INFRAESTRUTURA
═══════════════════════════════════════════════════════════════════
  WAHA:  https://evo.ezstudio.com.br
  n8n:   https://flow.ezstudio.com.br
  Sessão WAHA para Elis: elis-miranda (⚠ pendente — conectar antes)

COMO CONECTAR A SESSÃO elis-miranda NO WAHA
═══════════════════════════════════════════════════════════════════
  1. Acesse https://evo.ezstudio.com.br/dashboard
  2. Clique em "Start Session" ou "New Session"
  3. Nome da sessão: elis-miranda
  4. Escaneie o QR Code com o WhatsApp do número 5551995964848
  5. Aguarde status = WORKING

ENDPOINT WAHA UTILIZADO
═══════════════════════════════════════════════════════════════════
  POST https://evo.ezstudio.com.br/api/sendText
  Header: X-Api-Key: evoezstudiokey2026
  Body:
  {
    "session": "elis-miranda",
    "chatId":  "5551995964848@c.us",   ← formato obrigatório
    "text":    "mensagem aqui"
  }

IMPORTAR O WORKFLOW NO N8N
═══════════════════════════════════════════════════════════════════
  1. Acesse https://flow.ezstudio.com.br
  2. Menu > Import from File
  3. Cole o JSON acima (tudo entre as chaves { ... })
  4. Revise o nó "Processar Dados" se precisar de campos extras
  5. Ative o workflow
  6. Webhook URL final: https://flow.ezstudio.com.br/webhook/agendamento-elis

SESSÕES WAHA DISPONÍVEIS
═══════════════════════════════════════════════════════════════════
  ✅ ezstudio    — conectada
  ✅ Bezclean    — conectada
  ⏳ elis-miranda — PENDENTE (número: 5551995964848)

VARIÁVEIS DO WEBHOOK (enviadas pelo site)
═══════════════════════════════════════════════════════════════════
  body.name      - Nome do cliente
  body.phone     - Telefone (com ou sem +55, o nó normaliza)
  body.date      - Data formatada (ex: "23/06/2026")
  body.time      - Horário (ex: "14:30")
  body.service   - Serviço escolhido (opcional)
  body.duration  - Duração (opcional)
  body.timestamp - ISO timestamp do agendamento

TESTE RÁPIDO (curl)
═══════════════════════════════════════════════════════════════════
  curl -X POST https://evo.ezstudio.com.br/api/sendText \
    -H "X-Api-Key: evoezstudiokey2026" \
    -H "Content-Type: application/json" \
    -d '{"session":"elis-miranda","chatId":"5551995964848@c.us","text":"Teste WAHA ok!"}'
*/
