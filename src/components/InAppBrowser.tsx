import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Globe, Search } from 'lucide-react';

interface Props {
  open: boolean;
  initialUrl?: string;
  onClose: () => void;
}

const QUICK_LINKS = [
  { label: 'WOL Bibliya', url: 'https://wol.jw.org/tl/wol/binav/r27/lp-tg' },
  { label: 'JW.org Tagalog', url: 'https://www.jw.org/tl/' },
  { label: 'Pag-aaral sa Bibliya', url: 'https://www.jw.org/tl/library/bibliya/bibliya-para-sa-pag-aaral/aklat/' },
  { label: 'Mga Publikasyon', url: 'https://www.jw.org/tl/library/' },
];

export default function InAppBrowser({ open, initialUrl, onClose }: Props) {
  const [url, setUrl] = useState(initialUrl || '');
  const [inputUrl, setInputUrl] = useState(initialUrl || '');
  const [loading, setLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const navigateTo = (newUrl: string) => {
    let finalUrl = newUrl.trim();
    if (finalUrl && !finalUrl.startsWith('http')) {
      if (finalUrl.includes('.')) {
        finalUrl = `https://${finalUrl}`;
      } else {
        finalUrl = `https://www.jw.org/tl/search/?q=${encodeURIComponent(finalUrl)}`;
      }
    }
    setUrl(finalUrl);
    setInputUrl(finalUrl);
    setLoading(true);
    setIframeError(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(inputUrl);
  };

  const handleRefresh = () => {
    if (iframeRef.current && url) {
      setLoading(true);
      setIframeError(false);
      iframeRef.current.src = url;
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
    // Sites like wol.jw.org and jw.org block iframes via X-Frame-Options.
    // When blocked, the iframe loads but we can't access contentDocument (cross-origin).
    // Always show error for known blocked domains.
    try {
      const blocked = /jw\.org|wol\.jw\.org/i.test(url);
      if (blocked) {
        setIframeError(true);
        return;
      }
      const doc = iframeRef.current?.contentDocument;
      if (doc && doc.body && doc.body.innerHTML.length < 10) {
        setIframeError(true);
      }
    } catch {
      setIframeError(true);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[71] bg-background flex flex-col"
          >
            {/* Top bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card safe-top">
              <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
              <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Maghanap o mag-type ng URL..."
                    className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <button type="submit" className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Navigation bar */}
            {url && (
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border bg-card">
                <button onClick={handleRefresh} className="p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors">
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded text-muted-foreground hover:bg-muted transition-colors"
                  title="I-refresh"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <span className="flex-1 text-xs text-muted-foreground truncate ml-2">{url}</span>
              </div>
            )}

            {/* Content area */}
            <div className="flex-1 overflow-hidden relative">
              {!url ? (
                <div className="p-5 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Mag-browse</h3>
                    <p className="text-sm text-muted-foreground">
                      Maghanap sa JW.org o mag-type ng URL sa itaas.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Mabilis na Link
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_LINKS.map((link) => (
                        <button
                          key={link.url}
                          onClick={() => navigateTo(link.url)}
                          className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted"
                        >
                          <Globe className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-sm font-medium text-foreground">{link.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Nilo-load...</p>
                      </div>
                    </div>
                  )}
                  {iframeError ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
                      <Globe className="h-12 w-12 text-muted-foreground" />
                      <p className="text-center text-sm text-muted-foreground">
                        Hindi ma-load ang site na ito sa loob ng app dahil sa mga security restriction ng website.
                      </p>
                      <p className="text-center text-xs text-muted-foreground/70">
                        {url}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setUrl(''); setIframeError(false); }}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          ← Bumalik sa Quick Links
                        </button>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      ref={iframeRef}
                      src={url}
                      className="w-full h-full border-0"
                      title="In-App Browser"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                      onLoad={handleIframeLoad}
                      onError={() => { setLoading(false); setIframeError(true); }}
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
