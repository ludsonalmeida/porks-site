// src/components/AcquisitionMachine.jsx
import { useEffect } from "react";

/**
 * Máquina de Aquisição — React
 * - Reproduz o script do Elementor: trackCustom("MenuOpen" + "NewCustomer|RecurringCustomer")
 * - Parâmetros: { brand, customerStatus, visitNumber }
 * - Espera consentimento e Pixel realmente ATIVO antes de disparar
 */
export default function AcquisitionMachine({
  metaPixelId,
  brand = "Porks Sobradinho",
  cookieDays = 365,
  keys = {
    consent: "ma_consent_v1",
    visits: "ma_visit_count_v1",
    first: "ma_first_seen_v1",
    banner: "ma_banner_dismissed_v1",
  },
  // Se quiser forçar um ping direto (debug) caso fbq não ative, ligue:
  enableImageFallback = false,
}) {
  useEffect(() => {
    /* ===== Helpers iguais ao Elementor ===== */
    const setCookie = (name, value, days) => {
      try {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = "expires=" + d.toUTCString();
        const domain = location.hostname.startsWith("www.")
          ? location.hostname.substring(4)
          : location.hostname;
        document.cookie =
          name +
          "=" +
          encodeURIComponent(value) +
          ";" +
          expires +
          ";path=/;SameSite=Lax;domain=" +
          domain;
      } catch {}
    };
    const getCookie = (name) => {
      try {
        const n = name + "=";
        const ca = document.cookie.split(";");
        for (let i = 0; i < ca.length; i++) {
          const c = ca[i].trim();
          if (c.indexOf(n) === 0) return decodeURIComponent(c.substring(n.length));
        }
      } catch {}
      return null;
    };
    const setLS = (k, v) => {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch {}
    };
    const getLS = (k) => {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    };
    const saveKV = (k, v) => {
      setCookie(k, v, cookieDays);
      setLS(k, v);
    };
    const readKV = (k) => {
      const vCookie = getCookie(k);
      if (vCookie !== null) {
        setLS(k, vCookie);
        return vCookie;
      }
      const vLS = getLS(k);
      if (vLS !== null) {
        setCookie(k, vLS, cookieDays);
        return vLS;
      }
      return null;
    };

    /* ===== Consent ===== */
    const hasConsent =
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("cardapio/lgpdConsent") === "1") ||
      readKV(keys.consent) === "granted";

    /* ===== Meta Pixel: carregar + garantir ativo ===== */
    function loadMetaPixel(pixelId) {
      if (!pixelId || window.__MA_FB_INIT__) return;

      // Stub padrão (igual doc)
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = "2.0";
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

      // init + pageview (como no Elementor) — antes mesmo do script terminar de baixar
      try {
        window.fbq("init", pixelId);
        window.fbq("track", "PageView");
      } catch {}

      window.__MA_FB_INIT__ = true;
    }

    // Aguarda o Pixel constar em fbq.getState().pixelsByID (sinal de que está pronto)
    function waitForPixelActive(pixelId, timeoutMs = 1000) {
      return new Promise((resolve) => {
        const started = Date.now();
        const check = () => {
          try {
            const active =
              window.fbq &&
              typeof window.fbq.getState === "function" &&
              window.fbq.getState().pixelsByID &&
              window.fbq.getState().pixelsByID[pixelId];
            if (active) return resolve(true);
          } catch {}
          if (Date.now() - started > timeoutMs) return resolve(false);
          setTimeout(check, 80);
        };
        check();
      });
    }

    // fallback: envia diretamente para /tr com cd[...]
    function sendViaImage(eventName, params) {
      try {
        if (!metaPixelId) return;
        const u = new URL("https://www.facebook.com/tr");
        u.searchParams.set("id", metaPixelId);
        u.searchParams.set("ev", eventName);
        u.searchParams.set("dl", location.href);
        u.searchParams.set("rl", document.referrer || "");
        u.searchParams.set("if", "false");
        u.searchParams.set("v", "2.9.118");
        u.searchParams.set("ts", String(Date.now()));
        Object.entries(params || {}).forEach(([k, v]) => {
          u.searchParams.set(`cd[${k}]`, String(v));
        });
        // opcional: marcar como noscript
        // u.searchParams.set("noscript", "1");
        new Image().src = u.toString();
      } catch {}
    }

    /* ===== Visitas + status ===== */
    function bumpVisitCount() {
      let visits = Number(readKV(keys.visits) || 0);
      const firstSeen = readKV(keys.first);
      if (!firstSeen) {
        saveKV(keys.first, Date.now().toString());
        visits = 1;
      } else {
        visits = Math.max(1, visits + 1);
      }
      saveKV(keys.visits, String(visits));
      return visits;
    }
    const getStatus = (v) => (v === 1 ? "NewCustomer" : "RecurringCustomer");

    /* ===== Disparo (ordem idêntica ao Elementor) ===== */
    async function runFlow() {
      if (window.__MA_FLOW_DONE__) return;
      if (!metaPixelId) return;

      // carrega e espera ficar ativo
      loadMetaPixel(metaPixelId);
      const ready = await waitForPixelActive(metaPixelId);

      const visits = bumpVisitCount();
      const status = getStatus(visits);
      const baseParams = { brand, customerStatus: status, visitNumber: visits };

      // fbq primeiro (se ativo), igual ao Elementor
      if (ready) {
        try {
          window.fbq && window.fbq("trackCustom", "MenuOpen", baseParams);
          if (visits === 1) {
            window.fbq && window.fbq("trackCustom", "NewCustomer", baseParams);
          } else {
            window.fbq && window.fbq("trackCustom", "RecurringCustomer", baseParams);
          }
        } catch {}
      } else if (enableImageFallback) {
        // fallback opcional — garante cd[brand], cd[customerStatus], cd[visitNumber] no request
        sendViaImage("MenuOpen", baseParams);
        sendViaImage(visits === 1 ? "NewCustomer" : "RecurringCustomer", baseParams);
      }

      window.__MA_FLOW_DONE__ = true;
    }

    /* ===== Start ===== */
    let off = () => {};
    if (hasConsent) {
      runFlow();
    } else {
      const onGrant = () => {
        saveKV(keys.consent, "granted");
        runFlow();
      };
      window.addEventListener("ma:consent-granted", onGrant, { once: true });
      off = () => window.removeEventListener("ma:consent-granted", onGrant);
    }

    return () => off();
  }, [metaPixelId, brand, cookieDays, keys, enableImageFallback]);

  return null;
}
