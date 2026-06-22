import React, { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Elis Miranda — Premium Scheduling System
// Fonts: Instrument Serif (headings) + Plus Jakarta Sans (body)
// Palette: Rose-pink (#f472b6 → #ec4899) · Gold (#d4af37) · Off-white (#faf9f7)
// ─────────────────────────────────────────────────────────────────────────────

const WEBHOOK_URL = 'https://flow.ezstudio.com.br/webhook/agendamento-elis';
const SHEETS_URL  = 'https://script.google.com/macros/s/AKfycbysYdOKGxNN_II8nWIAmxnflex5qPcBioGHuIxtk5K-SjqUOVX67Ecw2HpQhwCFp0M/exec';

function sendToSheets({ name, phone, date, time, servico }) {
  fetch(SHEETS_URL, {
    method: 'POST',
    mode:   'no-cors',
    body:   new URLSearchParams({ name, phone, date, time, servico: servico || '' }),
  }).catch(() => {});
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getBusinessDays(count = 7) {
  const days = [];
  const today = new Date();
  for (let i = 1; days.length < count && i <= count * 2; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(d);
  }
  return days;
}

function getTimeSlots(from = 9, to = 17) {
  const slots = [];
  for (let h = from; h <= to; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

function toInternationalPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 12 ? digits : '55' + digits;
}

function applyPhoneMask(raw) {
  let v = raw.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10)      return v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  else if (v.length > 6)  return v.replace(/^(\d{2})(\d{4})(\d*)$/, '($1) $2-$3');
  else if (v.length > 2)  return v.replace(/^(\d{2})(\d*)$/, '($1) $2');
  return v;
}

function formatDateLabel(d) {
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
}

// ── Styles (CSS-in-JS via <style> tag injection) ─────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .elis-scheduler *, .elis-scheduler *::before, .elis-scheduler *::after {
    box-sizing: border-box;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .elis-scheduler {
    background: linear-gradient(150deg, #faf9f7 0%, #fdf2f8 100%);
    background-attachment: fixed;
    min-height: 100vh;
    padding: 3rem 1.25rem 4rem;
    position: relative;
  }

  /* Background orbs */
  .elis-orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  .elis-orb-1 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(244,114,182,.13) 0%, transparent 70%);
    top: -150px; right: -150px;
  }
  .elis-orb-2 {
    width: 360px; height: 360px;
    background: radial-gradient(circle, rgba(212,175,55,.10) 0%, transparent 70%);
    bottom: -100px; left: -100px;
  }

  .elis-content {
    position: relative;
    z-index: 1;
    max-width: 400px;
    margin: 0 auto;
  }

  /* Header */
  .elis-eyebrow {
    display: block;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: #d4af37;
    margin-bottom: 14px;
  }
  .elis-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: clamp(2rem, 8vw, 2.5rem);
    font-weight: 400;
    line-height: 1.12;
    letter-spacing: -.01em;
    color: #2d1b35;
    margin-bottom: 14px;
  }
  .elis-title em { font-style: italic; color: #ec4899; }
  .elis-gold-line {
    width: 36px; height: 2px;
    background: linear-gradient(90deg, #d4af37, #f7e7ce);
    border-radius: 99px;
    margin: 0 auto 14px;
  }
  .elis-sub {
    font-size: 13.5px;
    color: #a896b0;
    line-height: 1.65;
  }

  /* Progress */
  .elis-progress-track {
    display: flex;
    gap: 6px;
    margin-bottom: 1.75rem;
  }
  .elis-progress-seg {
    flex: 1; height: 3px;
    border-radius: 99px;
    background: rgba(174,149,174,.22);
    transition: background .45s cubic-bezier(.4,0,.2,1);
  }
  .elis-progress-seg.active {
    background: linear-gradient(90deg, #f472b6, #d4af37);
  }

  /* Glass card */
  .elis-card {
    background: rgba(255,255,255,.75);
    backdrop-filter: blur(22px) saturate(1.8);
    -webkit-backdrop-filter: blur(22px) saturate(1.8);
    border: 1px solid rgba(255,255,255,.92);
    border-radius: 24px;
    box-shadow:
      0 8px 40px rgba(212,175,55,.10),
      0 2px 12px rgba(236,72,153,.07),
      0 1px 0 rgba(255,255,255,.90) inset;
    padding: 30px 28px;
  }

  /* Step animation */
  @keyframes elStepIn {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .elis-step {
    display: flex;
    flex-direction: column;
    gap: 20px;
    animation: elStepIn .42s cubic-bezier(.16,1,.3,1) both;
  }

  /* Labels */
  .elis-label {
    display: block;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: .13em;
    text-transform: uppercase;
    color: #a896b0;
    margin-bottom: 9px;
  }
  .elis-hint {
    font-size: 12px;
    color: #d4c8d4;
    margin-top: 7px;
    padding-left: 2px;
    line-height: 1.5;
  }

  /* Inputs */
  .elis-input {
    width: 100%;
    padding: 14px 18px;
    background: rgba(255,255,255,.88);
    border: 1.5px solid rgba(244,114,182,.18);
    border-radius: 14px;
    font-size: 15px;
    font-weight: 400;
    color: #2d1b35;
    outline: none;
    transition: border-color .22s, box-shadow .22s, background .22s;
    box-shadow: 0 2px 8px rgba(0,0,0,.03);
    -webkit-appearance: none;
  }
  .elis-input::placeholder { color: #cbbfd0; }
  .elis-input:focus {
    border-color: rgba(244,114,182,.55);
    background: #fff;
    box-shadow: 0 0 0 4px rgba(244,114,182,.10), 0 2px 8px rgba(0,0,0,.03);
  }

  /* Buttons */
  .elis-btn-primary {
    width: 100%;
    padding: 15px 24px;
    background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: .015em;
    cursor: pointer;
    transition: transform .22s, box-shadow .22s, opacity .22s;
    box-shadow: 0 4px 20px rgba(244,114,182,.45);
    position: relative;
    overflow: hidden;
  }
  .elis-btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,.15) 0%, transparent 60%);
    pointer-events: none;
  }
  .elis-btn-primary:hover:not(:disabled) {
    transform: translateY(-1.5px);
    box-shadow: 0 8px 28px rgba(244,114,182,.55);
  }
  .elis-btn-primary:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 20px rgba(244,114,182,.45);
  }
  .elis-btn-primary:disabled {
    opacity: .45; cursor: not-allowed; transform: none; box-shadow: none;
  }
  .elis-btn-ghost {
    width: 100%;
    padding: 11px 20px;
    background: transparent;
    color: #a896b0;
    border: none;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color .2s;
  }
  .elis-btn-ghost:hover { color: #2d1b35; }

  /* Date / Time grid */
  .elis-grid-2 { display: grid; grid-template-columns: repeat(2,1fr); gap: 8px; }
  .elis-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }

  .elis-btn-sel {
    padding: 14px 8px;
    background: rgba(255,255,255,.88);
    border: 1.5px solid rgba(212,175,55,.16);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    color: #6b5270;
    cursor: pointer;
    transition: border-color .2s, background .2s, color .2s, box-shadow .2s, transform .15s;
    box-shadow: 0 2px 6px rgba(0,0,0,.03);
    text-align: center;
    line-height: 1.4;
  }
  .elis-btn-sel:hover {
    border-color: rgba(244,114,182,.38);
    background: #fff;
    box-shadow: 0 4px 14px rgba(244,114,182,.13);
  }
  .elis-btn-sel.selected {
    background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 18px rgba(244,114,182,.42);
    transform: translateY(-1px);
  }
  .elis-day-label  { font-size: 10.5px; opacity: .75; }
  .elis-day-num    { font-size: 17px; font-weight: 600; margin: 2px 0; }
  .elis-month-label{ font-size: 10.5px; opacity: .75; }

  /* Error */
  .elis-error {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(254,226,226,.72);
    border: 1px solid rgba(248,113,113,.28);
    border-radius: 10px;
  }
  .elis-error-text { font-size: 13px; color: #b91c1c; line-height: 1.5; }

  /* Success */
  @keyframes elCheckPop {
    0%   { opacity:0; transform:scale(.5) rotate(-12deg); }
    55%  { transform:scale(1.12) rotate(3deg); }
    80%  { transform:scale(.97) rotate(-1deg); }
    100% { opacity:1; transform:scale(1) rotate(0); }
  }
  @keyframes elRingPulse {
    0%,100% { box-shadow:0 0 0 0 rgba(244,114,182,.28); }
    50%     { box-shadow:0 0 0 12px rgba(244,114,182,0); }
  }
  .elis-check-circle {
    width: 68px; height: 68px;
    background: linear-gradient(135deg, #f472b6, #ec4899);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    animation:
      elCheckPop .65s cubic-bezier(.34,1.56,.64,1) both,
      elRingPulse 2.4s ease-in-out .65s infinite;
  }
  .elis-success-title {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.65rem;
    font-weight: 400;
    color: #2d1b35;
    margin-bottom: 5px;
  }
  .elis-success-sub { font-size: 13px; color: #a896b0; }
  .elis-confirm-card {
    width: 100%;
    background: linear-gradient(135deg,rgba(255,255,255,.92),rgba(253,242,248,.85));
    border: 1px solid rgba(244,114,182,.18);
    border-radius: 16px;
    padding: 20px 20px 16px;
  }
  .elis-confirm-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
  }
  .elis-confirm-row + .elis-confirm-row {
    border-top: 1px solid rgba(244,114,182,.10);
  }
  .elis-confirm-label {
    font-size: 11px; font-weight: 700;
    letter-spacing: .12em; text-transform: uppercase;
    color: #a896b0;
  }
  .elis-confirm-value { font-size: 14px; font-weight: 600; color: #2d1b35; }
  .elis-success-note {
    font-size: 12.5px; color: #d4c8d4;
    text-align: center; line-height: 1.65;
  }

  /* Spinner */
  @keyframes elSpin { to { transform:rotate(360deg); } }
  .elis-spinner {
    display: inline-block;
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: elSpin .7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
  }

  /* Footer */
  .elis-footer {
    text-align: center;
    font-size: 11px;
    color: #d4c8d4;
    margin-top: 1.5rem;
    letter-spacing: .06em;
  }

  /* Responsive */
  @media (max-width: 360px) {
    .elis-scheduler { padding: 2rem 1rem 3rem; }
    .elis-card { padding: 24px 20px; }
    .elis-title { font-size: 1.75rem; }
    .elis-grid-3 { gap: 6px; }
    .elis-btn-sel { padding: 12px 6px; font-size: 12px; }
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────

export default function SchedulingSystem() {
  const [step, setStep]             = useState(1);
  const [name, setName]             = useState('');
  const [phone, setPhone]           = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [servico, setServico]       = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [confirmed, setConfirmed]   = useState(false);

  const businessDays = getBusinessDays(7);
  const timeSlots    = getTimeSlots(9, 17);

  // Inject CSS once + read ?servico= from URL
  useEffect(() => {
    if (document.getElementById('elis-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'elis-styles';
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('servico');
    if (s) setServico(decodeURIComponent(s));
  }, []);

  const handlePhoneChange = useCallback((e) => {
    setPhone(applyPhoneMask(e.target.value));
  }, []);

  const goToStep = useCallback((target) => {
    if (step === 1 && target === 2) {
      if (!name.trim()) { setError('Por favor, insira seu nome'); return; }
      if (!validatePhone(phone)) {
        setError('Telefone inválido — use o formato (XX) 9XXXX-XXXX');
        return;
      }
    }
    setError('');
    setStep(target);
  }, [step, name, phone]);

  const handleSubmit = useCallback(async () => {
    setError('');
    if (!selectedDate) { setError('Por favor, selecione uma data'); return; }
    if (!selectedTime) { setError('Por favor, selecione um horário'); return; }

    setLoading(true);
    const payload = {
      name:      name.trim(),
      phone:     toInternationalPhone(phone),
      date:      selectedDate.toISOString().split('T')[0],
      time:      selectedTime,
      servico:   servico || '',
      message:   `*Nova Solicitação de Agendamento — Elis Miranda*\n\nNome: ${name.trim()}\nTelefone: ${phone}\nData: ${formatDateLabel(selectedDate)}\nHorário: ${selectedTime}${servico ? `\nServiço: ${servico}` : ''}\n\n_Confirmar agendamento via WhatsApp_`,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (res.ok) {
        sendToSheets({
          name:    name.trim(),
          phone:   toInternationalPhone(phone),
          date:    selectedDate.toISOString().split('T')[0],
          time:    selectedTime,
          servico: servico || '',
        });
        setConfirmed(true);
        setStep(4);
      } else {
        setError('Erro ao enviar agendamento. Tente novamente.');
      }
    } catch (err) {
      console.error('Agendamento error:', err);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [name, phone, selectedDate, selectedTime]);

  const progressSegs = [1, 2, 3];

  return (
    <div className="elis-scheduler">
      <div className="elis-orb elis-orb-1" />
      <div className="elis-orb elis-orb-2" />

      <div className="elis-content">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="elis-eyebrow">Elis Miranda · Estética &amp; Beleza</span>
          <h1 className="elis-title">
            Agende seu<br /><em>atendimento</em>
          </h1>
          <div className="elis-gold-line" />
          {servico ? (
            <p className="elis-sub">
              <span style={{ display:'inline-block', background:'rgba(212,175,55,.15)', color:'#a07c1e', border:'1px solid rgba(212,175,55,.35)', borderRadius:'999px', padding:'4px 14px', fontSize:'0.8rem', fontWeight:600, letterSpacing:'0.01em', marginBottom:'0.25rem' }}>
                💅 {servico}
              </span>
            </p>
          ) : (
            <p className="elis-sub">
              Preencha os dados e escolha<br />seu horário preferido
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="elis-progress-track">
          {progressSegs.map(n => (
            <div
              key={n}
              className={`elis-progress-seg${step >= n ? ' active' : ''}`}
            />
          ))}
        </div>

        {/* Glass Card */}
        <div className="elis-card">

          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div className="elis-step">
              <div>
                <label className="elis-label" htmlFor="el-name">Seu nome</label>
                <input
                  id="el-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Como você gostaria de ser chamada?"
                  className="elis-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="elis-label" htmlFor="el-phone">WhatsApp</label>
                <input
                  id="el-phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  placeholder="(51) 9XXXX-XXXX"
                  className="elis-input"
                  value={phone}
                  onChange={handlePhoneChange}
                />
                <p className="elis-hint">A confirmação será enviada para este número</p>
              </div>

              {error && (
                <div className="elis-error">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="elis-error-text">{error}</p>
                </div>
              )}

              <button className="elis-btn-primary" onClick={() => goToStep(2)}>
                Continuar
              </button>
            </div>
          )}

          {/* ── Step 2: Select Date ── */}
          {step === 2 && (
            <div className="elis-step">
              <span className="elis-label">Escolha a data</span>

              <div className="elis-grid-2">
                {businessDays.map((d, i) => (
                  <button
                    key={i}
                    className={`elis-btn-sel${selectedDate?.getTime() === d.getTime() ? ' selected' : ''}`}
                    onClick={() => setSelectedDate(d)}
                  >
                    <div className="elis-day-label">
                      {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className="elis-day-num">{d.getDate()}</div>
                    <div className="elis-month-label">
                      {d.toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                  </button>
                ))}
              </div>

              <button
                className="elis-btn-primary"
                onClick={() => goToStep(3)}
                disabled={!selectedDate}
              >
                Escolher Horário
              </button>

              <button className="elis-btn-ghost" onClick={() => goToStep(1)}>
                Voltar
              </button>
            </div>
          )}

          {/* ── Step 3: Select Time ── */}
          {step === 3 && (
            <div className="elis-step">
              <div>
                <span className="elis-label">Escolha o horário</span>
                <p className="elis-hint" style={{ marginTop: 4 }}>Porto Alegre, RS · BRT (UTC-3)</p>
              </div>

              <div className="elis-grid-3">
                {timeSlots.map(time => (
                  <button
                    key={time}
                    className={`elis-btn-sel${selectedTime === time ? ' selected' : ''}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>

              {error && (
                <div className="elis-error">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444" style={{ flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="elis-error-text">{error}</p>
                </div>
              )}

              <button
                className="elis-btn-primary"
                onClick={handleSubmit}
                disabled={!selectedTime || loading}
              >
                {loading
                  ? <><span className="elis-spinner" />Enviando…</>
                  : 'Confirmar Agendamento'
                }
              </button>

              <button className="elis-btn-ghost" onClick={() => { setError(''); goToStep(2); }}>
                Voltar
              </button>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && confirmed && (
            <div className="elis-step" style={{ alignItems: 'center', textAlign: 'center', padding: '8px 0' }}>
              <div className="elis-check-circle">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <div>
                <h2 className="elis-success-title">Agendado!</h2>
                <p className="elis-success-sub">Em breve a Elis entrará em contato</p>
              </div>

              <div className="elis-confirm-card">
                {servico && (
                  <div className="elis-confirm-row">
                    <span className="elis-confirm-label">Serviço</span>
                    <span className="elis-confirm-value">{servico}</span>
                  </div>
                )}
                <div className="elis-confirm-row">
                  <span className="elis-confirm-label">Data</span>
                  <span className="elis-confirm-value">{formatDateLabel(selectedDate)}</span>
                </div>
                <div className="elis-confirm-row">
                  <span className="elis-confirm-label">Horário</span>
                  <span className="elis-confirm-value">{selectedTime}</span>
                </div>
              </div>

              <p className="elis-success-note">
                Você receberá uma confirmação via WhatsApp<br />em instantes ✨
              </p>
            </div>
          )}

        </div>
        {/* /glass-card */}

        <p className="elis-footer">elismiranda.com.br &nbsp;·&nbsp; Porto Alegre, RS</p>

      </div>
    </div>
  );
}
