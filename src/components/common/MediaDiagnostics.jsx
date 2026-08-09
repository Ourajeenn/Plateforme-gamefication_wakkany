import React, { useEffect, useRef, useState } from 'react';

export default function MediaDiagnostics() {
  const [logs, setLogs] = useState([]);
  const [visible, setVisible] = useState(false);
  const observerRef = useRef(null);

  const push = (text) => {
    const entry = `${new Date().toLocaleTimeString()} — ${text}`;
    setLogs((s) => [entry, ...s].slice(0, 100));
    // also mirror to console for convenience
    console.warn('[MediaDiagnostics]', entry);
  };

  useEffect(() => {
    const onWindowError = (ev) => {
      try {
        if (ev instanceof ErrorEvent) {
          push(`window error: ${ev.message} @ ${ev.filename}:${ev.lineno}`);
        } else {
          push(`window error: ${String(ev)}`);
        }
      } catch (e) { console.error(e); }
    };

    const onRejection = (ev) => {
      push(`unhandledrejection: ${ev.reason && ev.reason.message ? ev.reason.message : String(ev.reason)}`);
    };

    window.addEventListener('error', onWindowError, true);
    window.addEventListener('unhandledrejection', onRejection);

    const attachToMedia = (el) => {
      if (!el || el._mediaDiagnosticsAttached) return;
      el._mediaDiagnosticsAttached = true;
      el.addEventListener('error', (e) => push(`${el.tagName} error src=${el.currentSrc || el.src} code=${e?.target?.error?.code || ''}`));
      el.addEventListener('canplay', () => push(`${el.tagName} canplay src=${el.currentSrc || el.src}`));
      el.addEventListener('loadeddata', () => push(`${el.tagName} loadeddata src=${el.currentSrc || el.src}`));
      el.addEventListener('play', () => push(`${el.tagName} play`));
      el.addEventListener('pause', () => push(`${el.tagName} pause`));
    };

    // initial attach
    document.querySelectorAll('video,audio,iframe').forEach(attachToMedia);

    // Observe for future media elements
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches && node.matches('video,audio,iframe')) attachToMedia(node);
          node.querySelectorAll && node.querySelectorAll('video,audio,iframe').forEach(attachToMedia);
        }
      }
    });
    mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    observerRef.current = mo;

    return () => {
      window.removeEventListener('error', onWindowError, true);
      window.removeEventListener('unhandledrejection', onRejection);
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const copyLogs = async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n'));
      push('logs copied to clipboard');
    } catch (e) {
      push('copy failed: ' + String(e));
    }
  };

  return (
    <div>
      <button
        onClick={() => setVisible((v) => !v)}
        title="Toggle media diagnostics"
        style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 1200, padding: '8px 10px', borderRadius: 8, background: '#111', color: '#ffd571', border: '1px solid rgba(255,213,113,0.15)' }}
      >
        Media diag
      </button>

      {visible && (
        <div style={{ position: 'fixed', right: 12, bottom: 56, zIndex: 1200, width: 420, maxHeight: '40vh', overflow: 'auto', background: 'rgba(10,10,10,0.9)', color: '#eee', padding: 10, borderRadius: 8, fontSize: 12, boxShadow: '0 6px 24px rgba(0,0,0,0.6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <strong>Media diagnostics</strong>
            <div>
              <button onClick={copyLogs} style={{ marginRight: 8, padding: '4px 8px' }}>Copy</button>
              <button onClick={() => setLogs([])} style={{ padding: '4px 8px' }}>Clear</button>
            </div>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: '1.3' }}>
            {logs.length === 0 ? <div style={{ color: '#888' }}>(no logs yet)</div> : logs.map((l, i) => <div key={i} style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>{l}</div>)}
          </div>
        </div>
      )}
    </div>
  );
}
