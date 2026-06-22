# 🚀 EVOLUTION GO - GUIA COMPLETO PARA ELIS MIRANDA

## O que é Evolution GO?

Evolution GO é uma **API moderna para WhatsApp Business** que facilita muito a integração comparada com o Twilio/Meta oficial. É mais simples, mais barato e perfeito para pequenos negócios como Bez Clean e Elis Miranda.

---

## 📋 PASSO 1: Preparar o Número da Elis

### Informações para coletar:

**Elis precisa ter:**
- ✅ Um número WhatsApp do Brasil (Porto Alegre, RS)
- ✅ Acesso ao WhatsApp no telefone
- ✅ Pode ser número pessoal mesmo (não precisa de Business Account no início)

### Formato do número:
```
Padrão: +55 51 99999-9999
Sem formatação: 5551999999999
Com +: +5551999999999

Onde:
- 55 = Código do Brasil
- 51 = Código de Porto Alegre
- 99999-9999 = Número do celular
```

**⚠️ Aviso Importante:**
O número debe estar **ativo e operacional** no celular dela no momento da configuração (QR Code scan).

---

## 🔧 PASSO 2: Criar Conta Evolution GO

### Opção A: Plataforma Evolution (Recomendado)

1. Acesse: **https://dashboard.evolution-api.com**
2. Clique em **"Sign Up"** / **"Criar Conta"**
3. Preencha:
   - Email: (qualquer email)
   - Senha: (forte)
   - Empresa: "Elis Miranda" ou "Bez Clean"
4. Confirme email
5. Faça login

### Opção B: Self-hosted (Avançado)

Se você quer rodar Evolution GO no seu servidor n8n:

```bash
# Docker (mais fácil)
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=sua_chave_secreta \
  --name evolution-go \
  evolution-api/evolution
```

---

## 📱 PASSO 3: Criar Instance para Elis

### No Dashboard Evolution GO:

1. **Clique em "New Instance"** ou **"Nova Instância"**
2. **Nome da instância**: `elis-miranda` (sem espaços)
3. **Settings** (deixe padrão por enquanto):
   - Webhook URL: (deixe em branco por agora)
   - Token: será gerado automaticamente
4. **Clique em "Create"**

### Você receberá:
```
Instance ID: elis-miranda
Token: eyJhbGci...xxx (salve bem!)
QR Code URL: [para scan]
```

---

## 📲 PASSO 4: Fazer QR Code Scan

### IMPORTANTE: Elis precisa fazer isso!

1. **No dashboard**, clique na instance `elis-miranda`
2. **Procure por "QR Code"** ou **"Conectar Celular"**
3. **Elis abre o WhatsApp** no celular dela
4. **Menu WhatsApp → Linked Devices → Connect Phone**
5. **Aponta câmera pro QR Code** e scanneia

⏳ **Aguarde 10-20 segundos** até aparecer "Connected" no dashboard

---

## 🔑 PASSO 5: Obter Credenciais

Após conectar o telefone, você terá:

```
Instance ID: elis-miranda
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Phone Number: 5551999999999
Status: CONNECTED ✅
```

**Salve esses dados com segurança!**

---

## ⚙️ PASSO 6: Configurar Webhook no n8n

### No seu n8n workflow:

1. **Adicione nó HTTP Request** (após receber dados)
2. **Configure:**

```
Method: POST
URL: https://api.evolution-api.com/message/sendText

Headers:
- Content-Type: application/json
- Authorization: Bearer eyJhbGci...xxx (seu token)

Body (JSON):
{
  "number": "5551999999999",
  "text": "Oi {{name}}! 👋\n\nSeu agendamento foi confirmado:\n📅 Data: {{date}}\n⏰ Horário: {{time}}\n\nQualquer dúvida, é só chamar! 💫\n\n- Elis Miranda"
}
```

### Ou use nó específico se existir:

Se Evolution GO tem nó nativo no n8n:
- **Busque por "Evolution"** nas integrações
- **Configure com token e instance ID**
- **Pronto!**

---

## 🧪 PASSO 7: Testar Integração

### Teste no Dashboard Evolution:

1. Vá para **"Test"** ou **"API Test"**
2. **Método**: POST
3. **Endpoint**: `/message/sendText`
4. **Body**:
```json
{
  "number": "5551999999999",
  "text": "Teste de mensagem! ✅"
}
```
5. Clique **"Send"**
6. **Elis recebe mensagem no WhatsApp** ✅

---

## 📊 Monitorar Mensagens

### No Dashboard Evolution:

1. **Clique na instance** → **"Logs"** ou **"Messages"**
2. Veja histórico de mensagens enviadas
3. Status de cada uma (sent, delivered, read)

---

## 🛡️ Segurança & Boas Práticas

### ✅ FAÇA:
- Salve token em variável de ambiente (`.env`)
- Use HTTPS em produção
- Valide dados antes de enviar
- Monitore logs regularmente
- Faça backup do token

### ❌ NÃO FAÇA:
- Não exponha token no código frontend
- Não compartilhe token publicamente
- Não use HTTP (sempre HTTPS)
- Não salve token em Git/GitHub

### Exemplo .env:
```
EVOLUTION_GO_INSTANCE=elis-miranda
EVOLUTION_GO_TOKEN=eyJhbGci...xxx
EVOLUTION_GO_PHONE=5551999999999
WEBHOOK_URL=https://seu-n8n.com/webhook/agendamento-elis
```

---

## 💰 Custos

### Evolution GO (Aproximado):

| Plano | Preço | Limite |
|-------|-------|--------|
| Free | Grátis | 100 msg/mês |
| Starter | R$ 50/mês | 1000 msg/mês |
| Pro | R$ 150/mês | 10.000 msg/mês |
| Enterprise | Custom | Ilimitado |

**Para Elis:**
- Agendamento = ~20-30 mensagens/mês
- Plano Free ou Starter é suficiente

---

## 🔄 Fluxo Completo (Resumo)

```
Cliente preenche agendamento
        ↓
Envia dados ao webhook n8n
        ↓
n8n recebe e processa
        ↓
n8n faz POST para Evolution GO
        ↓
Evolution GO envia msg WhatsApp
        ↓
Elis recebe confirmação no WhatsApp ✅
```

---

## ⚠️ Troubleshooting

### "Connection Failed"
- Verifique se token está correto
- Confirme se instance está "CONNECTED" no dashboard
- Tente reconectar via QR Code

### "Invalid Phone Number"
- Formato deve ser: `5551999999999`
- Sem +, sem espaços, sem formatação
- Verifique código de área (51 = Porto Alegre)

### "Webhook não recebe mensagem"
- Configure webhook URL no dashboard Evolution
- Certifique-se que sua URL é acessível (não localhost)
- Use HTTPS, não HTTP

### "Telefone desconectou"
- Evolution GO desconecta se celular fica offline por muito tempo
- Elis precisa deixar WhatsApp aberto pelo menos 1x por semana
- Ou reconecte via QR Code

---

## 📞 Suporte

### Documentação Oficial:
- https://docs.evolution-api.com
- https://github.com/EvolutionAPI/evolution-api

### Community:
- Discord oficial
- GitHub Issues
- Email: support@evolution-api.com

---

## ✅ CHECKLIST FINAL

- [ ] Conta Evolution GO criada
- [ ] Instance `elis-miranda` criada
- [ ] QR Code scaneado por Elis
- [ ] Status mostra "CONNECTED"
- [ ] Token salvo com segurança
- [ ] Webhook configurado no n8n
- [ ] Teste enviado com sucesso
- [ ] Elis recebeu mensagem
- [ ] Credenciais em variáveis .env
- [ ] Documentação salva

---

**Pronto para usar! 🚀 Agora o agendamento vai enviar WhatsApp automático pra Elis em Porto Alegre!**
