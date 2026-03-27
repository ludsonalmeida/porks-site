// src/pages/CardapioLayout.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
  Divider,
  Fade,
  InputBase,
  Tooltip,
  GlobalStyles,
  Chip,
  Skeleton,
  Slide,
  Button,
  Rating,
  Modal,
} from '@mui/material';
import { keyframes } from '@mui/system';
import AcquisitionMachine from "../components/AcquisitionMachine";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import {
  initialItems,
  initialPromos,
  initialDrinks,
  itemCategories,
  drinkCategories,
} from '../data/menu_data_new.jsx';

const palette = {
  page: '#FFFFFF',
  cream: '#FBF5E9',
  bannerRed: '#E6564F',
  orange: '#EA5A47',
  headerGreen: '#C63830',
  textPrimary: '#12100B',
  textMuted: '#7D8B84',
  divider: '#E8E0D3',
  ring: '#EA5A47',
  heart: '#E05657',
  promoBg: '#FFE8E6',
  promoFg: '#C63830',
};

const SIZES = { thumb: 104, actionsCol: 44, actionsFav: 128, title: 16, price: 14.5 };
const NAV_H = 'calc(64px + env(safe-area-inset-bottom))';
const SINGLE_UNIT = 'Sobradinho, Distrito Federal';

// --- Feature flag para Promoções ---
function readPromosEnabled() {
  try {
    const sp = new URLSearchParams(window.location.search);
    if (sp.has('promos')) {
      const v = String(sp.get('promos') || '').toLowerCase();
      const on = v === '1' || v === 'true' || v === 'on';
      localStorage.setItem('cardapio/promosEnabled', on ? '1' : '0');
    }
  } catch { }

  const envRaw = (import.meta.env?.VITE_PROMOS_ENABLED ?? '').toString().toLowerCase();
  const envOn = envRaw === '1' || envRaw === 'true' || envRaw === 'on';
  const lsOn = localStorage.getItem('cardapio/promosEnabled') === '1';
  return envOn || lsOn;
}
const PROMOS_ENABLED = readPromosEnabled();

// --- Review (Google) ---
const GOOGLE_REVIEW_CID = '2138163599891563158'; // Porks Sobradinho
const REVIEW_URLS = [
  `https://search.google.com/local/writereview?cid=${GOOGLE_REVIEW_CID}&hl=pt-BR`,
  `https://www.google.com/maps?cid=${GOOGLE_REVIEW_CID}&hl=pt-BR`,
  `https://www.google.com.br/maps?cid=${GOOGLE_REVIEW_CID}&hl=pt-BR`,
];

function GoogleGlyph({ size = 22 }) {
  return (
    <Box sx={{ width: size, height: size, display: 'inline-flex' }} aria-hidden>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.9 6.3 29.2 4 24 4 16.1 4 9.4 8.5 6.3 14.7z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.2 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.9 6.3 29.2 4 24 4 16.1 4 9.4 8.5 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.7 13.6-4.7l-6.3-5.2C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.5-11.1-8.2l-6.6 5.1C9.4 39.5 16.1 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.4-4.2 6-8.3 6-3.1 0-5.9-1.8-7.2-4.4l-6.6 5.1C15.4 39.5 19.5 42 24 42c10.4 0 19-7.5 19-20 0-1.1-.1-2.3-.4-3.5z" />
      </svg>
    </Box>
  );
}

// Usa imagens dos itens/drinks do menu
const getImg = (id) => {
  try {
    const all = [...initialItems, ...initialDrinks];
    return all.find(x => x.id === id)?.image || '';
  } catch { return ''; }
};

const slides = [
  {
    title1: 'Burger',
    title2: 'da Casa',
    desc: 'Blend suculento, cheddar e bacon crocante',
    image: getImg('food-porks-bacon-burger'),
  },
  {
    title1: 'Torresmo',
    title2: 'Mineiro',
    desc: 'Crocância perfeita pra acompanhar o chope',
    image: getImg('food-torresmo-mineiro'),
  },
  {
    title1: 'Batata',
    title2: 'Tropeira',
    desc: 'Batata rústica, pernil desfiado e BBQ da casa',
    image: getImg('food-batata-tropeira'),
  },
  {
    title1: 'Drinks da Casa',
    title2: 'Moscow Mule',
    desc: 'Vodka, gengibre, limão e aquela espuma clássica',
    image: getImg('drink-moscow-mule'),
  },
];

const pop = keyframes`0%{transform:scale(1)}35%{transform:scale(1.28)}100%{transform:scale(1)}`;
const makeParticle = (dx, dy) => keyframes`0%{transform:translate(0,0);opacity:1}100%{transform:translate(${dx}px,${dy}px);opacity:0}`;
const appear = keyframes`0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}`;
const fadeIn = keyframes`0%{opacity:0}100%{opacity:1}`;
const skBg = '#E8E5DB';

const clamp = (lines) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

/* ---- HEART ---- */
const HeartBurst = React.memo(function HeartBurst({ liked, onClick, withTooltip = false, tooltipOpen = false, tooltipRef = null, burstKey = 0 }) {
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2, r = 22;
    const kf = makeParticle(Math.cos(angle) * r, Math.sin(angle) * r);
    return (
      <Box
        key={`${burstKey}-${i}`}
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 5,
          height: 5,
          borderRadius: '50%',
          bgcolor: palette.heart,
          transform: 'translate(-50%,-50%)',
          animation: `${kf} 520ms ease-out forwards`,
          pointerEvents: 'none',
        }}
      />
    );
  });

  const icon = liked
    ? <FavoriteIcon sx={{ color: palette.heart, animation: burstKey ? `${pop} 360ms ease-out` : 'none' }} />
    : <FavoriteBorderIcon sx={{ color: '#9AA0A6', animation: burstKey ? `${pop} 360ms ease-out` : 'none' }} />;

  const btn = (
    <IconButton
      size="small"
      disableRipple
      disableFocusRipple
      onClick={onClick}
      sx={{ p: 0.5, position: 'relative', zIndex: 1 }}
      aria-label="favoritar"
      ref={tooltipRef}
    >
      {icon}
    </IconButton>
  );

  return withTooltip ? (
    <Tooltip
      title="Favorite-me!"
      placement="top"
      arrow
      open={tooltipOpen}
      PopperProps={{ disablePortal: false }}
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: palette.heart,
            color: '#fff',
            fontWeight: 700,
            fontSize: 12,
            px: 1.25,
            py: 0.75,
            borderRadius: 1.5,
            boxShadow: '0 8px 24px rgba(0,0,0,.25)',
          },
        },
        arrow: { sx: { color: palette.heart } },
      }}
    >
      {btn}
    </Tooltip>
  ) : btn;
});

/* ---- Rating memo ---- */
const StarRating = React.memo(function StarRating({ name, value, onChange }) {
  return (
    <Rating
      name={name}
      value={value}
      onChange={onChange}
      sx={{
        lineHeight: 1,
        cursor: 'pointer',
        '& .MuiRating-icon': { fontSize: 20 },
        '& .MuiRating-iconEmpty': { color: '#DADADA', opacity: 1 },
      }}
    />
  );
});

/* ---- SKELETONS ---- */
const RowSkeleton = () => (
  <Box sx={{ py: 1, display: 'grid', gridTemplateColumns: `${SIZES.thumb}px minmax(0,1fr) ${SIZES.actionsCol}px`, columnGap: 1.5, alignItems: 'center' }}>
    <Skeleton variant="rounded" width={SIZES.thumb} height={SIZES.thumb} sx={{ borderRadius: 2, bgcolor: skBg }} animation="wave" />
    <Box sx={{ minWidth: 0, mr: 1 }}>
      <Skeleton variant="text" width="80%" height={20} sx={{ bgcolor: skBg }} animation="wave" />
      <Skeleton variant="text" width="60%" height={18} sx={{ bgcolor: skBg }} animation="wave" />
      <Skeleton variant="text" width="40%" height={18} sx={{ bgcolor: skBg }} animation="wave" />
      <Skeleton variant="text" width="30%" height={20} sx={{ mt: .4, bgcolor: skBg }} animation="wave" />
    </Box>
    <Box sx={{ display: 'flex', gap: 1, justifySelf: 'end', alignItems: 'center' }}>
      <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: skBg }} animation="wave" />
    </Box>
  </Box>
);

const SectionSkeleton = ({ rows = 3 }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, backgroundColor: palette.cream, border: 'none' }}>
    <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1.5, bgcolor: skBg }} animation="wave" />
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i}>
        <RowSkeleton />
        {i < rows - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
      </Box>
    ))}
  </Paper>
);

const SearchRowSkeleton = () => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '64px 1fr 40px', columnGap: 1.5, alignItems: 'center', py: 1 }}>
    <Skeleton variant="rounded" width={64} height={64} sx={{ borderRadius: 2, bgcolor: skBg }} animation="wave" />
    <Box>
      <Skeleton variant="text" width="70%" height={18} sx={{ bgcolor: skBg }} animation="wave" />
      <Skeleton variant="text" width="50%" height={16} sx={{ bgcolor: skBg }} animation="wave" />
    </Box>
    <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: skBg }} animation="wave" />
  </Box>
);

/* ---- GATE ---- */
function UnitConsentScreen({ onAccepted }) {
  const acceptAndContinue = async () => {
    const unit = SINGLE_UNIT;
    localStorage.setItem('cardapio/lgpdConsent', '1');
    localStorage.setItem('cardapio/unit', unit);
    try { document.cookie = `lgpd_consent=true; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`; } catch { }
    onAccepted(unit); // parent dispara o evento 'ma:consent-granted'
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#1b1b19',
      color: '#fff',
      position: 'relative',
      pt: 'calc(env(safe-area-inset-top) + 28px)',
      pb: 'calc(env(safe-area-inset-bottom) + 120px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Logo */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Box
          component="img"
          src="https://porks.nyc3.cdn.digitaloceanspaces.com/logo-porks2.jpg"
          alt="Porks"
          sx={{ width: 200, height: 'auto', borderRadius: 1, userSelect: 'none', pointerEvents: 'none' }}
        />
      </Box>

      <Typography sx={{ opacity: .9, mt: 4, px: 3, textAlign: 'center', fontWeight: 700 }}>
        Selecione a unidade para continuar.
      </Typography>

      <Slide direction="up" in>
        <Paper elevation={12} sx={{
          position: 'fixed',
          left: 0, right: 0, bottom: 0,
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
          p: 2,
          bgcolor: '#fff',
          color: palette.textPrimary,
          pb: 'calc(env(safe-area-inset-bottom) + 12px)',
        }}>
          <Typography sx={{ fontWeight: 900, mb: 1, color: palette.headerGreen, letterSpacing: .2 }}>
            Escolha a unidade
          </Typography>

          <Paper
            variant="outlined"
            onClick={acceptAndContinue}
            sx={{
              borderColor: '#EEE6D7',
              backgroundColor: '#fff',
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              '&:active': { transform: 'scale(0.995)' },
              transition: 'transform .06s ease',
            }}
          >
            <Box sx={{ width: 34, display: 'grid', placeItems: 'center' }}>
              <LocationOnRoundedIcon sx={{ color: palette.ring }} />
            </Box>
            <Typography sx={{ flex: 1, fontWeight: 800, color: palette.textPrimary }}>
              {SINGLE_UNIT}
            </Typography>
            <KeyboardArrowRightRoundedIcon sx={{ color: '#9AA0A6' }} />
          </Paper>

          <Typography sx={{ color: '#7A7A7A', fontSize: 12, mt: 1.25, lineHeight: 1.5 }}>
            Ao tocar na unidade, você aceita a LGPD, o uso de cookies e o tratamento de dados para personalização e conversões.
          </Typography>
        </Paper>
      </Slide>
    </Box>
  );
}

/* ---- Helpers de busca ---- */
const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (s) =>
  normalize(s).split(/[^a-z0-9]+/).filter(Boolean);

const groupByCategory = (items, categories) =>
  categories
    .slice()
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .map(cat => ({
      id: cat.id,
      title: cat.title,
      items: items.filter(it => it.categoryId === cat.id),
    }))
    .filter(g => g.items.length > 0);

/* ---- INNER ---- */
function CardapioInner() {
  const [nav, setNav] = useState('inicio');
  const [unit, setUnit] = useState(() => localStorage.getItem('cardapio/unit') || SINGLE_UNIT);
  const [musicTooltip, setMusicTooltip] = useState(() => {
    return !sessionStorage.getItem('musicTooltipDismissed');
  });

  useEffect(() => {
    if (musicTooltip) {
      const timer = setTimeout(() => {
        setMusicTooltip(false);
        sessionStorage.setItem('musicTooltipDismissed', '1');
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [musicTooltip]);

  const savedFavIds = (() => {
    try { return JSON.parse(localStorage.getItem('cardapio/favs') || '[]'); }
    catch { return []; }
  })();

  const [items, setItems] = useState(() =>
    initialItems.map(it => ({ ...it, liked: savedFavIds.includes(it.id) }))
  );
  const [promos, setPromos] = useState(() =>
    initialPromos.map(it => ({ ...it, liked: savedFavIds.includes(it.id) }))
  );
  const [drinks, setDrinks] = useState(() =>
    initialDrinks.map(it => ({ ...it, liked: savedFavIds.includes(it.id) }))
  );

  const getAllActive = React.useCallback(() => {
    return PROMOS_ENABLED ? [...items, ...drinks, ...promos] : [...items, ...drinks];
  }, [items, drinks, promos]);

  const itemsGrouped = useMemo(() => groupByCategory(items, itemCategories), [items]);
  const drinksGrouped = useMemo(() => groupByCategory(drinks, drinkCategories), [drinks]);

  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const firstHeartRef = useRef(null);
  const [tipOpen, setTipOpen] = useState(false);
  const [burstMap, setBurstMap] = useState({});
  const [likedFlash, setLikedFlash] = useState({});
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [detail, setDetail] = useState(null);
  const [ratings, setRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cardapio/ratings') || '{}'); } catch { return {}; }
  });
  const [notice, setNotice] = useState(null);
  const [reviewSheetOpen, setReviewSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [propsMarked, setPropsMarked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cardapio/propsMarked') || '{}'); } catch { return {}; }
  });
  const toggleProp = (item, key) => {
    setPropsMarked(prev => {
      const cur = new Set(prev[item.id] || []);
      cur.has(key) ? cur.delete(key) : cur.add(key);
      const next = { ...prev, [item.id]: Array.from(cur) };
      try { localStorage.setItem('cardapio/propsMarked', JSON.stringify(next)); } catch { }
      return next;
    });
  };
  const isPropMarked = (item, key) => !!(propsMarked[item.id] || []).includes(key);

  const openReviewFlow = async () => {
    const shareUrl = REVIEW_URLS[1];
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Avaliar no Google',
          text: 'Deixe sua recomendação para o Porks Sobradinho',
          url: shareUrl,
        });
        return;
      } catch { }
    }
    setReviewSheetOpen(true);
  };

  const copyReviewLink = async () => {
    try {
      await navigator.clipboard.writeText(REVIEW_URLS[1]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copie o link abaixo:', REVIEW_URLS[1]);
    }
  };

  // Corrige automaticamente se o localStorage estiver com "Águas Claras"
  useEffect(() => {
    const u = localStorage.getItem('cardapio/unit');
    if (!u || /águas claras/i.test(u)) {
      localStorage.setItem('cardapio/unit', SINGLE_UNIT);
      setUnit(SINGLE_UNIT);
    }
  }, []);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 1500); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (nav !== 'inicio') return;
    const id = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [nav]);

  useEffect(() => { const id = requestAnimationFrame(() => { if (firstHeartRef.current) setTipOpen(true); }); return () => cancelAnimationFrame(id); }, [items.length]);

  useEffect(() => {
    const likedIds = getAllActive().filter(x => x.liked).map(x => x.id);
    try { localStorage.setItem('cardapio/favs', JSON.stringify(likedIds)); } catch { }
    try {
      document.cookie = `cardapio/favs=${encodeURIComponent(likedIds.join(','))}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`;
    } catch { }
  }, [items, promos, drinks, getAllActive]);

  /* Busca */
  useEffect(() => {
    if (!searchOpen) return;
    const q = normalize(searchText);
    if (!q) { setSearchResults([]); setSearchLoading(false); return; }
    setSearchLoading(true);

    const run = () => {
      const all = getAllActive();
      const terms = q.split(' ').filter(Boolean);

      const scoreItem = (it) => {
        const text = `${it.title} ${it.subtitle || ''} ${it.subtitle2 || ''}`;
        const toks = tokenize(text);
        let score = 0;
        for (const t of terms) {
          const inTitleTokens = tokenize(it.title).some(tok => tok.startsWith(t));
          const inAnyTokens = toks.some(tok => tok.startsWith(t));
          const inAnyText = normalize(text).includes(t);
          if (inTitleTokens) score += 3;
          else if (inAnyTokens) score += 2;
          else if (inAnyText) score += 1;
          else return -1;
        }
        if (it.liked) score += 0.25;
        return score;
      };

      const matched = all
        .map(it => ({ it, score: scoreItem(it) }))
        .filter(x => x.score >= 0)
        .sort((a, b) => b.score - a.score)
        .map(x => x.it);

      setSearchResults(matched);
      setSearchLoading(false);
    };

    const t = setTimeout(run, 180);
    return () => clearTimeout(t);
  }, [searchText, searchOpen, items, promos, drinks, getAllActive]);

  const triggerBurst = (id) => {
    setBurstMap(m => {
      const next = (m[id] || 0) + 1;
      setTimeout(() => setBurstMap(mm => { const cp = { ...mm }; delete cp[id]; return cp; }), 700);
      return { ...m, [id]: next };
    });
  };
  const isLiked = (id) =>
    items.some(i => i.id === id && i.liked) || promos.some(p => p.id === id && p.liked) ||
    drinks.some(c => c.id === id && c.liked);

  const toggleLikeById = (id) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, liked: !it.liked } : it));
    setPromos(prev => prev.map(it => it.id === id ? { ...it, liked: !it.liked } : it));
    setDrinks(prev => prev.map(it => it.id === id ? { ...it, liked: !it.liked } : it));
  };

  const handleFavoriteClick = (item, e) => {
    e?.stopPropagation();

    const wasLiked = isLiked(item.id);

    triggerBurst(item.id);
    if (tipOpen) setTipOpen(false);

    toggleLikeById(item.id);

    const nowLiked = !wasLiked;

    if (!wasLiked) {
      setLikedFlash(m => ({ ...m, [item.id]: true }));
      setTimeout(() => setLikedFlash(m => { const cp = { ...m }; delete cp[item.id]; return cp; }), 900);

      setRatings(prev => {
        const next = { ...prev, [item.id]: 0 };
        try { localStorage.setItem('cardapio/ratings', JSON.stringify(next)); } catch { }
        return next;
      });
    }

    // Tracking removido (feito apenas no AcquisitionMachine)
  };

  const openSearch = () => setSearchOpen(true);
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchLoading(false);
    setSearchText('');
    setSearchResults([]);
    if (nav === 'busca') {
      setNav(prevNavRef.current || 'inicio');
    }
  };

  const openDetail = (it) => {
    setDetail({ ...it, __openedAt: Date.now() });
    // Tracking removido (feito apenas no AcquisitionMachine)
  };

  const closeDetail = () => {
    setDetail(null);
    if (nav === 'busca') {
      setNav(prevNavRef.current || 'inicio');
    }
  };

  const forceUnitSobradinho = () => {
    localStorage.setItem('cardapio/unit', SINGLE_UNIT);
    setUnit(SINGLE_UNIT);
  };

  const handleRate = (item, value, e) => {
    e?.stopPropagation?.();
    const stars = Number(value) || 0;
    setRatings(prev => {
      const next = { ...prev, [item.id]: stars };
      try { localStorage.setItem('cardapio/ratings', JSON.stringify(next)); } catch { }
      return next;
    });
    setNotice({ item, stars });
    // Tracking removido (feito apenas no AcquisitionMachine)
  };

  const favorites = getAllActive().filter(x => x.liked);
  const showSugSkel = loading || items.length === 0;
  const showPromoSkel = PROMOS_ENABLED && (loading || promos.length === 0);

  const handleOpenFromSearch = (it) => {
    closeSearch();
    setTimeout(() => openDetail(it), 0);
  };

  const rowPerfSX = {};
  const actionColSX = {
    display: 'inline-flex',
    alignItems: 'center',
    justifySelf: 'end',
    position: 'relative',
  };

  const prevNavRef = useRef('inicio');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: palette.page, pt: { xs: 'calc(env(safe-area-inset-top) + 12px)', sm: 0 }, pb: { xs: 'calc(10px + env(safe-area-inset-bottom))', sm: 10 } }}>
      <GlobalStyles styles={{
        '.search-ov *:focus, .search-ov *:focus-visible': { outline: 'none !important', boxShadow: 'none !important' },
        '.search-ov input, .search-ov .MuiInputBase-input, .search-ov .MuiInputBase-root': { outline: 'none !important', boxShadow: 'none !important' },
        '.search-ov input::-moz-focus-inner': { border: 0 },
      }} />

      {/* Banner (apenas na home) */}
      {nav === 'inicio' && (
        <Box sx={{ mx: 2, mt: 2, borderRadius: 2.5, overflow: 'hidden', position: 'relative', height: { xs: 220, sm: 260 }, bgcolor: palette.bannerRed }}>
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', height: '100%', transition: 'transform .5s ease', transform: `translateX(-${slide * 100}%)` }}>
            {slides.map((s, i) => (
              <Box key={i} sx={{
                minWidth: '100%', height: '100%', position: 'relative',
                backgroundImage: `linear-gradient(90deg, ${palette.bannerRed} 0%, ${palette.bannerRed} 64%, rgba(230,86,79,0) 64%), url('${s.image}')`,
                backgroundSize: 'cover, contain', backgroundRepeat: 'no-repeat, no-repeat',
                backgroundPosition: 'left center, right -8px center',
              }}>
                <Box sx={{ px: 3, py: { xs: 3.2, sm: 3.5 }, width: '64%' }}>
                  <Typography sx={{ color: '#fff', fontSize: 'clamp(22px, 6vw, 30px)', lineHeight: 1.02, fontFamily: "'Alfa Slab One', Georgia, serif", fontWeight: 400 }}>
                    {s.title1}<Box component="span" sx={{ display: 'block' }}>{s.title2}</Box>
                  </Typography>
                  <Typography sx={{ color: '#FFEFEA', mt: 1.2, fontSize: { xs: 13.5, sm: 14.5 }, fontWeight: 500 }}>{s.desc}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', display: 'flex', gap: 1.25 }}>
            {slides.map((_, i) => (<Box key={i} onClick={() => setSlide(i)} sx={{ width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', bgcolor: i === slide ? '#fff' : 'rgba(255,255,255,.5)', outline: '2px solid rgba(255,255,255,.25)' }} />))}
          </Box>
        </Box>
      )}

      {/* Conteúdo */}
      <Box sx={{ mx: 2, mt: 2, mb: `calc(${NAV_H} + 6px)` }}>
        {/* Home */}
        {nav === 'inicio' && (
          <>
            {showSugSkel ? (
              <SectionSkeleton rows={3} />
            ) : (
              itemsGrouped.map((section, sIdx) => (
                <Paper
                  key={section.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    backgroundColor: palette.cream,
                    border: 'none',
                    mt: sIdx === 0 ? 0 : 2,
                  }}
                >
                  <Typography sx={{
                    mb: 1.5,
                    color: palette.headerGreen,
                    fontSize: 22,
                    fontFamily: "'Alfa Slab One', Georgia, serif",
                    fontWeight: 400
                  }}>
                    {section.title}
                  </Typography>

                  <Grid container direction="column">
                    {section.items.map((item, idx) => {
                      const burstKey = burstMap[item.id] || 0;
                      return (
                        <Box key={item.id}>
                          <Box
                            onClick={() => openDetail(item)}
                            sx={{
                              py: 1,
                              display: 'grid',
                              gridTemplateColumns: `${SIZES.thumb}px minmax(0,1fr) ${SIZES.actionsCol}px`,
                              columnGap: 1.5,
                              alignItems: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Box sx={{ width: SIZES.thumb, height: SIZES.thumb, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                              <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </Box>
                            <Box sx={{ minWidth: 0, mr: 1 }}>
                              <Typography sx={{ fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.title, lineHeight: 1.2, ...clamp(2) }}>
                                {item.title}
                              </Typography>
                              {item.subtitle && (
                                <Typography sx={{ mt: .25, fontSize: 13.5, color: palette.textMuted, ...clamp(2) }}>
                                  {item.subtitle}
                                </Typography>
                              )}
                              {item.subtitle2 && (
                                <Typography sx={{ fontSize: 13.5, color: palette.textMuted, ...clamp(1) }}>
                                  {item.subtitle2}
                                </Typography>
                              )}
                              <Typography sx={{ mt: .6, fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.price }}>
                                R$ {item.price}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifySelf: 'end', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                              {idx === 0 && sIdx === 0 ? (
                                <HeartBurst liked={item.liked} onClick={(e) => handleFavoriteClick(item, e)} withTooltip tooltipOpen={tipOpen} tooltipRef={firstHeartRef} burstKey={burstKey} />
                              ) : (
                                <HeartBurst liked={item.liked} onClick={(e) => handleFavoriteClick(item, e)} burstKey={burstKey} />
                              )}
                              <Fade in={!!likedFlash[item.id]} timeout={{ enter: 120, exit: 250 }}>
                                <Typography sx={{
                                  position: 'absolute',
                                  top: 'calc(100% + 2px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: 11, fontWeight: 800, color: palette.heart,
                                  whiteSpace: 'nowrap', pointerEvents: 'none',
                                }}>
                                  Gostei
                                </Typography>
                              </Fade>
                            </Box>
                          </Box>

                          {idx < section.items.length - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
                        </Box>
                      );
                    })}
                  </Grid>
                </Paper>
              ))
            )}
            {PROMOS_ENABLED && (
              showPromoSkel ? (
                <Box sx={{ mt: 2 }}><SectionSkeleton rows={3} /></Box>
              ) : (
                <Paper elevation={0} sx={{ mt: 2, p: 2, borderRadius: 2.5, backgroundColor: palette.cream, border: 'none' }}>
                  <Typography sx={{ mb: 1.5, color: palette.headerGreen, fontSize: 22, fontFamily: "'Alfa Slab One', Georgia, serif", fontWeight: 400 }}>
                    Promoções do dia
                  </Typography>
                  {/* ... render de promos ... */}
                </Paper>
              )
            )}

          </>
        )}

        {/* DRINKS */}
        {nav === 'drinks' && (
          <Box sx={{ animation: `${fadeIn} 120ms ease-out` }}>
            {drinksGrouped.map((section, sIdx) => (
              <Paper
                key={section.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor: palette.cream,
                  border: 'none',
                  mt: sIdx === 0 ? 0 : 2,
                }}
              >
                <Typography sx={{
                  mb: 1.5,
                  color: palette.headerGreen,
                  fontSize: 22,
                  fontFamily: "'Alfa Slab One', Georgia, serif",
                  fontWeight: 400
                }}>
                  {section.title}
                </Typography>

                <Grid container direction="column">
                  {section.items.map((item, idx) => {
                    const burstKey = (burstMap[item.id] || 0) + 2000;
                    return (
                      <Box key={`drink-${item.id}`}>
                        <Box
                          onClick={() => openDetail(item)}
                          sx={{
                            py: 1,
                            display: 'grid',
                            gridTemplateColumns: { xs: '88px minmax(0,1fr)', sm: `${SIZES.thumb}px minmax(0,1fr)` },
                            columnGap: 1.25,
                            alignItems: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <Box sx={{ position: 'relative', width: { xs: 88, sm: SIZES.thumb }, height: { xs: 88, sm: SIZES.thumb }, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                            <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            <Box
                              onClick={(e) => { e.stopPropagation(); handleFavoriteClick(item, e); }}
                              sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'rgba(255,255,255,.82)', borderRadius: 99, display: 'grid', placeItems: 'center', p: .25 }}
                            >
                              <HeartBurst liked={item.liked} onClick={(e) => handleFavoriteClick(item, e)} burstKey={burstKey} />
                            </Box>
                          </Box>

                          <Box sx={{ minWidth: 0, mr: 0.25 }}>
                            <Typography sx={{ fontFamily: '"Bitter", serif', fontWeight: 800, color: palette.textPrimary, fontSize: SIZES.title, lineHeight: 1.18, ...clamp(2) }}>
                              {item.title}
                            </Typography>
                            {item.subtitle && <Typography sx={{ mt: .25, fontSize: 13.5, color: palette.textMuted, ...clamp(2) }}>{item.subtitle}</Typography>}
                            {item.subtitle2 && <Typography sx={{ fontSize: 13.5, color: palette.textMuted, ...clamp(1) }}>{item.subtitle2}</Typography>}
                            <Typography sx={{ mt: .55, fontFamily: '"Bitter", serif', fontWeight: 800, color: palette.textPrimary, fontSize: SIZES.price }}>
                              R$ {item.price}
                            </Typography>
                          </Box>
                        </Box>

                        {idx < section.items.length - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
                      </Box>
                    );
                  })}
                </Grid>
              </Paper>
            ))}
          </Box>
        )}

        {/* FAVORITOS */}
        {nav === 'fav' && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, backgroundColor: palette.cream, border: 'none', animation: `${fadeIn} 120ms ease-out` }}>
            <Typography sx={{ mb: 1.5, color: palette.headerGreen, fontSize: 22, fontFamily: "'Alfa Slab One', Georgia, serif", fontWeight: 400 }}>
              Seus favoritos
            </Typography>
            {favorites.length === 0 ? (
              <Typography sx={{ color: '#9AA0A6', textAlign: 'center', py: 4 }}>
                Você ainda não favoritou nenhum item.
              </Typography>
            ) : (
              <Grid container direction="column">
                {favorites.map((item, idx) => {
                  const burstKey = (burstMap[item.id] || 0) + 1000;
                  const ratedValue = Number(ratings[item.id] || 0);
                  return (
                    <Box key={`fav-${item.id}`}>
                      <Box
                        onClick={() => openDetail(item)}
                        sx={{
                          py: 1,
                          display: 'grid',
                          gridTemplateColumns: { xs: '88px minmax(0,1fr) 128px', sm: `${SIZES.thumb}px minmax(0,1fr) ${SIZES.actionsFav}px` },
                          columnGap: 1.25,
                          alignItems: 'center',
                          cursor: 'pointer',
                          ...rowPerfSX,
                        }}
                      >
                        <Box sx={{ width: { xs: 88, sm: SIZES.thumb }, height: { xs: 88, sm: SIZES.thumb }, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                          <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </Box>

                        <Box sx={{ minWidth: 0, mr: 0.5 }}>
                          <Typography sx={{ fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.title, lineHeight: 1.2, ...clamp(2) }}>
                            {item.title}
                          </Typography>
                          {item.subtitle && <Typography sx={{ mt: .25, fontSize: 13.5, color: palette.textMuted, ...clamp(2) }}>{item.subtitle}</Typography>}
                          {item.subtitle2 && <Typography sx={{ fontSize: 13.5, color: palette.textMuted, ...clamp(1) }}>{item.subtitle2}</Typography>}
                          <Typography sx={{ mt: .6, fontFamily: '"Bitter", serif', fontWeight: 700, color: palette.textPrimary, fontSize: SIZES.price }}>
                            R$ {item.price}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            justifyContent: 'space-between',
                            justifySelf: 'end',
                            minHeight: { xs: 88, sm: SIZES.thumb },
                            pr: .5,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HeartBurst liked={true} onClick={(e) => handleFavoriteClick(item, e)} burstKey={burstKey} />
                            <Fade in={!!likedFlash[item.id]} timeout={{ enter: 120, exit: 250 }}>
                              <Typography
                                sx={{
                                  position: 'absolute',
                                  top: 'calc(100% + 2px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: palette.heart,
                                  whiteSpace: 'nowrap',
                                  pointerEvents: 'none',
                                }}
                              >
                                Gostei
                              </Typography>
                            </Fade>
                          </Box>

                          <Box>
                            <StarRating
                              name={`rate-${item.id}`}
                              value={ratedValue}
                              onChange={(e, newVal) => { e?.stopPropagation?.(); handleRate(item, newVal, e); }}
                            />
                          </Box>
                        </Box>
                      </Box>
                      {idx < favorites.length - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
                    </Box>
                  );
                })}
              </Grid>
            )}
          </Paper>
        )}

        {/* OPÇÕES */}
        {nav === 'menu' && (
          <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, backgroundColor: palette.cream, border: 'none', animation: `${fadeIn} 120ms ease-out` }}>
            <Typography sx={{ mb: 1.5, color: palette.headerGreen, fontSize: 28, fontFamily: "'Alfa Slab One', Georgia, serif", fontWeight: 400 }}>
              Opções
            </Typography>

            <Paper
              elevation={0}
              onClick={forceUnitSobradinho}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: '#F9F6EF',
                border: '1px solid #EEE6D7',
                cursor: 'pointer',
                '&:active': { transform: 'scale(0.995)' },
              }}
            >
              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: '#EA5A47', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <LocationOnRoundedIcon />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: palette.textMuted, fontSize: 13, fontWeight: 700, lineHeight: 1 }}>
                  Você está em
                </Typography>
                <Typography sx={{ color: palette.textPrimary, fontWeight: 800, fontSize: 16, lineHeight: 1.25, mt: .25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {unit || SINGLE_UNIT}
                </Typography>
              </Box>
              <KeyboardArrowRightRoundedIcon sx={{ color: '#55636A' }} />
            </Paper>
          </Paper>
        )}
      </Box>

      {/* Bottom Nav */}
      <Box sx={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: (t) => t.zIndex.appBar,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -12,
          left: 0,
          right: 0,
          height: 12,
          background: 'linear-gradient(to top, rgba(255,255,255,.95), transparent)',
          pointerEvents: 'none',
        },
      }}>
        <BottomNavigation
          value={nav}
          onChange={(_, v) => {
            if (v === 'busca') {
              prevNavRef.current = nav;
              setNav('busca');
              openSearch();
            } else {
              setNav(v);
            }
          }}
          showLabels
          sx={{
            bgcolor: '#fff',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            height: NAV_H,
            pb: 'env(safe-area-inset-bottom)',
            '& .MuiBottomNavigationAction-label': { fontSize: '0.652rem', transition: 'none' },
            '& .Mui-selected .MuiBottomNavigationAction-label': { fontSize: '0.652rem' },
          }}
        >
          <BottomNavigationAction label="Cardapio" value="inicio" icon={<MenuBookIcon />} />
          <BottomNavigationAction label="Drinks" value="drinks" icon={<LocalBarIcon />} />
          <BottomNavigationAction
            label="Busca"
            value="busca"
            icon={<SearchIcon />}
            sx={{
              px: .5, borderRadius: 0, backgroundColor: 'transparent',
              '& .MuiSvgIcon-root': { fontSize: 22, color: palette.ring },
              '& .MuiBottomNavigationAction-label': { fontWeight: 700, color: palette.ring },
              '&.Mui-selected': { boxShadow: `inset 0 -2px 0 ${palette.ring}` },
            }}
          />
          <BottomNavigationAction label="Favoritos" value="fav" icon={<FavoriteBorderIcon />} />
          <BottomNavigationAction
            label="Pedir Música"
            value="musica"
            icon={
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: palette.bannerRed,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mt: -3,
                boxShadow: '0 3px 16px rgba(230,86,79,.5)',
                border: '3px solid #fff',
                animation: 'musicGlow 3s ease-in-out infinite',
                '@keyframes musicGlow': {
                  '0%,100%': { boxShadow: '0 2px 12px rgba(230,86,79,.4)' },
                  '50%': { boxShadow: '0 2px 20px rgba(230,86,79,.6)' },
                },
              }}>
                <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>🎵</Typography>
              </Box>
            }
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.65rem !important',
                fontWeight: '800 !important',
                color: palette.bannerRed + ' !important',
                mt: 0.5,
              },
            }}
          />
        </BottomNavigation>
      </Box>

      {/* Overlay de Busca */}
      <Box
        sx={{ position: 'fixed', inset: 0, zIndex: (t) => t.zIndex.tooltip + 10 }}
        style={{ pointerEvents: searchOpen ? 'auto' : 'none', visibility: searchOpen ? 'visible' : 'hidden' }}
      >
        {/* Backdrop */}
        <Box
          onClick={closeSearch}
          sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,.18)', backdropFilter: 'blur(2px)', transition: 'opacity .2s' }}
          style={{ opacity: searchOpen ? 1 : 0 }}
        />

        {/* Caixa de busca */}
        <Fade in={searchOpen} mountOnEnter unmountOnExit>
          <Paper
            elevation={0}
            component="form"
            onSubmit={(e) => { e.preventDefault(); }}
            className="search-ov"
            sx={{
              position: 'absolute',
              left: '50%',
              top: '14%',
              transform: 'translate(-50%, 0)',
              width: { xs: '90%', sm: 560 },
              p: 1,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#fff',
              border: '1px solid #eaeaea',
              boxShadow: '0 18px 60px rgba(0,0,0,.08)',
              transition: 'box-shadow .2s ease, transform .2s ease',
              zIndex: (t) => t.zIndex.tooltip + 11,
              '&:focus-within': {
                boxShadow: '0 18px 60px rgba(15,123,77,.16), 0 0 0 3px rgba(15,123,77,.12)',
              },
            }}
            onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); }}
          >
            <Box sx={{ ml: .5, width: 36, height: 36, borderRadius: '50%', background: '#F5F7F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SearchIcon sx={{ fontSize: 22, color: palette.ring }} />
            </Box>
            <InputBase
              type="text"
              inputProps={{ inputMode: 'search', 'aria-label': 'Buscar' }}
              autoFocus
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar pratos, drinks..."
              sx={{
                flex: 1, fontSize: 16, fontWeight: 700, color: palette.textPrimary, px: 1, '::placeholder': { color: '#9AA0A6' },
                '& .MuiInputBase-input': { border: 0, outline: 'none !important', boxShadow: 'none !important', backgroundColor: 'transparent', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', WebkitTapHighlightColor: 'transparent' },
                '& .MuiInputBase-input:focus, & .MuiInputBase-input:focus-visible': { outline: 'none !important', boxShadow: 'none !important' },
                '& input::-webkit-search-decoration, & input::-webkit-search-cancel-button, & input::-webkit-search-results-button, & input::-webkit-search-results-decoration': { display: 'none' },
              }}
            />
            {searchText && (
              <IconButton aria-label="limpar" onClick={() => setSearchText('')}>
                <CloseIcon />
              </IconButton>
            )}
          </Paper>
        </Fade>

        {/* Resultados */}
        <Fade in={searchOpen} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 'calc(14% + 72px)',
              transform: 'translateX(-50%)',
              width: { xs: '90%', sm: 560 },
              bgcolor: '#fff',
              borderRadius: 2,
              p: 2,
              boxShadow: '0 14px 40px rgba(0,0,0,.10)',
              maxHeight: { xs: '60vh', sm: 480 },
              overflow: 'auto',
            }}
          >
            <Typography sx={{ fontWeight: 700, color: '#7B7B7B', fontSize: 12, mb: 1 }}>RESULTADOS</Typography>

            {!searchText && (
              <Typography sx={{ color: '#9AA0A6', fontSize: 14, textAlign: 'center', py: 3 }}>
                Digite para buscar pratos, drinks...
              </Typography>
            )}

            {searchText && !searchLoading && searchResults.length === 0 && (
              <Typography sx={{ color: '#9AA0A6', fontSize: 14, textAlign: 'center', py: 3 }}>
                Nenhum item encontrado para “{searchText}”.
              </Typography>
            )}

            {searchText && searchLoading && (
              <Box>
                <SearchRowSkeleton /><Divider />
                <SearchRowSkeleton /><Divider />
                <SearchRowSkeleton /><Divider />
                <SearchRowSkeleton /><Divider />
                <SearchRowSkeleton />
              </Box>
            )}

            {searchText && !searchLoading && searchResults.length > 0 && (
              <Box>
                {searchResults.map((item, idx) => (
                  <Box key={`sr-${item.id}`}>
                    <Box
                      onClick={() => handleOpenFromSearch(item)}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '64px 1fr 40px',
                        columnGap: 1.5,
                        alignItems: 'center',
                        py: 1,
                        cursor: 'pointer',
                        '&:active': { transform: 'scale(.997)' },
                        transition: 'transform .06s ease',
                      }}
                    >
                      <Box sx={{ width: 64, height: 64, borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                        <Box component="img" src={item.image} alt={item.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, color: palette.textPrimary, fontSize: 15, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </Typography>
                        {(item.subtitle || item.subtitle2) && (
                          <Typography sx={{ mt: .25, fontSize: 13, color: palette.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.subtitle || item.subtitle2}
                          </Typography>
                        )}
                      </Box>
                      <IconButton aria-label="abrir" onClick={(e) => { e.stopPropagation(); handleOpenFromSearch(item); }}>
                        <ChevronRightRoundedIcon />
                      </IconButton>
                    </Box>
                    {idx < searchResults.length - 1 && <Divider sx={{ my: .5, borderColor: palette.divider }} />}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Fade>
      </Box>

      {/* Detalhe do item */}
      {detail && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: '#fff', zIndex: (t) => t.zIndex.tooltip + 20, display: 'flex', flexDirection: 'column', animation: `${fadeIn} 120ms ease-out` }}>
          <Box sx={{ position: 'relative', height: { xs: '42vh', sm: '50vh' }, overflow: 'hidden' }}>
            <Box component="img" src={detail.image} alt={detail.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <Box sx={{ position: 'absolute', left: 0, right: 0, top: { xs: 'calc(env(safe-area-inset-top) + 28px)', sm: 28 }, px: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <IconButton onClick={closeDetail} sx={{ bgcolor: 'rgba(0,0,0,.55)', '&:hover': { bgcolor: 'rgba(0,0,0,.65)' }, boxShadow: '0 2px 12px rgba(0,0,0,.35)' }}>
                <ArrowBackRoundedIcon sx={{ color: '#fff' }} />
              </IconButton>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={() => handleFavoriteClick(detail)} sx={{ bgcolor: 'rgba(0,0,0,.55)', '&:hover': { bgcolor: 'rgba(0,0,0,.65)' }, boxShadow: '0 2px 12px rgba(0,0,0,.35)' }}>
                  {isLiked(detail.id) ? <FavoriteIcon sx={{ color: palette.heart }} /> : <FavoriteBorderIcon sx={{ color: '#fff' }} />}
                </IconButton>
                <IconButton onClick={() => {
                  const payload = { title: detail.title, text: `Olha este item: ${detail.title}`, url: typeof window !== 'undefined' ? window.location.href : '' };
                  if (navigator.share) navigator.share(payload).catch(() => { });
                  else { try { navigator.clipboard?.writeText(`${payload.text} ${payload.url}`); } catch { } }
                }} sx={{ bgcolor: 'rgba(0,0,0,.55)', '&:hover': { bgcolor: 'rgba(0,0,0,.65)' }, boxShadow: '0 2px 12px rgba(0,0,0,.35)' }}>
                  <ShareRoundedIcon sx={{ color: '#fff' }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
          <Box sx={{ flex: 1, overflow: 'auto', px: 2, pt: 5, pb: 2, animation: `${appear} 180ms ease` }}>
            <Typography sx={{ fontFamily: "'Bitter', serif", fontWeight: 800, fontSize: 26, color: palette.textPrimary, mb: 1 }}>
              {detail.title}
            </Typography>
            {(detail.subtitle || detail.subtitle2) && (
              <Typography sx={{ color: palette.textMuted, lineHeight: 1.6, mb: 2 }}>
                {detail.subtitle} {detail.subtitle2 ? ` ${detail.subtitle2}` : ''}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Typography sx={{ fontFamily: "'Bitter', serif", fontWeight: 800, fontSize: 22, color: palette.textPrimary }}>
                R$ {detail.price}
              </Typography>
              {detail.oldPrice && (
                <>
                  <Typography sx={{ color: '#9AA0A6', textDecoration: 'line-through', fontWeight: 600, fontSize: 14 }}>
                    R$ {detail.oldPrice}
                  </Typography>
                  <Chip
                    label={`-${Math.max(0, Math.round((1 - parseFloat(detail.price) / parseFloat(detail.oldPrice)) * 100))}%`}
                    size="small"
                    sx={{ bgcolor: palette.promoBg, color: palette.promoFg, fontWeight: 700, height: 22, borderRadius: '12px', fontSize: 12 }}
                  />
                </>
              )}
            </Box>

            {(typeof detail.abv === 'number' || typeof detail.ibu === 'number') && (
              <>
                <Typography sx={{ fontFamily: "'Bitter', serif", fontWeight: 800, fontSize: 18, color: palette.textPrimary, mb: 1 }}>
                  Características
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {typeof detail.abv === 'number' && (
                    <Chip
                      onClick={() => toggleProp(detail, 'abv')}
                      label={`ABV ${String(detail.abv).replace('.', ',')}%`}
                      clickable
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        ...(isPropMarked(detail, 'abv')
                          ? { bgcolor: palette.ring, color: '#fff' }
                          : { bgcolor: '#F2F5F4', color: palette.textMuted }),
                      }}
                    />
                  )}
                  {typeof detail.ibu === 'number' && (
                    <Chip
                      onClick={() => toggleProp(detail, 'ibu')}
                      label={`IBU ${detail.ibu}`}
                      clickable
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        ...(isPropMarked(detail, 'ibu')
                          ? { bgcolor: palette.ring, color: '#fff' }
                          : { bgcolor: '#F2F5F4', color: palette.textMuted }),
                      }}
                    />
                  )}
                </Box>
              </>
            )}

            <Typography sx={{ fontFamily: "'Bitter', serif", fontWeight: 800, fontSize: 18, color: palette.textPrimary, mb: 1 }}>
              Sugestão de acompanhamento
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 8 }}>
              <Chip label="Batata rústica" />
              <Chip label="Salada verde" />
              <Chip label="Molho da casa" />
            </Box>
          </Box>
        </Box>
      )}

      {/* Modais de avaliação */}
      <Modal open={reviewSheetOpen} onClose={() => setReviewSheetOpen(false)}>
        <Box
          sx={{
            position: 'absolute', left: '50%', top: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: 520 },
            bgcolor: '#fff', color: palette.textPrimary,
            borderRadius: 3, boxShadow: '0 30px 90px rgba(0,0,0,.28)',
            p: { xs: 2, sm: 3 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <GoogleGlyph size={24} />
            <Typography sx={{ fontWeight: 900, letterSpacing: .2 }}>
              Avaliar no Google
            </Typography>
          </Box>

          {notice?.stars ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography sx={{ fontWeight: 800 }}>Sua avaliação:</Typography>
              <Rating value={notice.stars} readOnly size="small"
                sx={{ '& .MuiRating-icon': { fontSize: 18 } }} />
              <Typography sx={{ color: palette.textMuted }}>
                ({notice.stars} {notice.stars === 1 ? 'estrela' : 'estrelas'})
              </Typography>
            </Box>
          ) : null}

          <Typography sx={{ color: palette.textMuted, mb: 2 }}>
            Obrigado por avaliar! Você pode abrir o fluxo de recomendação no app do Google ou copiar o link.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.25, mb: 2 }}>
            <Button
              onClick={copyReviewLink}
              startIcon={<ShareRoundedIcon />}
              variant="contained"
              sx={{
                flex: 1,
                bgcolor: palette.headerGreen,
                '&:hover': { bgcolor: '#0c4027' },
                borderRadius: 2, fontWeight: 900, textTransform: 'none'
              }}
            >
              {copied ? 'Link copiado!' : 'Copiar link'}
            </Button>

            <Button
              onClick={() => { const w = window.open(REVIEW_URLS[1], '_blank', 'noopener,noreferrer'); try { if (w) w.opener = null; } catch { } }}
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: 2, fontWeight: 900, textTransform: 'none',
                borderColor: '#DADFE3'
              }}
            >
              Abrir no Google Maps
            </Button>
          </Box>

          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 2,
            p: 1.5, border: '1px dashed #E5E7EB', borderRadius: 2
          }}>
            <Box
              component="img"
              alt="QR Code para avaliação no Google"
              sx={{ width: 112, height: 112, borderRadius: 1, flexShrink: 0 }}
              src={`https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(REVIEW_URLS[1])}`}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, mb: .25 }}>
                Abra no celular
              </Typography>
              <Typography sx={{ color: palette.textMuted, fontSize: 13 }}>
                Escaneie o QR para abrir diretamente a tela de avaliação do Google.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setReviewSheetOpen(false)} sx={{ textTransform: 'none', borderRadius: 999 }}>
              Fechar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={!!notice} onClose={() => setNotice(null)} aria-labelledby="rate-title">
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#fff',
            color: palette.textPrimary,
            p: 2.5,
            borderRadius: 3,
            boxShadow: '0 30px 80px rgba(0,0,0,.28)',
            width: { xs: '88%', sm: 440 },
            textAlign: 'center'
          }}
        >
          {notice && (
            <>
              <Box sx={{ mb: 1.25, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography id="rate-title" sx={{ fontWeight: 900, fontSize: 18 }}>
                  Você avaliou {notice.stars} {notice.stars === 1 ? 'estrela' : 'estrelas'}
                </Typography>
                <Rating
                  readOnly
                  value={notice.stars}
                  size="large"
                  sx={{
                    '& .MuiRating-iconFilled': { color: '#FFC107' },
                    '& .MuiRating-iconEmpty': { color: '#E6E6E6' },
                  }}
                />
              </Box>

              <Typography sx={{ color: palette.textMuted, mb: 2 }}>
                Obrigado pelo feedback!
              </Typography>

              {notice.stars === 5 ? (
                <Button
                  variant="contained"
                  onClick={openReviewFlow}
                  sx={{
                    bgcolor: '#0c4027',
                    color: '#fff',
                    '&:hover': { bgcolor: '#0c4027', color: '#fff' },
                    borderRadius: 999,
                    px: 2,
                    fontWeight: 800
                  }}
                >
                  Recomendar no Google
                </Button>
              ) : null}

              <Box sx={{ mt: 1 }}>
                <Button
                  onClick={() => setNotice(null)}
                  sx={{
                    borderRadius: 999,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 1.5,
                    color: '#6F6F6F',
                  }}
                >
                  Fechar
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* ── Music Tooltip ── */}
      {musicTooltip && nav !== 'musica' && (
        <Box
          onClick={() => { setMusicTooltip(false); sessionStorage.setItem('musicTooltipDismissed', '1'); setNav('musica'); }}
          sx={{
            position: 'fixed',
            bottom: 68,
            right: 8,
            zIndex: 1300,
            cursor: 'pointer',
            animation: 'tooltipFadeIn .5s ease',
            '@keyframes tooltipFadeIn': {
              '0%': { opacity: 0, transform: 'translateY(8px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box sx={{
            bgcolor: palette.bannerRed,
            color: '#fff',
            px: 2,
            py: 1,
            borderRadius: '12px 12px 4px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            lineHeight: 1.4,
            maxWidth: 200,
            boxShadow: '0 4px 20px rgba(230,86,79,.4)',
            position: 'relative',
          }}>
            🎵 Que tal pedir uma música pro nosso vinil enquanto escolhe o que comer?
            <Box sx={{
              position: 'absolute',
              bottom: -6,
              right: 20,
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${palette.bannerRed}`,
            }} />
          </Box>
        </Box>
      )}

      {/* ── Pedir Música — fullscreen quando nav === 'musica' ── */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 56,
        zIndex: 1100,
        bgcolor: '#0a0a0a',
        transition: 'opacity .3s ease, transform .3s ease',
        opacity: nav === 'musica' ? 1 : 0,
        transform: nav === 'musica' ? 'translateY(0)' : 'translateY(20px)',
        pointerEvents: nav === 'musica' ? 'auto' : 'none',
        borderBottom: '1px solid rgba(255,255,255,.08)',
      }}>
        {nav === 'musica' && (
          <iframe
            src="https://musica.sobradinhoporks.com.br"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Porks Radio"
            allow="autoplay"
          />
        )}
      </Box>
    </Box>
  );
}

/* ---- PAGE ---- */
export default function CardapioLayout() {
  const [gateOpen, setGateOpen] = useState(() => {
    const c = localStorage.getItem('cardapio/lgpdConsent') === '1';
    const u = localStorage.getItem('cardapio/unit');
    return Boolean(c && u);
  });

  return (
    <>
      {/* Máquina headless: dispara Pixel + eventos quando detectar consentimento */}
      <AcquisitionMachine
        metaPixelId="2431106123757946"
        brand="Porks Sobradinho"
        cookieDays={365}
        enableImageFallback={true}
      />

      {gateOpen ? (
        <CardapioInner />
      ) : (
        <UnitConsentScreen onAccepted={() => {
          setGateOpen(true);
          // avisa a máquina que o consentimento foi dado AGORA
          window.dispatchEvent(new CustomEvent('ma:consent-granted'));
        }} />
      )}
    </>
  );
}
