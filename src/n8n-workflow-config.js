// 📌 WORKFLOW N8N - CONFIGURAÇÃO PARA AGENDAMENTO ELIS
// 
// Este é um exemplo de como estruturar seu workflow no n8n
// Copie a estrutura abaixo como referência

{
  "name": "Agendamento Elis Miranda",
  "description": "Recebe agendamentos do site e envia confirmação via WhatsApp",
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
        "functionCode": "// Processar dados do agendamento\nreturn {\n  name: $json.body.name,\n  phone: $json.body.phone,\n  date: $json.body.date,\n  time: $json.body.time,\n  timestamp: $json.body.timestamp\n};"
      },
      "id": "function_process",
      "name": "Processar Dados",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "service": "whatsapp",
        "resource": "message",
        "operation": "send",
        "phoneNumber": "=+55{{ $json.phone }}",
        "messageText": "=Oi {{ $json.name }}! 👋\n\nSeu agendamento foi confirmado:\n📅 Data: {{ $json.date }}\n⏰ Horário: {{ $json.time }}\n\nQualquer dúvida, é só chamar! 💫\n\n- Elis Miranda"
      },
      "id": "whatsapp_send",
      "name": "Enviar WhatsApp",
      "type": "n8n-nodes-base.whatsapp",
      "typeVersion": 1,
      "position": [650, 300]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://seu-backend.com/api/agendamentos",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "Bearer YOUR_API_KEY"
            }
          ]
        },
        "sendBody": true,
        "bodyContentType": "application/json",
        "body": "={\n  \"name\": \"{{ $json.name }}\",\n  \"phone\": \"{{ $json.phone }}\",\n  \"date\": \"{{ $json.date }}\",\n  \"time\": \"{{ $json.time }}\",\n  \"status\": \"pendente\",\n  \"createdAt\": \"{{ $json.timestamp }}\"\n}"
      },
      "id": "http_save_db",
      "name": "Salvar no Banco (Opcional)",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [850, 300]
    },
    {
      "parameters": {
        "respondWithOptions": {
          "option": "responseNode"
        }
      },
      "id": "response_success",
      "name": "Responder com Sucesso",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1050, 300]
    }
  ],
  "connections": {
    "webhook_trigger": {
      "main": [
        [
          {
            "node": "function_process",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "function_process": {
      "main": [
        [
          {
            "node": "whatsapp_send",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "whatsapp_send": {
      "main": [
        [
          {
            "node": "response_success",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}


/* 
╔══════════════════════════════════════════════════════════════════╗
║                  INSTRUÇÕES DE IMPLEMENTAÇÃO                     ║
╚══════════════════════════════════════════════════════════════════╝

OPÇÃO 1: Via UI do n8n (recomendado para iniciantes)
═══════════════════════════════════════════════════════════════════

1. Acesse seu n8n dashboard
2. Clique em "New Workflow"
3. Adicione nós clicando no "+" e pesquisando:
   
   a) WEBHOOK (Trigger)
      - Path: "agendamento-elis"
      - Método: POST
      - Ative "Webhook"
   
   b) FUNCTION (Processar)
      - Cole o código JavaScript acima
   
   c) WHATSAPP (Enviar mensagem)
      - Selecione sua integração WhatsApp
      - Template de mensagem com variáveis {{ $json.name }}, etc
   
   d) HTTP REQUEST (Salvar em banco - opcional)
      - Aponte para sua API ou Google Sheets
   
   e) RESPOND TO WEBHOOK
      - Responda com JSON: { "success": true }

4. Conecte os nós com as setas
5. Teste clicando em "Test Workflow"
6. Ative o workflow com o botão superior
7. Copie a URL do webhook


OPÇÃO 2: Via JSON Import (mais rápido)
═══════════════════════════════════════════════════════════════════

1. No n8n, vá em Menu > "Import from File"
2. Cole todo o conteúdo JSON acima
3. Customize os nós (especialmente WhatsApp e URLs)
4. Teste e ative


CONFIGURAÇÃO WHATSAPP
═══════════════════════════════════════════════════════════════════

Se você usa Evolution GO:
- Configure credenciais de Evolution no n8n
- Use nó "Evolution GO" em vez de WhatsApp Business

Se você usa WhatsApp Business API:
- Configure token de acesso
- Configure ID do número de telefone
- Certifique-se que está em produção (não sandbox)


VARIÁVEIS DISPONÍVEIS
═══════════════════════════════════════════════════════════════════

{{ $json.name }}      - Nome do cliente
{{ $json.phone }}     - Telefone com +55
{{ $json.date }}      - Data (YYYY-MM-DD)
{{ $json.time }}      - Horário (HH:MM)
{{ $json.timestamp }} - Data/hora do agendamento


EXEMPLO DE RESPOSTA ESPERADA (do webhook)
═══════════════════════════════════════════════════════════════════

{
  "success": true,
  "message": "Agendamento recebido com sucesso",
  "id": "agendamento_123",
  "status": "enviado"
}


DICAS IMPORTANTES
═══════════════════════════════════════════════════════════════════

⚠️  SEGURANÇA:
   - Não exponha tokens de API no código frontend
   - Use variáveis de ambiente no n8n
   - Valide dados no backend antes de salvar

✅ TESTES:
   - Teste com um número de WhatsApp seu primeiro
   - Use a ferramenta "Test Webhook" do n8n
   - Verifique logs para erros

🔄 MELHORIAS FUTURAS:
   - Enviar também por email
   - Salvar em Google Sheets ou banco
   - Enviar lembrete 24h antes
   - Bloquear horários já agendados
*/
