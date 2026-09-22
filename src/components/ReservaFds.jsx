import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, IconButton, Modal, Typography } from '@mui/material';
import { keyframes } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
import SportsBarRoundedIcon from '@mui/icons-material/SportsBarRounded';
import LocalBarRoundedIcon from '@mui/icons-material/LocalBarRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

/*
 * Experiência "Reserve pro fim de semana e ganhe os chopes".
 * Substitui o convite da roleta Na Praia (encerrado) no cardápio.
 * Regras vivem no site de reservas (pks-web, _lib/rules.ts): bônus vale
 * de quinta a domingo em qualquer horário; reserva das 18h às 21h.
 */

const RESERVAS_URL = 'https://reservas.sobradinhoporks.com.br/reserva';

const C = {
  page: '#16100A',
  card: '#241A10',
  card2: '#2C2014',
  red: '#E04A3A',
  orange: '#E08818',
  yellow: '#EAB808',
  ink: '#F0E0C0',
  muted: '#B39B77',
  line: 'rgba(240,224,192,.12)',
};
const FONT_DISPLAY = "'Bebas Neue', 'Alfa Slab One', sans-serif";
const FONT_BODY = "'Barlow Condensed', sans-serif";

// Mesmos degraus do site de reservas (PROMO_TIERS).
export const TIERS = [
  { people: 5, label: '5 pessoas', ganha: '5 chopes Pilsen', itens: [{ icon: 'chope', n: 5 }] },
  { people: 8, label: '8 pessoas', ganha: '7 chopes Pilsen + 1 drink', itens: [{ icon: 'chope', n: 7 }, { icon: 'drink', n: 1 }] },
  { people: 10, label: '10 ou mais', ganha: '9 chopes + 1 petisco + 1 drink', itens: [{ icon: 'chope', n: 9 }, { icon: 'petisco', n: 1 }, { icon: 'drink', n: 1 }] },
];

const DOW = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const PROMO_DOWS = [4, 5, 6, 0]; // qui, sex, sáb, dom

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Próximos dias com bônus (qui a dom), começando hoje. */
export function nextPromoDays(count = 4, from = new Date()) {
  const out = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i < 21 && out.length < count; i++) {
    const dow = d.getDay();
    if (PROMO_DOWS.includes(dow)) {
      out.push({
        ymd: ymd(d),
        dow: DOW[dow],
        day: d.getDate(),
        today: i === 0,
        tomorrow: i === 1,
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

export function reservaLink(people, dateYMD, src) {
  const sp = new URLSearchParams();
  if (people) sp.set('people', String(people));
  if (dateYMD) sp.set('date', dateYMD);
  sp.set('utm_source', 'cardapio');
  sp.set('utm_medium', src || 'modal');
  sp.set('utm_campaign', 'reserva_fds_chopes');
  return `${RESERVAS_URL}?${sp.toString()}`;
}

function track(name, data) {
  try { if (typeof window !== 'undefined' && window.fbq) window.fbq('trackCustom', name, data || {}); } catch { /* noop */ }
}

/* ── animações ── */
const slideUp = keyframes`0%{opacity:0;transform:translateY(40px)}100%{opacity:1;transform:translateY(0)}`;
const rise = keyframes`0%{opacity:0;transform:translateY(14px) scale(.98)}100%{opacity:1;transform:translateY(0) scale(1)}`;
const sheen = keyframes`0%{transform:translateX(-140%) skewX(-18deg)}100%{transform:translateX(240%) skewX(-18deg)}`;
const glow = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(224,136,24,.0),0 10px 28px rgba(224,136,24,.35)}50%{box-shadow:0 0 0 6px rgba(224,136,24,.12),0 10px 34px rgba(224,136,24,.55)}`;
const popIn = keyframes`0%{transform:scale(.6);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1)}`;
const wobble = keyframes`0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg)}75%{transform:rotate(8deg)}`;
const cheer = keyframes`0%{transform:translateY(0) rotate(0)}30%{transform:translateY(-4px) rotate(-10deg)}60%{transform:translateY(-4px) rotate(10deg)}100%{transform:translateY(0) rotate(0)}`;

const ICONS = {
  chope: SportsBarRoundedIcon,
  drink: LocalBarRoundedIcon,
  petisco: RestaurantRoundedIcon,
};

function Prize({ itens, big }) {
  return (
    <Box sx={{ display: 'flex', gap: big ? 1 : .5, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      {itens.map((it, i) => {
        const Icon = ICONS[it.icon];
        return (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: .25, animation: `${popIn} .45s ${i * .08}s both` }}>
            <Icon sx={{ fontSize: big ? 30 : 18, color: it.icon === 'chope' ? C.yellow : C.orange, animation: big ? `${cheer} 1.6s ${i * .2}s ease-in-out infinite` : 'none' }} />
            <Typography component="span" sx={{ fontFamily: FONT_DISPLAY, fontSize: big ? 26 : 16, color: C.ink, lineHeight: 1 }}>
              {it.n}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

/**
 * Corpo da experiência (usado dentro do modal). Passo 1 escolhe o grupo,
 * passo 2 o dia; o botão leva pro site de reservas já preenchido.
 */
export function ReservaFdsBody({ copy, onGo, onDismiss, src = 'modal' }) {
  const [tier, setTier] = useState(1); // começa no 8 (degrau do meio)
  const [dayIdx, setDayIdx] = useState(0);
  const days = useMemo(() => nextPromoDays(4), []);
  const t = TIERS[tier];
  const day = days[dayIdx];
  const href = reservaLink(t.people, day?.ymd, src);

  return (
    <Box sx={{ px: 2.25, pt: 1.5, textAlign: 'center', color: C.ink }}>
      {/* Passo 1: grupo */}
      <Typography sx={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 800, letterSpacing: '.22em', color: C.muted, mb: 1 }}>
        1 · QUANTOS VÃO COM VOCÊ?
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
        {TIERS.map((x, i) => {
          const on = i === tier;
          return (
            <Box
              key={x.people}
              role="button"
              tabIndex={0}
              onClick={() => setTier(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setTier(i); }}
              sx={{
                cursor: 'pointer', userSelect: 'none',
                borderRadius: 1.5, px: 1, py: { xs: .6, sm: .8 },
                border: `2px solid ${on ? C.orange : C.line}`,
                bgcolor: on ? 'rgba(224,136,24,.16)' : C.card2,
                transform: on ? 'translateY(-2px)' : 'none',
                transition: 'all .22s ease',
                boxShadow: on ? '0 8px 22px rgba(224,136,24,.28)' : 'none',
                animation: `${rise} .4s ${i * .07}s both`,
              }}
            >
              <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 26, lineHeight: 1, color: on ? C.yellow : C.ink }}>
                {x.people}{i === TIERS.length - 1 ? '+' : ''}
              </Typography>
              <Typography sx={{ fontFamily: FONT_BODY, fontSize: 11.5, fontWeight: 700, color: C.muted, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                pessoas
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Placar do que ganha */}
      <Box
        key={t.people}
        sx={{
          position: 'relative', overflow: 'hidden',
          borderRadius: 2, px: 2, py: { xs: .9, sm: 1.1 }, mb: { xs: 1.25, sm: 1.5 },
          background: `linear-gradient(135deg, rgba(224,74,58,.22), rgba(224,136,24,.16))`,
          border: `1px solid rgba(234,184,8,.35)`,
          animation: `${rise} .35s both`,
          '&::after': {
            content: '""', position: 'absolute', top: 0, bottom: 0, width: '35%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.14), transparent)',
            animation: `${sheen} 2.4s .3s ease-in-out infinite`,
          },
        }}
      >
        <Typography sx={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 800, letterSpacing: '.22em', color: C.yellow, mb: .5 }}>
          SUA MESA GANHA
        </Typography>
        <Prize itens={t.itens} big />
        <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 20, lineHeight: 1.05, mt: .5, color: '#fff' }}>
          {t.ganha}
        </Typography>
        {tier < TIERS.length - 1 && (
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: 12.5, fontWeight: 600, color: C.muted, mt: .5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: .5 }}>
            <LockRoundedIcon sx={{ fontSize: 13 }} />
            com {TIERS[tier + 1].people} pessoas vira {TIERS[tier + 1].ganha}
          </Typography>
        )}
      </Box>

      {/* Passo 2: dia */}
      <Typography sx={{ fontFamily: FONT_BODY, fontSize: 11, fontWeight: 800, letterSpacing: '.22em', color: C.muted, mb: 1 }}>
        2 · QUE DIA VOCÊS VÊM?
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${days.length}, 1fr)`, gap: .75, mb: 1.5 }}>
        {days.map((d, i) => {
          const on = i === dayIdx;
          return (
            <Box
              key={d.ymd}
              role="button"
              tabIndex={0}
              onClick={() => setDayIdx(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDayIdx(i); }}
              sx={{
                cursor: 'pointer', userSelect: 'none', position: 'relative',
                borderRadius: 1.5, py: .7,
                border: `2px solid ${on ? C.red : C.line}`,
                bgcolor: on ? 'rgba(224,74,58,.18)' : C.card2,
                transition: 'all .2s ease',
                animation: `${rise} .4s ${.15 + i * .06}s both`,
              }}
            >
              <Typography sx={{ fontFamily: FONT_BODY, fontSize: 10.5, fontWeight: 800, letterSpacing: '.16em', color: on ? C.ink : C.muted }}>
                {d.dow}
              </Typography>
              <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: 24, lineHeight: 1, color: on ? C.yellow : C.ink }}>
                {d.day}
              </Typography>
              {(d.today || d.tomorrow) && (
                <Box sx={{
                  position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                  bgcolor: C.red, color: '#fff', fontFamily: FONT_BODY, fontSize: 9, fontWeight: 900, letterSpacing: '.14em',
                  px: .6, py: .1, borderRadius: 999, whiteSpace: 'nowrap',
                }}>
                  {d.today ? 'HOJE' : 'AMANHÃ'}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* CTA fixo no pé da folha (sticky dentro da área rolável) */}
      <Box sx={{
        position: 'sticky', bottom: 0, mx: -2.25, px: 2.25, pt: 1, pb: 'max(12px, env(safe-area-inset-bottom))',
        background: `linear-gradient(180deg, rgba(36,26,16,0) 0%, ${C.card} 28%)`,
      }}>
        <Button
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { track('ReservaFdsClick', { people: t.people, date: day?.ymd, src }); onGo?.(); }}
          fullWidth
          variant="contained"
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{
            bgcolor: C.orange, color: '#12100B',
            '&:hover': { bgcolor: '#f39a2a', color: '#12100B' },
            borderRadius: 999, fontFamily: FONT_DISPLAY, fontSize: { xs: 18, sm: 20 }, letterSpacing: '.04em', py: .95,
            textTransform: 'none', animation: `${glow} 2.2s ease-in-out infinite`,
          }}
        >
          {copy.cta}
        </Button>
        <Typography sx={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: C.muted, mt: .75, lineHeight: 1.3 }}>
          {copy.rodape}
        </Typography>
        {onDismiss && (
          <Button onClick={onDismiss} sx={{ mt: .25, borderRadius: 999, textTransform: 'none', fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13, color: C.muted, py: .25 }}>
            {copy.depois}
          </Button>
        )}
      </Box>
    </Box>
  );
}

/** Modal que abre ao carregar o cardápio. */
export function ReservaFdsModal({ open, onClose, copy }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="reserva-fds-title"
      sx={{ zIndex: 21000, display: 'flex', alignItems: { xs: 'flex-end', sm: 'center' }, justifyContent: 'center' }}
    >
      <Box sx={{
        width: { xs: '100%', sm: 430 },
        maxWidth: '100%',
        maxHeight: { xs: '92dvh', sm: '92vh' },
        display: 'flex', flexDirection: 'column',
        bgcolor: C.card, color: C.ink,
        borderRadius: { xs: '20px 20px 0 0', sm: 3 },
        boxShadow: '0 -20px 80px rgba(0,0,0,.6)',
        border: `1px solid ${C.line}`,
        outline: 'none', overflow: 'hidden',
        animation: `${slideUp} .35s cubic-bezier(.2,.8,.2,1) both`,
      }}>
        {/* Cabeçalho */}
        <Box sx={{
          position: 'relative', flexShrink: 0, px: 3, pt: { xs: 1.5, sm: 2.25 }, pb: 1.5, textAlign: 'center',
          background: `radial-gradient(120% 90% at 50% 0%, rgba(224,74,58,.35), transparent 60%), ${C.page}`,
          borderBottom: `1px solid ${C.line}`,
        }}>
          <Box sx={{ display: { xs: 'block', sm: 'none' }, width: 40, height: 4, borderRadius: 2, bgcolor: 'rgba(240,224,192,.25)', mx: 'auto', mb: 1.25 }} />
          <IconButton onClick={onClose} size="small" aria-label="fechar" sx={{ position: 'absolute', top: 8, right: 8, color: 'rgba(240,224,192,.8)' }}>
            <CloseIcon />
          </IconButton>
          <Box sx={{
            display: 'inline-block', bgcolor: C.red, color: '#fff',
            fontFamily: FONT_BODY, fontSize: 10, fontWeight: 900, letterSpacing: '.24em', textTransform: 'uppercase',
            px: 1.25, py: .45, mb: 1.5, clipPath: 'polygon(3px 0,100% 0,calc(100% - 3px) 100%,0 100%)',
            boxShadow: '0 0 18px rgba(224,74,58,.55)',
          }}>
            {copy.tag}
          </Box>
          <SportsBarRoundedIcon sx={{ display: { xs: 'none', sm: 'inline-block' }, fontSize: 30, color: C.yellow, mb: .5, animation: `${wobble} 1.8s ease-in-out infinite` }} />
          <Typography id="reserva-fds-title" sx={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(24px, 6.8vw, 30px)', lineHeight: .95, color: '#fff' }}>
            {copy.headline}
          </Typography>
          <Typography sx={{ fontFamily: FONT_BODY, fontSize: { xs: 13, sm: 14 }, fontWeight: 600, color: C.muted, mt: .75, lineHeight: 1.3 }}>
            {copy.sub}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <ReservaFdsBody copy={copy} onGo={onClose} onDismiss={onClose} src="modal" />
        </Box>
      </Box>
    </Modal>
  );
}

/** Card fixo na tela inicial do cardápio (abaixo do destaque). */
export function ReservaFdsCard({ copy, onOpen }) {
  const days = useMemo(() => nextPromoDays(4), []);
  const first = days[0];
  const [pulse, setPulse] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPulse(true), 800); return () => clearTimeout(t); }, []);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => { track('ReservaFdsCardOpen'); onOpen(); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(); }}
      sx={{
        mx: 2, mt: 2, cursor: 'pointer', position: 'relative', overflow: 'hidden',
        borderRadius: 2, p: 2,
        background: `linear-gradient(120deg, ${C.card2} 0%, #3a2410 55%, rgba(224,74,58,.35) 100%)`,
        border: `1px solid rgba(234,184,8,.35)`,
        boxShadow: '0 10px 30px rgba(0,0,0,.45)',
        display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr) auto', alignItems: 'center', gap: { xs: 1.25, sm: 1.5 },
        animation: `${rise} .5s .2s both`,
        '&::after': pulse ? {
          content: '""', position: 'absolute', top: 0, bottom: 0, width: '30%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.10), transparent)',
          animation: `${sheen} 3s 1s ease-in-out infinite`,
        } : {},
      }}
    >
      <Box sx={{
        width: { xs: 46, sm: 54 }, height: { xs: 46, sm: 54 }, borderRadius: 2, display: 'grid', placeItems: 'center', flexShrink: 0,
        bgcolor: 'rgba(224,136,24,.18)', border: `1px solid rgba(224,136,24,.5)`,
      }}>
        <SportsBarRoundedIcon sx={{ fontSize: 32, color: C.yellow, animation: `${cheer} 2s ease-in-out infinite` }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 900, letterSpacing: '.22em', color: C.orange, textTransform: 'uppercase' }}>
          {copy.tag}{first ? ` · ${first.today ? 'HOJE' : first.tomorrow ? 'AMANHÃ' : `${first.dow} ${first.day}`}` : ''}
        </Typography>
        <Typography sx={{ fontFamily: FONT_DISPLAY, fontSize: { xs: 21, sm: 24 }, lineHeight: 1, color: '#fff', mt: .25 }}>
          {copy.cardTitulo}
        </Typography>
        <Typography sx={{ fontFamily: FONT_BODY, fontSize: 13.5, fontWeight: 600, color: C.muted, mt: .35, lineHeight: 1.3 }}>
          {copy.cardSub}
        </Typography>
      </Box>
      <Box sx={{
        width: 38, height: 38, borderRadius: 999, display: 'grid', placeItems: 'center', flexShrink: 0,
        bgcolor: C.orange, color: '#12100B', animation: `${glow} 2.2s ease-in-out infinite`,
      }}>
        <ArrowForwardRoundedIcon />
      </Box>
    </Box>
  );
}

// Copy padrão (afinada com o XQUADS). Pode ser sobrescrita via props.
export const RESERVA_FDS_COPY = {
  tag: 'Chope cortesia',
  headline: 'Reserve sua mesa e garanta chope cortesia para seus convidados',
  sub: 'De quinta a domingo, sua mesa reservada ganha chope cortesia. Quanto maior a mesa, mais cortesia.',
  cta: 'Reservar e garantir os chopes',
  depois: 'Agora não, só olhando',
  rodape: 'Vale de quinta a domingo, reserva das 18h às 21h. Leva 1 minuto: só nome e WhatsApp.',
  cardTitulo: 'Reserve sua mesa e garanta chope cortesia',
  cardSub: 'Pro fim de semana, para seus convidados: até 9 chopes, drink e petisco.',
};
