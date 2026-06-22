// 📚 EXEMPLOS DE INTEGRAÇÃO - SISTEMA DE AGENDAMENTO ELIS

// ═══════════════════════════════════════════════════════════════════
// 1️⃣ INTEGRAÇÃO EM PÁGINA HTML SIMPLES (static)
// ═══════════════════════════════════════════════════════════════════

/*

Copie e cole isto no seu HTML:

<section id="agendamento" class="py-16 bg-slate-50">
  <div class="container mx-auto px-4">
    <h2 class="text-3xl font-light mb-8">Agende seu atendimento</h2>
    <iframe 
      src="/agendamento.html"
      width="100%"
      height="600"
      frameborder="0"
      style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"
    ></iframe>
  </div>
</section>

*/


// ═══════════════════════════════════════════════════════════════════
// 2️⃣ INTEGRAÇÃO EM NEXT.JS / REACT
// ═══════════════════════════════════════════════════════════════════

/*

// pages/agendamento.jsx
import React from 'react';
import SchedulingSystem from '@/components/SchedulingSystem';
import Head from 'next/head';

export default function AgendamentoPage() {
  return (
    <>
      <Head>
        <title>Agende seu Atendimento - Elis Miranda</title>
        <meta name="description" content="Agende seu atendimento de estética com Elis Miranda" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <SchedulingSystem />
      </div>
    </>
  );
}

*/


// ═══════════════════════════════════════════════════════════════════
// 3️⃣ INTEGRAÇÃO COM API PRÓPRIA (OPCIONAL)
// ═══════════════════════════════════════════════════════════════════

/*

Se você quer salvar agendamentos em banco de dados próprio:

// API: pages/api/agendamentos.js
import { connectDB } from '@/lib/mongodb';
import Agendamento from '@/models/Agendamento';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const agendamento = await Agendamento.create({
      name: req.body.name,
      phone: req.body.phone,
      date: req.body.date,
      time: req.body.time,
      status: 'pendente',
      createdAt: new Date(),
    });

    // Aqui você também pode chamar o webhook n8n
    await fetch('https://seu-n8n.com/webhook/agendamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    return res.status(201).json({
      success: true,
      id: agendamento._id,
    });
  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: 'Erro ao criar agendamento' });
  }
}

*/


// ═══════════════════════════════════════════════════════════════════
// 4️⃣ INTEGRAÇÃO COM GOOGLE SHEETS (VIA n8n)
// ═══════════════════════════════════════════════════════════════════

/*

No seu workflow n8n, adicione após o WhatsApp:

[WEBHOOK] → [FUNCTION] → [WHATSAPP] → [GOOGLE SHEETS]

Configuração do nó Google Sheets:
- Authentication: Conecte sua conta Google
- Operation: Append
- Spreadsheet ID: (copie da URL da sua planilha)
- Sheet: "Agendamentos"
- Columns:
  - A: name
  - B: phone
  - C: date
  - D: time
  - E: timestamp
  - F: status (padrão: "pendente")

*/


// ═══════════════════════════════════════════════════════════════════
// 5️⃣ CUSTOMIZAR WEBHOOK URL DINAMICAMENTE
// ═══════════════════════════════════════════════════════════════════

/*

Se quer que o componente React leia a URL do webhook de um arquivo config:

// lib/config.js
export const WEBHOOK_URL = process.env.REACT_APP_WEBHOOK_URL || 
  'https://seu-n8n.com/webhook/agendamento-elis';

// No componente, importe:
import { WEBHOOK_URL } from '@/lib/config';

// E use:
const response = await fetch(WEBHOOK_URL, { ... });

*/


// ═══════════════════════════════════════════════════════════════════
// 6️⃣ ADICIONAR VALIDAÇÃO DE HORÁRIOS BLOQUEADOS
// ═══════════════════════════════════════════════════════════════════

/*

// Hook React para buscar horários indisponíveis
import { useEffect, useState } from 'react';

function useAvailableTimes(date) {
  const [times, setTimes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;

    setLoading(true);
    
    // Busca horários já agendados para essa data
    fetch(`/api/horarios?date=${date}`)
      .then(res => res.json())
      .then(data => {
        const allTimes = [];
        for (let h = 9; h < 18; h++) {
          const time = `${String(h).padStart(2, '0')}:00`;
          if (!data.booked.includes(time)) {
            allTimes.push(time);
          }
        }
        setTimes(allTimes);
      })
      .finally(() => setLoading(false));
  }, [date]);

  return { times, loading };
}

// No componente, use assim:
const { times } = useAvailableTimes(formData.date);

// Renderize apenas horários disponíveis:
{times.map(time => (
  <button key={time} onClick={() => selectTime(time)}>
    {time}
  </button>
))}

*/


// ═══════════════════════════════════════════════════════════════════
// 7️⃣ ENVIAR LEMBRETE 24H ANTES (n8n)
// ═══════════════════════════════════════════════════════════════════

/*

Adicione um segundo workflow no n8n:

[SCHEDULE] (diário, 8h da manhã) 
  ↓
[QUERY DB] → Busca agendamentos para amanhã
  ↓
[LOOP] → Para cada agendamento
  ↓
[WHATSAPP] → Envie lembrete
  
Mensagem sugerida:
"Oi {{name}}! 🔔\n\nLembrete: você tem atendimento amanhã às {{time}}.\n\nSe precisar remarcar, é só avisar! 💫"

*/


// ═══════════════════════════════════════════════════════════════════
// 8️⃣ PAINEL INTERNO PARA ELIS GERENCIAR AGENDAMENTOS
// ═══════════════════════════════════════════════════════════════════

/*

// components/AdminSchedulingDashboard.jsx
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [filter, setFilter] = useState('pendente');

  useEffect(() => {
    fetchAgendamentos();
  }, [filter]);

  const fetchAgendamentos = async () => {
    const res = await fetch(`/api/agendamentos?status=${filter}`);
    const data = await res.json();
    setAgendamentos(data);
  };

  const confirmAgendamento = async (id) => {
    await fetch(`/api/agendamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'confirmado' }),
    });
    fetchAgendamentos();
  };

  const cancelAgendamento = async (id) => {
    await fetch(`/api/agendamentos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'cancelado' }),
    });
    fetchAgendamentos();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Painel de Agendamentos</h1>
      
      <div className="mb-4 flex gap-2">
        {['pendente', 'confirmado', 'cancelado'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-200 text-slate-900'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">Telefone</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Horário</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map(agendamento => (
              <tr key={agendamento._id} className="border-b">
                <td className="p-2">{agendamento.name}</td>
                <td className="p-2">{agendamento.phone}</td>
                <td className="p-2">
                  {format(new Date(agendamento.date), 'dd/MM/yyyy', { locale: ptBR })}
                </td>
                <td className="p-2">{agendamento.time}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    agendamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                    agendamento.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {agendamento.status}
                  </span>
                </td>
                <td className="p-2 flex gap-2">
                  {agendamento.status === 'pendente' && (
                    <>
                      <button
                        onClick={() => confirmAgendamento(agendamento._id)}
                        className="text-green-600 hover:underline text-xs"
                      >
                        ✓ Confirmar
                      </button>
                      <button
                        onClick={() => cancelAgendamento(agendamento._id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        ✕ Cancelar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

*/


// ═══════════════════════════════════════════════════════════════════
// 9️⃣ EXEMPLO COM MERCADO PAGO (para serviços pagos futuros)
// ═══════════════════════════════════════════════════════════════════

/*

Se um dia Elis quiser cobrar pelo agendamento:

// Adicione ao webhook n8n após WhatsApp:

[WHATSAPP] → [MERCADO PAGO - CREATE PREFERENCE]

Configuração:
- Item Title: "Agendamento - {{date}} às {{time}}"
- Unit Price: 50 (ou o valor que desejar)
- Currency: BRL
- Payer Email: (extrair de {{phone}})

Retorna URL de pagamento que você envia via WhatsApp.

*/


// ═══════════════════════════════════════════════════════════════════
// 🔟 MONITORAR ERROS COM SENTRY (OPTIONAL)
// ═══════════════════════════════════════════════════════════════════

/*

import * as Sentry from '@sentry/react';

export default function SchedulingSystem() {
  async function submitForm() {
    try {
      // ... seu código
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          component: 'SchedulingSystem',
          action: 'submitForm',
        },
      });
      // ... handle error
    }
  }
}

*/


// ═══════════════════════════════════════════════════════════════════
// 📝 CHECKLIST FINAL DE IMPLEMENTAÇÃO
// ═══════════════════════════════════════════════════════════════════

/*

✅ Copie agendamento-elis.html ou scheduling-system.jsx
✅ Configure webhook n8n (URL)
✅ Configure WhatsApp Business / Evolution GO
✅ Atualize URL do webhook no código
✅ Teste com número de telefone próprio
✅ Integre na página do site
✅ Testes em mobile
✅ Testes em desktop
✅ Customize cores/textos se necessário
✅ Ative o workflow n8n
✅ Primeiros agendamentos recebidos ✨

EXTRA (Futuro):
☐ Banco de dados para histórico
☐ Painel de controle para Elis
☐ Bloqueio de horários
☐ Lembrete automático 24h antes
☐ Integração com Google Calendar
☐ Pagamento via Mercado Pago

*/
