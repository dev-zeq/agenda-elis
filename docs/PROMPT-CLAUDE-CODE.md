# 🎨 PROMPT PARA CLAUDE CODE - CUSTOMIZAÇÃO AGENDAMENTO ELIS

## COPIE E COLE TUDO ISTO NO CLAUDE CODE:

---

Preciso que você customize o sistema de agendamento para o site da Elis Miranda (elismiranda.com.br) com o estilo visual premium dela.

**INFORMAÇÕES IMPORTANTES:**
- Nome: Elis Miranda (estética e beleza)
- Localização: Porto Alegre, RS
- Estilo visual do site: Luxury minimalista, cores claras com destaques em tons quentes/rosados
- Tipografia preferida: Instrument Serif (títulos) + Plus Jakarta Sans (corpo)

**TAREFAS:**

1. **CUSTOMIZAR VISUAL DO AGENDAMENTO:**
   - Substitua a paleta de cores cinza (slate) por: tons rose/pink para botões, fundo branco ou off-white, acentos em ouro/champagne
   - Use a tipografia: "Instrument Serif" para títulos grandes, "Plus Jakarta Sans" para textos
   - Adicione efeito glassmorphism (frost effect) no card do formulário
   - Aumente o spacing/padding para parecer mais premium
   - Adicione sombras sofisticadas (não muito pesadas)
   - Animações suaves nas transições de steps

2. **INTEGRAÇÃO EVOLUTION GO (WHATSAPP):**
   - Crie arquivo de configuração com as credenciais
   - Número dela: precisa ser validado em formato internacional (+55 51 XXXXX-XXXX - Porto Alegre, RS)
   - Instrua como configurar a instance no Evolution GO
   - Crie exemplo de webhook que funciona com Evolution GO (diferente de WhatsApp Business)

3. **ENTREGAR:**
   - HTML/JSX customizado com novo design
   - Documento passo-a-passo: "Como configurar Evolution GO para Elis"
   - Arquivo de configuração (config.env ou similar) com campos para:
     * Evolution GO Instance ID
     * Evolution GO Token
     * Número WhatsApp da Elis
     * URL do webhook

**REFERÊNCIA DE DESIGN:**
- Cores sugeridas: Rose (#e91e63 ou #f472b6), Ouro (#d4af37), Branco (#ffffff), Off-white (#faf9f7)
- Fonte: Google Fonts (Instrument Serif + Plus Jakarta Sans)
- Efeito: Card com border-radius generoso, sombra suave, fundo semi-transparente
- Mobile-first, responsivo até 320px

Faça isso ficar tão bonito quanto o site da Elis! ✨

---

## 📋 INFORMAÇÕES ADICIONAIS (Copie também):

**Sobre Evolution GO:**
Evolution GO é uma plataforma que oferece API WhatsApp Business de forma mais simples que o Twilio/Meta oficial.

**Para configurar Elis em Porto Alegre:**
1. Ela precisa ter um número WhatsApp do Brasil (RS)
2. Criar conta em https://evolution-api.com (ou similar)
3. Gerar uma "instance" no painel
4. Fazer QR Code scan do WhatsApp dela
5. Copiar o Instance ID e Token para a config

**Formato do número:**
- Sem formatação: 5551999999999 (55 = Brasil, 51 = Porto Alegre, 9XXXXX-XXXX = número)
- Com + : +5551999999999
- No Evolution GO ele já formata automático

**Webhook esperado pelo Evolution GO:**
```
POST /webhook/agendamento-elis
Headers:
  - Authorization: Bearer TOKEN_EVOLUTION_GO
Body:
  {
    "instance": "elis-miranda",
    "message": "...",
    "to": "5551999999999",
    "type": "text"
  }
```

---

## ✅ CHECKLIST DO QUE DEVE SER ENTREGUE:

- [ ] Arquivo HTML/JSX com novo design
- [ ] Cores rose/ouro/premium implementadas
- [ ] Tipografia Instrument Serif + Plus Jakarta Sans
- [ ] Glassmorphism effect no card
- [ ] Animações suaves
- [ ] Responsivo e mobile-friendly
- [ ] Documento: "COMO-CONFIGURAR-EVOLUTION-GO-ELIS.md"
- [ ] Arquivo: "evolution-go-config.env"
- [ ] Exemplo de webhook pra Evolution GO
- [ ] Instruções passo-a-passo em português

---

**Não esqueça:** O número da Elis em Porto Alegre segue o padrão: +55 51 XXXXX-XXXX
(você pedirá o número exato a ela para completar)

Obrigado! 🚀
