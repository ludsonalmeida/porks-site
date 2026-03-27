// src/components/PixelLoader.jsx
import { useEffect } from 'react';

/**
 * PixelLoader:
 * Instala o Facebook Pixel para todo o site.
 * Usa o ID fornecido (2431106123757946).
 * Só carrega em produção.
 */
export default function PixelLoader() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    // Facebook Pixel base code
    !(function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    // Inicializa e dispara PageView
    window.fbq('init', '2431106123757946');
    window.fbq('track', 'PageView');
  },
  
  []);
  

  // Não renderiza nada em tela
  return null;
}
