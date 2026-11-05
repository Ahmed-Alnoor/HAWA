/*!
 * Al Marwan chat window v1
 * Connects a website to the n8n workflow "Al Marwan Developments - Client Assistant v3".
 *
 * Add one line before </body> on the HAWA and D11 pages:
 *   <script src="almarwan-chat.js" data-webhook="YOUR_N8N_CHAT_URL" data-project="hawa" defer></script>
 *
 * Options (data- attributes on the script tag):
 *   data-webhook   the Chat URL from the n8n "When chat message received" node (required for live answers)
 *   data-project   hawa | d11 | empty for the general chat (sets colours, welcome buttons and tells the AI the page)
 *   data-lang      auto | en | ar   (auto follows <html lang>)
 *   data-bottom    distance from the bottom of the screen in px (default 20), to clear other sticky buttons
 *   data-open      true to open the chat when the page loads
 *   data-demo      true to show sample answers without n8n
 *   data-teaser    false to switch off the small greeting bubble
 */
(function () {
  'use strict';
  if (window.AlMarwanChat) return;

  var script = document.currentScript || document.querySelector('script[src*="almarwan-chat"]');
  function opt(name, fallback) {
    var v = script && script.getAttribute('data-' + name);
    var c = window.AlMarwanChatConfig;
    if ((v == null || v === '') && c && c[name] != null) v = c[name];
    return v == null || v === '' ? fallback : String(v);
  }
  var cfg = {
    webhook: opt('webhook', ''),
    project: opt('project', '').toLowerCase(),
    lang: opt('lang', 'auto'),
    bottom: parseInt(opt('bottom', '20'), 10) || 20,
    open: opt('open', 'false') === 'true',
    demo: opt('demo', 'false') === 'true',
    teaser: opt('teaser', 'true') !== 'false',
    phone: opt('phone', '80061'),
    phoneLabel: opt('phone-label', '800 61'),
    avoid: opt('avoid', '.mbar,.dock'), // the page's own sticky bars and forms the chat button must not cover
  };
  if (!/^https:\/\//i.test(cfg.webhook)) cfg.demo = true;
  if (cfg.project !== 'hawa' && cfg.project !== 'd11') cfg.project = '';

  var lang = cfg.lang === 'ar' || (cfg.lang === 'auto' && /^ar/i.test(document.documentElement.lang || '')) ? 'ar' : 'en';

  function storage(kind, key, value) {
    try {
      var s = kind === 'local' ? window.localStorage : window.sessionStorage;
      if (value === undefined) return s.getItem(key);
      s.setItem(key, value);
    } catch (e) { /* private mode or blocked storage */ }
    return null;
  }
  var sessionId = storage('local', 'amc-session');
  if (!sessionId) {
    sessionId = 'amc-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    storage('local', 'amc-session', sessionId);
  }

  // ---------------------------------------------------------------- text
  var T = {
    en: {
      launcher: 'Ask Al Marwan', title: 'Al Marwan Developments', status: 'Sales assistant · replies in seconds',
      placeholder: 'Type your message', photos: 'photos', plans: 'plans', explore: 'Tap to explore the map',
      directions: 'Get directions', call: 'Call', open: 'Open', close: 'Close chat', prev: 'Previous', next: 'Next',
      handoff: 'A sales consultant will contact you shortly.', error: 'The connection dropped for a moment. Please try again, or call us on',
      note: "Images are artist's impressions.", langBtn: 'ع', langLabel: 'العربية', send: 'Send',
      demo: 'Demo answers. Add your n8n Chat URL to go live.',
      welcome: {
        '': 'Welcome to Al Marwan Developments. I can show you District 11 and Hawa Residence, share floor plans and payment plans, or arrange a visit. What are you looking for?',
        hawa: 'Welcome to Hawa Residence in Tilal City. I can show you the apartments, the courtyards and the floor plans, or arrange a visit. What would you like to see first?',
        d11: 'Welcome to District 11 on E311. I can show you the offices, the floor plans and the payment plan, or arrange a visit. What would you like to see first?',
      },
      chips: {
        '': ['I need an office', 'I want a home', 'Payment plans', 'Book a visit'],
        hawa: ['Show me the amenities', 'Floor plans', 'Payment plan', 'Book a visit'],
        d11: ['Show me the offices', 'Floor plans', 'Payment plan', 'Where is it?'],
      },
      teaser: {
        '': 'Questions about our projects? I can help in seconds.',
        hawa: 'Thinking about Hawa? I can show you the apartments and the pool.',
        d11: 'Looking at District 11? I can show you the offices and floor plans.',
      },
    },
    ar: {
      launcher: 'تحدث مع المروان', title: 'المروان للتطوير العقاري', status: 'مساعد المبيعات · يرد خلال ثوانٍ',
      placeholder: 'اكتب رسالتك', photos: 'صور', plans: 'مخططات', explore: 'اضغط لاستكشاف الخريطة',
      directions: 'احصل على الاتجاهات', call: 'اتصل', open: 'فتح', close: 'إغلاق المحادثة', prev: 'السابق', next: 'التالي',
      handoff: 'سيتواصل معك أحد مستشاري المبيعات قريباً.', error: 'انقطع الاتصال للحظة. حاول مرة أخرى، أو اتصل بنا على',
      note: 'الصور تصورات فنية.', langBtn: 'EN', langLabel: 'English', send: 'إرسال',
      demo: 'إجابات تجريبية. أضف رابط محادثة n8n للتشغيل الفعلي.',
      welcome: {
        '': 'أهلاً بك في المروان للتطوير العقاري. يمكنني أن أعرض لك ديستركت 11 ومساكن هواء، وأشاركك المخططات وخطط الدفع، أو أرتب لك زيارة. عمّ تبحث؟',
        hawa: 'أهلاً بك في مساكن هواء في مدينة تلال. يمكنني أن أعرض لك الشقق والأفنية والمخططات، أو أرتب لك زيارة. ماذا تود أن ترى أولاً؟',
        d11: 'أهلاً بك في ديستركت 11 على شارع E311. يمكنني أن أعرض لك المكاتب والمخططات وخطة الدفع، أو أرتب لك زيارة. ماذا تود أن ترى أولاً؟',
      },
      chips: {
        '': ['أبحث عن مكتب', 'أبحث عن منزل', 'خطط الدفع', 'حجز زيارة'],
        hawa: ['أرني المرافق', 'المخططات', 'خطة الدفع', 'حجز زيارة'],
        d11: ['أرني المكاتب', 'المخططات', 'خطة الدفع', 'أين يقع المشروع؟'],
      },
      teaser: {
        '': 'لديك سؤال عن مشاريعنا؟ يسعدني مساعدتك.',
        hawa: 'تفكر في مساكن هواء؟ يمكنني أن أعرض لك الشقق والمسبح.',
        d11: 'تهتم بديستركت 11؟ يمكنني أن أعرض لك المكاتب والمخططات.',
      },
    },
  };
  function t(k) { return T[lang][k]; }

  // ---------------------------------------------------------------- theme
  var THEMES = {
    hawa: { accent: '#7E6249', ink: '#2E231A', dark: '#3A2C21', soft: '#F3ECE2', bg: '#F7F3ED', line: '#E8DDCE', muted: '#67554A' },
    d11: { accent: '#BD785B', ink: '#3A3835', dark: '#2B2A28', soft: '#EFE7DC', bg: '#F6F4EE', line: '#E6DACB', muted: '#66625C' },
    '': { accent: '#8A6A4F', ink: '#2B2622', dark: '#2B2622', soft: '#F2EDE6', bg: '#F8F6F2', line: '#E7E0D6', muted: '#6B625A' },
  };
  var th = THEMES[cfg.project];

  var ICON = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path d="M8.5 8.5h7M8.5 11.5h4.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/></svg>',
    out: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>',
  };

  // ---------------------------------------------------------------- styles
  var CSS = [
    ':host{all:initial}',
    '*{box-sizing:border-box}',
    '.root{--accent:' + th.accent + ';--ink:' + th.ink + ';--dark:' + th.dark + ';--soft:' + th.soft + ';--bg:' + th.bg + ';--line:' + th.line + ';--muted:' + th.muted + ';--bottom:' + cfg.bottom + 'px;',
    'font-family:"Radikal","Manrope",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased;font-size:14px;line-height:1.5}',
    '.root.ar{font-family:"Noto Kufi Arabic","Radikal","Manrope",system-ui,sans-serif}',
    'button,textarea{font-family:inherit}',
    'a{color:inherit}',
    // launcher + teaser
    '.launch{position:fixed;z-index:2147483000;inset-inline-end:var(--end,20px);bottom:var(--bottom);display:flex;align-items:center;gap:10px;height:52px;padding:0 22px 0 18px;border:0;border-radius:26px;background:var(--dark);color:#fff;font-size:14px;font-weight:600;letter-spacing:.01em;cursor:pointer;box-shadow:0 14px 34px -10px rgba(30,20,10,.55);transition:transform .25s ease,opacity .25s ease,bottom .3s ease,inset-inline-end .3s ease}',
    '.launch:hover{transform:translateY(-2px)}',
    '.launch svg{width:21px;height:21px}',
    '.launch.hide{opacity:0;pointer-events:none;transform:scale(.92)}',
    '.teaser{position:fixed;z-index:2147483000;inset-inline-end:var(--end,20px);bottom:calc(var(--bottom) + 64px);max-width:270px;padding:14px 38px 14px 16px;background:#fff;color:var(--ink);border-radius:16px;font-size:13.5px;line-height:1.5;box-shadow:0 18px 40px -14px rgba(30,20,10,.35),0 0 0 1px rgba(0,0,0,.04);cursor:pointer;opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .35s ease,transform .35s ease}',
    '.ar .teaser{padding:14px 16px 14px 38px}',
    '.teaser.show{opacity:1;transform:none;pointer-events:auto}',
    '.teaser button{position:absolute;top:8px;inset-inline-end:8px;width:24px;height:24px;border:0;border-radius:50%;background:var(--soft);color:var(--muted);cursor:pointer;display:grid;place-items:center;padding:0}',
    '.teaser button svg{width:12px;height:12px}',
    // panel
    '.panel{position:fixed;z-index:2147483001;inset-inline-end:20px;bottom:var(--bottom);width:400px;height:min(680px,calc(100vh - 40px));display:flex;flex-direction:column;background:var(--bg);border-radius:22px;overflow:hidden;box-shadow:0 32px 80px -24px rgba(30,20,10,.5),0 0 0 1px rgba(0,0,0,.05);opacity:0;transform:translateY(18px) scale(.98);transform-origin:bottom right;pointer-events:none;visibility:hidden;transition:opacity .28s ease,transform .28s ease,visibility 0s linear .28s}',
    '.panel.open{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition:opacity .28s ease,transform .28s ease}',
    '.head{display:flex;align-items:center;gap:12px;padding:16px 14px 15px 18px;background:var(--dark);color:#fff}',
    '.ar .head{padding:16px 18px 15px 14px}',
    '.mono{flex:0 0 40px;height:40px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.13);font-size:12.5px;font-weight:700;letter-spacing:.08em}',
    '.ht{flex:1;min-width:0}',
    '.ht b{display:block;font-size:15px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.ht span{display:flex;align-items:center;gap:6px;font-size:12px;opacity:.78;margin-top:2px}',
    '.ht span i{width:7px;height:7px;border-radius:50%;background:#83C98A;box-shadow:0 0 0 3px rgba(131,201,138,.22)}',
    '.hb{flex:0 0 34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.12);color:#fff;cursor:pointer;display:grid;place-items:center;font-size:13px;font-weight:700;padding:0;transition:background .2s}',
    '.hb:hover{background:rgba(255,255,255,.22)}',
    '.hb svg{width:16px;height:16px}',
    '.body{flex:1;overflow-y:auto;padding:18px 14px 6px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:var(--line) transparent}',
    '.demo{margin:0 0 14px;padding:8px 12px;border-radius:10px;background:var(--soft);color:var(--muted);font-size:11.5px;text-align:center}',
    // messages
    '.msg{display:flex;gap:8px;margin:0 0 12px;align-items:flex-start;animation:amc-in .35s ease both}',
    '@keyframes amc-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '.msg.user{justify-content:flex-end}',
    '.av{flex:0 0 28px;height:28px;border-radius:50%;background:var(--dark);color:#fff;display:grid;place-items:center;font-size:9.5px;font-weight:700;letter-spacing:.06em;margin-top:2px}',
    '.col{min-width:0;display:flex;flex-direction:column;gap:8px}',
    '.bot .col{flex:1}',
    '.user .col{max-width:82%}',
    '.bubble{padding:11px 14px;border-radius:16px;font-size:14px;line-height:1.6;overflow-wrap:anywhere}',
    '.bot .bubble{align-self:flex-start;max-width:100%;background:#fff;border:1px solid var(--line);border-start-start-radius:6px}',
    '.user .bubble{background:var(--dark);color:#fff;border-end-end-radius:6px}',
    '.bubble a{color:var(--accent);font-weight:600;text-decoration:none}',
    '.err .bubble{border-color:#E4BFAE}',
    // cards
    '.card{background:#fff;border:1px solid var(--line);border-radius:18px;overflow:hidden}',
    '.card-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:12px 14px 10px;font-size:13px;font-weight:600}',
    '.card-h small{font-size:11.5px;font-weight:500;color:var(--muted);white-space:nowrap}',
    // gallery carousel
    '.vp{position:relative}',
    '.track{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 14px;padding:0 14px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}',
    '.track::-webkit-scrollbar{display:none}',
    '.slide{position:relative;flex:0 0 84%;margin:0;aspect-ratio:4/3;border-radius:13px;overflow:hidden;background:var(--soft);scroll-snap-align:start;cursor:zoom-in}',
    '.single .slide{flex-basis:100%}',
    '.single .track{padding-bottom:14px}',
    '.slide img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .6s ease;-webkit-user-drag:none;user-select:none}',
    '.slide:hover img{transform:scale(1.035)}',
    '.slide figcaption{position:absolute;inset-inline:0;bottom:0;padding:30px 12px 10px;color:#fff;font-size:12.5px;font-weight:500;line-height:1.35;background:linear-gradient(rgba(20,14,8,0),rgba(20,14,8,.74))}',
    '.slide.broken{display:none}',
    '.plans .slide{aspect-ratio:1/1;background:#fff;border:1px solid var(--line)}',
    '.plans .slide img{object-fit:contain;padding:34px 12px 12px}',
    '.plans .slide:hover img{transform:none}',
    '.plans .slide figcaption{top:8px;bottom:auto;inset-inline:8px auto;padding:5px 9px;border-radius:8px;background:var(--soft);color:var(--ink);font-size:11.5px}',
    '.nav{position:absolute;top:50%;z-index:2;width:34px;height:34px;margin-top:-17px;border:0;border-radius:50%;background:rgba(255,255,255,.95);color:var(--ink);box-shadow:0 6px 16px rgba(0,0,0,.2);cursor:pointer;display:grid;place-items:center;padding:0;transition:opacity .2s,transform .2s}',
    '.nav:hover{transform:scale(1.07)}',
    '.nav svg{width:15px;height:15px}',
    '.nav.prev{left:22px}.nav.next{right:22px}',
    '.nav[disabled]{opacity:0;pointer-events:none}',
    '.gf{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 14px 13px}',
    '.dots{display:flex;gap:5px;direction:ltr}',
    '.dots i{width:6px;height:6px;border-radius:3px;background:var(--line);transition:width .25s,background .25s}',
    '.dots i.on{width:18px;background:var(--accent)}',
    '.count{font-size:11.5px;color:var(--muted);font-variant-numeric:tabular-nums;direction:ltr}',
    // map
    '.mapf{position:relative;aspect-ratio:16/10;background:var(--soft)}',
    '.mapf iframe{position:absolute;inset:0;width:100%;height:100%;border:0}',
    '.shield{position:absolute;inset:0;border:0;background:transparent;cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding:0 0 12px}',
    '.shield span{background:rgba(255,255,255,.96);color:var(--ink);font-size:12px;font-weight:600;padding:8px 13px;border-radius:16px;box-shadow:0 6px 16px rgba(0,0,0,.16)}',
    '.mb{padding:12px 14px 14px}',
    '.mb p{display:flex;gap:6px;margin:0 0 11px;font-size:12.5px;line-height:1.45;color:var(--muted)}',
    '.mb p svg{flex:0 0 15px;height:15px;margin-top:1px;color:var(--accent)}',
    '.btns{display:flex;flex-wrap:wrap;gap:8px}',
    '.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;padding:0 16px;border:0;border-radius:19px;background:var(--dark);color:#fff;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer;transition:opacity .2s}',
    '.btn:hover{opacity:.88}',
    '.btn svg{width:15px;height:15px}',
    '.btn.line{background:transparent;color:var(--ink);border:1px solid var(--line)}',
    // video, link, handoff
    '.card video{display:block;width:100%;aspect-ratio:16/9;background:#000}',
    '.link{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 14px;color:var(--ink);text-decoration:none;font-size:13.5px;font-weight:600}',
    '.link svg{width:17px;height:17px;color:var(--accent)}',
    '.handoff{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:16px;background:var(--soft);font-size:13px;line-height:1.45}',
    '.handoff>svg{flex:0 0 22px;height:22px;color:var(--accent)}',
    '.handoff div{flex:1}',
    '.handoff .btn{height:32px;padding:0 12px;font-size:12px;margin-top:8px}',
    // chips
    '.chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px;margin-inline-start:36px;animation:amc-in .35s ease .1s both}',
    '.chip{border:1px solid var(--accent);background:#fff;color:var(--accent);font-size:12.5px;font-weight:600;line-height:1;padding:9px 13px;border-radius:18px;cursor:pointer;transition:background .2s,color .2s}',
    '.chip:hover{background:var(--accent);color:#fff}',
    // typing
    '.typing .bubble{display:flex;gap:4px;padding:15px 16px}',
    '.typing i{width:6px;height:6px;border-radius:50%;background:var(--muted);animation:amc-dot 1.2s infinite ease-in-out}',
    '.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}',
    '@keyframes amc-dot{0%,60%,100%{opacity:.25;transform:none}30%{opacity:1;transform:translateY(-3px)}}',
    // composer
    '.foot{padding:10px 12px 10px;border-top:1px solid var(--line);background:var(--bg)}',
    '.comp{display:flex;align-items:flex-end;gap:8px;padding:5px;padding-inline-start:16px;background:#fff;border:1px solid var(--line);border-radius:24px;transition:border-color .2s}',
    '.comp:focus-within{border-color:var(--accent)}',
    'textarea{flex:1;min-width:0;border:0;outline:0;resize:none;background:transparent;color:var(--ink);font-size:14px;line-height:1.45;max-height:110px;padding:8px 0;margin:0}',
    'textarea::placeholder{color:var(--muted);opacity:.8}',
    '.send{flex:0 0 38px;height:38px;border:0;border-radius:50%;background:var(--dark);color:#fff;cursor:pointer;display:grid;place-items:center;padding:0;transition:opacity .2s}',
    '.send[disabled]{opacity:.3;cursor:default}',
    '.send svg{width:17px;height:17px}',
    '.ar .send svg,.ar .launch svg{transform:scaleX(-1)}',
    '.note{margin:7px 0 0;font-size:10.5px;color:var(--muted);text-align:center}',
    '.note a{text-decoration:none;font-weight:600}',
    // lightbox
    '.lb{position:fixed;inset:0;z-index:2147483002;display:none;flex-direction:column;align-items:center;justify-content:center;padding:60px 16px 26px;background:rgba(17,12,8,.95)}',
    '.lb.open{display:flex}',
    '.lb img{max-width:min(1100px,100%);max-height:calc(100% - 64px);object-fit:contain;border-radius:10px;user-select:none;-webkit-user-drag:none}',
    '.lb.plans img{background:#fff;padding:18px}',
    '.lbc{margin-top:14px;color:#fff;font-size:14px;text-align:center;opacity:.92}',
    '.lbx{position:absolute;top:14px;inset-inline-end:14px;width:40px;height:40px;border:0;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;cursor:pointer;display:grid;place-items:center;padding:0}',
    '.lbx svg{width:18px;height:18px}',
    '.lb .nav{position:fixed}.lb .nav.prev{left:16px}.lb .nav.next{right:16px}',
    // mobile
    '@media (max-width:520px){',
    '.panel{inset:0;width:100%;height:100%;border-radius:0}',
    '.launch{height:54px;padding:0 18px 0 16px}',
    '.teaser{max-width:calc(100vw - 32px)}',
    '.slide{flex-basis:86%}',
    '}',
    '@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}',
  ].join('\n');

  // ---------------------------------------------------------------- helpers
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function btn(cls, html, label) {
    var b = el('button', cls);
    b.type = 'button';
    if (html) b.innerHTML = html;
    if (label) b.setAttribute('aria-label', label);
    return b;
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function formatText(s) {
    var html = escapeHtml(s)
      .replace(/\bhttps?:\/\/[^\s<]+/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; })
      .replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.-]+)/g, '$1<a href="mailto:$2">$2</a>')
      .replace(/\b800\s?61\b/g, '<a href="tel:' + cfg.phone + '">$&</a>');
    return html.replace(/\n/g, '<br>');
  }

  // ---------------------------------------------------------------- DOM
  var host, root, wrap, launcher, teaser, panel, body, input, sendBtn, lb, lbImg, lbCap, lbPrev, lbNext;
  var langBtn, titleEl, statusEl, noteEl, launchLabel;
  var started = false, busy = false, chipsEl = null;

  function build() {
    if (!document.getElementById('amc-fonts')) {
      var link = document.createElement('link');
      link.id = 'amc-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Noto+Kufi+Arabic:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }
    host = el('div');
    host.id = 'almarwan-chat';
    document.body.appendChild(host);
    root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    var style = el('style');
    style.textContent = CSS;
    root.appendChild(style);
    wrap = el('div', 'root');
    root.appendChild(wrap);

    // launcher
    launcher = btn('launch', ICON.chat);
    launchLabel = el('span');
    launcher.appendChild(launchLabel);
    launcher.addEventListener('click', openChat);
    wrap.appendChild(launcher);

    // teaser bubble
    teaser = el('div', 'teaser');
    teaser.setAttribute('role', 'button');
    var teaserText = el('span');
    var teaserX = btn('', ICON.x, 'Dismiss');
    teaser.appendChild(teaserText);
    teaser.appendChild(teaserX);
    teaser.addEventListener('click', openChat);
    teaserX.addEventListener('click', function (e) { e.stopPropagation(); hideTeaser(); storage('session', 'amc-teaser', '1'); });
    wrap.appendChild(teaser);

    // panel
    panel = el('div', 'panel');
    panel.setAttribute('role', 'dialog');
    var head = el('div', 'head');
    head.appendChild(el('div', 'mono', 'AM'));
    var ht = el('div', 'ht');
    titleEl = el('b');
    statusEl = el('span');
    ht.appendChild(titleEl);
    ht.appendChild(statusEl);
    head.appendChild(ht);
    langBtn = btn('hb');
    langBtn.addEventListener('click', function () { setLang(lang === 'ar' ? 'en' : 'ar'); });
    head.appendChild(langBtn);
    var closeBtn = btn('hb', ICON.x);
    closeBtn.addEventListener('click', closeChat);
    head.appendChild(closeBtn);
    panel.appendChild(head);

    body = el('div', 'body');
    body.setAttribute('aria-live', 'polite');
    panel.appendChild(body);

    var foot = el('div', 'foot');
    var comp = el('div', 'comp');
    input = el('textarea');
    input.rows = 1;
    input.maxLength = 800;
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 110) + 'px';
      sendBtn.disabled = busy || !input.value.trim();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
    });
    sendBtn = btn('send', ICON.send);
    sendBtn.disabled = true;
    sendBtn.addEventListener('click', submit);
    comp.appendChild(input);
    comp.appendChild(sendBtn);
    foot.appendChild(comp);
    noteEl = el('p', 'note');
    foot.appendChild(noteEl);
    panel.appendChild(foot);
    wrap.appendChild(panel);

    // lightbox
    lb = el('div', 'lb');
    lb.setAttribute('role', 'dialog');
    lbImg = el('img');
    lbCap = el('div', 'lbc');
    var lbX = btn('lbx', ICON.x, 'Close');
    lbPrev = btn('nav prev', ICON.left);
    lbNext = btn('nav next', ICON.right);
    lbX.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(-1); });
    lbNext.addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx == null) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) stepLightbox(dx < 0 ? 1 : -1);
      tx = null;
    });
    lb.appendChild(lbX);
    lb.appendChild(lbPrev);
    lb.appendChild(lbImg);
    lb.appendChild(lbCap);
    lb.appendChild(lbNext);
    wrap.appendChild(lb);

    document.addEventListener('keydown', function (e) {
      if (lb.classList.contains('open')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') stepLightbox(-1);
        if (e.key === 'ArrowRight') stepLightbox(1);
      } else if (e.key === 'Escape' && panel.classList.contains('open')) {
        closeChat();
      }
    });

    applyLang();
    updateOffset();
    var offsetFrame = 0;
    var queueOffset = function () { cancelAnimationFrame(offsetFrame); offsetFrame = requestAnimationFrame(updateOffset); };
    window.addEventListener('resize', queueOffset);
    window.addEventListener('scroll', queueOffset, { passive: true });
    setInterval(updateOffset, 800); // sticky bars that slide in after a delay
    if (cfg.lang === 'auto' && window.MutationObserver) {
      new MutationObserver(function () {
        var l = /^ar/i.test(document.documentElement.lang || '') ? 'ar' : 'en';
        if (l !== lang) setLang(l);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
    if (cfg.open) openChat();
    else if (cfg.teaser && !storage('session', 'amc-teaser')) {
      setTimeout(function () {
        if (!panel.classList.contains('open')) { teaserText.textContent = T[lang].teaser[cfg.project]; teaser.classList.add('show'); }
      }, 6000);
    }
  }

  function applyLang() {
    wrap.className = 'root' + (lang === 'ar' ? ' ar' : '');
    wrap.dir = lang === 'ar' ? 'rtl' : 'ltr';
    wrap.lang = lang;
    launchLabel.textContent = t('launcher');
    launcher.setAttribute('aria-label', t('launcher'));
    titleEl.textContent = t('title');
    statusEl.innerHTML = '<i></i>' + escapeHtml(t('status'));
    langBtn.textContent = t('langBtn');
    langBtn.setAttribute('aria-label', t('langLabel'));
    input.placeholder = t('placeholder');
    sendBtn.setAttribute('aria-label', t('send'));
    panel.setAttribute('aria-label', t('title'));
    noteEl.innerHTML = escapeHtml(t('note')) + ' · <a href="tel:' + escapeHtml(cfg.phone) + '">' + escapeHtml(t('call') + ' ' + cfg.phoneLabel) + '</a>';
    lbPrev.setAttribute('aria-label', t('prev'));
    lbNext.setAttribute('aria-label', t('next'));
  }
  // Keeps the chat button clear of the page's own sticky elements (phone call/enquire bar, side forms).
  function updateOffset() {
    if (!wrap) return;
    var W = window.innerWidth, H = window.innerHeight, rtl = lang === 'ar';
    var bottom = cfg.bottom, end = W <= 520 ? 16 : 20;
    var nodes = [];
    try { nodes = cfg.avoid ? document.querySelectorAll(cfg.avoid) : []; } catch (e) { nodes = []; }
    Array.prototype.forEach.call(nodes, function (n) {
      var r = n.getBoundingClientRect();
      if (!r.width || !r.height || r.top >= H - 1 || r.bottom <= H - 140) return; // not at the bottom of the screen
      var cs = window.getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return;
      if (rtl ? r.left > 300 : r.right < W - 300) return; // not on the chat button's side
      if (r.width >= W * 0.6) bottom = Math.max(bottom, Math.round(H - r.top) + 12); // full-width bar: sit above it
      else end = Math.max(end, Math.round(rtl ? r.right : W - r.left) + 12);         // side form: sit beside it
    });
    wrap.style.setProperty('--bottom', bottom + 'px');
    wrap.style.setProperty('--end', end + 'px');
  }

  function setLang(next) {
    lang = next;
    applyLang();
    updateOffset();
    if (chipsEl && !body.querySelector('.msg.user')) { chipsEl.remove(); chipsEl = null; addChips(T[lang].chips[cfg.project]); }
  }

  function hideTeaser() { teaser.classList.remove('show'); }
  function openChat() {
    hideTeaser();
    storage('session', 'amc-teaser', '1');
    panel.classList.add('open');
    launcher.classList.add('hide');
    if (!started) {
      started = true;
      if (cfg.demo) body.appendChild(el('div', 'demo', t('demo')));
      renderBot({ text: T[lang].welcome[cfg.project], media: [], suggestions: T[lang].chips[cfg.project], handoff: false });
    }
    setTimeout(function () { if (window.matchMedia('(min-width:521px)').matches) input.focus(); }, 250);
  }
  function closeChat() {
    panel.classList.remove('open');
    launcher.classList.remove('hide');
  }

  // ---------------------------------------------------------------- messages
  function scrollToEnd() { body.scrollTop = body.scrollHeight; }
  function scrollToNode(node) {
    var top = node.offsetTop - 10;
    body.scrollTo ? body.scrollTo({ top: top, behavior: 'smooth' }) : (body.scrollTop = top);
  }

  function addUser(text) {
    var row = el('div', 'msg user');
    var col = el('div', 'col');
    var b = el('div', 'bubble', text);
    b.dir = 'auto';
    col.appendChild(b);
    row.appendChild(col);
    body.appendChild(row);
    scrollToEnd();
  }
  function addTyping() {
    var row = el('div', 'msg bot typing');
    row.appendChild(el('div', 'av', 'AM'));
    var col = el('div', 'col');
    var b = el('div', 'bubble');
    b.innerHTML = '<i></i><i></i><i></i>';
    col.appendChild(b);
    row.appendChild(col);
    body.appendChild(row);
    scrollToEnd();
    return row;
  }
  function addChips(list) {
    if (!list || !list.length) return;
    chipsEl = el('div', 'chips');
    list.slice(0, 4).forEach(function (label) {
      var c = btn('chip');
      c.textContent = label;
      c.dir = 'auto';
      c.addEventListener('click', function () { send(label); });
      chipsEl.appendChild(c);
    });
    body.appendChild(chipsEl);
  }
  function clearChips() { if (chipsEl) { chipsEl.remove(); chipsEl = null; } }

  function renderBot(r, isError) {
    var row = el('div', 'msg bot' + (isError ? ' err' : ''));
    row.appendChild(el('div', 'av', 'AM'));
    var col = el('div', 'col');
    if (r.text) {
      var b = el('div', 'bubble');
      b.dir = 'auto';
      b.innerHTML = formatText(r.text);
      col.appendChild(b);
    }
    (r.media || []).forEach(function (m) {
      var card = null;
      try {
        if (m.type === 'gallery') card = galleryCard(m);
        else if (m.type === 'map') card = mapCard(m);
        else if (m.type === 'video') card = videoCard(m);
        else if (m.type === 'link') card = linkCard(m);
        else if (m.type === 'image') card = galleryCard({ title: m.caption || m.title || '', kind: 'photos', items: [{ url: m.url, caption: m.caption }] });
      } catch (e) { card = null; }
      if (card) col.appendChild(card);
    });
    if (r.handoff) col.appendChild(handoffCard());
    row.appendChild(col);
    body.appendChild(row);
    addChips(r.suggestions);
    scrollToNode(row);
  }

  // ---------------------------------------------------------------- cards
  function galleryCard(m) {
    var items = (m.items || []).filter(function (i) { return i && i.url; });
    if (!items.length) return null;
    var plans = m.kind === 'plans';
    var single = items.length === 1;
    var card = el('div', 'card gal' + (plans ? ' plans' : '') + (single ? ' single' : ''));
    var head = el('div', 'card-h');
    var title = el('span', null, m.title || '');
    title.dir = 'auto';
    head.appendChild(title);
    if (!single) head.appendChild(el('small', null, items.length + ' ' + (plans ? t('plans') : t('photos'))));
    card.appendChild(head);

    var vp = el('div', 'vp');
    var track = el('div', 'track');
    track.dir = 'ltr';
    items.forEach(function (it, i) {
      var fig = el('figure', 'slide');
      var img = el('img');
      img.src = it.url;
      img.alt = it.caption || m.title || '';
      img.loading = i < 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      img.addEventListener('error', function () { fig.classList.add('broken'); });
      fig.appendChild(img);
      if (it.caption) {
        var cap = el('figcaption', null, it.caption);
        cap.dir = 'auto';
        fig.appendChild(cap);
      }
      fig.addEventListener('click', function () { openLightbox(items, i, plans); });
      track.appendChild(fig);
    });
    vp.appendChild(track);
    card.appendChild(vp);
    if (single) return card;

    var prev = btn('nav prev', ICON.left, t('prev'));
    var next = btn('nav next', ICON.right, t('next'));
    vp.appendChild(prev);
    vp.appendChild(next);
    var foot = el('div', 'gf');
    var dots = el('div', 'dots');
    items.forEach(function () { dots.appendChild(el('i')); });
    if (items.length > 10) dots.style.visibility = 'hidden';
    var count = el('span', 'count');
    foot.appendChild(dots);
    foot.appendChild(count);
    card.appendChild(foot);

    function stepSize() {
      var first = track.children[0];
      return first ? first.getBoundingClientRect().width + 8 : track.clientWidth;
    }
    function atEnd() { return track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; }
    function update() {
      var i = atEnd() ? items.length - 1 : Math.max(0, Math.min(items.length - 1, Math.round(track.scrollLeft / stepSize())));
      count.textContent = (i + 1) + ' / ' + items.length;
      Array.prototype.forEach.call(dots.children, function (d, j) { d.classList.toggle('on', j === i); });
      prev.disabled = track.scrollLeft < 4;
      next.disabled = atEnd();
    }
    prev.addEventListener('click', function (e) { e.stopPropagation(); track.scrollBy({ left: -stepSize(), behavior: 'smooth' }); });
    next.addEventListener('click', function (e) { e.stopPropagation(); track.scrollBy({ left: stepSize(), behavior: 'smooth' }); });
    var frame = 0;
    track.addEventListener('scroll', function () { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }, { passive: true });
    setTimeout(update, 30);
    return card;
  }

  function mapCard(m) {
    var card = el('div', 'card map');
    var head = el('div', 'card-h');
    var title = el('span', null, m.title || m.name || '');
    title.dir = 'auto';
    head.appendChild(title);
    card.appendChild(head);
    var place = m.address && m.name && m.address.indexOf(m.name) === 0 ? m.address : [m.name, m.address].filter(Boolean).join(', ');
    var q = m.lat != null && m.lng != null ? m.lat + ',' + m.lng : place;
    var frame = el('div', 'mapf');
    var iframe = el('iframe');
    iframe.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=15&hl=' + lang + '&output=embed';
    iframe.loading = 'lazy';
    iframe.title = m.title || m.name || 'Map';
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    frame.appendChild(iframe);
    var shield = btn('shield');
    shield.appendChild(el('span', null, t('explore')));
    shield.addEventListener('click', function () { shield.remove(); });
    frame.appendChild(shield);
    card.appendChild(frame);
    var mb = el('div', 'mb');
    if (m.address) {
      var p = el('p');
      p.innerHTML = ICON.pin;
      var addr = el('span', null, m.address);
      addr.dir = 'auto';
      p.appendChild(addr);
      mb.appendChild(p);
    }
    var btns = el('div', 'btns');
    var go = el('a', 'btn');
    go.href = m.url || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
    go.target = '_blank';
    go.rel = 'noopener';
    go.innerHTML = ICON.pin + escapeHtml(t('directions'));
    btns.appendChild(go);
    var call = el('a', 'btn line');
    call.href = 'tel:' + cfg.phone;
    call.innerHTML = ICON.phone + escapeHtml(t('call') + ' ' + cfg.phoneLabel);
    btns.appendChild(call);
    mb.appendChild(btns);
    card.appendChild(mb);
    return card;
  }

  function videoCard(m) {
    var card = el('div', 'card');
    var head = el('div', 'card-h');
    head.appendChild(el('span', null, m.title || ''));
    card.appendChild(head);
    var v = el('video');
    v.src = m.url;
    if (m.poster) v.poster = m.poster;
    v.controls = true;
    v.playsInline = true;
    v.preload = 'none';
    card.appendChild(v);
    return card;
  }

  function linkCard(m) {
    var card = el('div', 'card');
    var a = el('a', 'link');
    a.href = m.url;
    a.target = '_blank';
    a.rel = 'noopener';
    var s = el('span', null, m.title || t('open'));
    s.dir = 'auto';
    a.appendChild(s);
    a.insertAdjacentHTML('beforeend', ICON.out);
    card.appendChild(a);
    return card;
  }

  function handoffCard() {
    var box = el('div', 'handoff');
    box.innerHTML = ICON.check;
    var d = el('div');
    d.appendChild(el('div', null, t('handoff')));
    var call = el('a', 'btn');
    call.href = 'tel:' + cfg.phone;
    call.innerHTML = ICON.phone + escapeHtml(t('call') + ' ' + cfg.phoneLabel);
    d.appendChild(call);
    box.appendChild(d);
    return box;
  }

  // ---------------------------------------------------------------- lightbox
  var lbItems = [], lbIndex = 0;
  function openLightbox(items, i, plans) {
    lbItems = items;
    lbIndex = i;
    lb.classList.toggle('plans', !!plans);
    showLightbox();
    lb.classList.add('open');
  }
  function showLightbox() {
    var it = lbItems[lbIndex];
    lbImg.src = it.url;
    lbImg.alt = it.caption || '';
    lbCap.textContent = (it.caption ? it.caption + '   ·   ' : '') + (lbIndex + 1) + ' / ' + lbItems.length;
    lbCap.dir = 'auto';
    lbPrev.disabled = lbIndex === 0;
    lbNext.disabled = lbIndex === lbItems.length - 1;
  }
  function stepLightbox(d) {
    var n = lbIndex + d;
    if (n < 0 || n >= lbItems.length) return;
    lbIndex = n;
    showLightbox();
  }
  function closeLightbox() { lb.classList.remove('open'); }

  // ---------------------------------------------------------------- talking to n8n
  function submit() { send(input.value); }

  function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    clearChips();
    addUser(text);
    input.value = '';
    input.style.height = 'auto';
    busy = true;
    sendBtn.disabled = true;
    var typing = addTyping();
    ask(text)
      .then(function (res) { typing.remove(); renderBot(normalise(res)); })
      .catch(function () {
        typing.remove();
        renderBot({ text: t('error') + ' ' + cfg.phoneLabel + '.', media: [], suggestions: [], handoff: false }, true);
      })
      .then(function () {
        busy = false;
        sendBtn.disabled = !input.value.trim();
      });
  }

  function normalise(res) {
    if (Array.isArray(res)) res = res[0] || {};
    if (res && res.json) res = res.json;
    res = res || {};
    return {
      text: String(res.text || res.output || ''),
      media: Array.isArray(res.media) ? res.media : [],
      suggestions: Array.isArray(res.suggestions) ? res.suggestions.map(String) : [],
      handoff: res.handoff === true,
    };
  }

  function ask(text) {
    if (cfg.demo) return demoAnswer(text);
    var controller = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 45000);
    return fetch(cfg.webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendMessage',
        sessionId: sessionId,
        chatInput: text,
        metadata: { project: cfg.project, lang: lang, page: String(location.href).slice(0, 200) },
      }),
      signal: controller ? controller.signal : undefined,
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }, function (e) { clearTimeout(timer); throw e; });
  }

  // ---------------------------------------------------------------- demo answers (no n8n needed)
  var HW = 'https://ahmed-alnoor.github.io/HAWA/assets/images/';
  var DD = 'https://ahmed-alnoor.github.io/ALM/assets/images/';
  function gal(title, kind, base, list) {
    return { type: 'gallery', kind: kind, title: title, items: list.map(function (p) { return { url: base + p[0] + '.webp', caption: p[1] }; }) };
  }
  var OFFICE_MAP = { type: 'map', title: 'District 11 Sales Office', url: 'https://maps.app.goo.gl/EmRhSJgA6nsAXPw8A', lat: 25.323638, lng: 55.458859, name: 'District 11 Sales Office', address: 'Sheikh Mohammed Bin Zayed Rd (E311), Muwaileh Commercial, Sharjah' };
  var DEMO = [
    { re: /\d{7,}/, r: { text: 'Thank you. A sales consultant will call you shortly to confirm your visit to the District 11 Sales Office.', media: [OFFICE_MAP], suggestions: [], handoff: true } },
    { re: /book|visit|call me|viewing|حجز|زيارة/i, r: { text: 'It would be a pleasure to welcome you. May I have your name, mobile number and a preferred time, so a consultant can confirm your visit?', media: [], suggestions: [], handoff: false } },
    { re: /amenit|pool|facilit|life|مرافق|مسبح/i, r: { text: 'Hawa is built around three courtyards, each 35 by 35 metres, with a large swimming pool, a splash pad for children and shaded cabanas. Downstairs, cafes and shops sit right at your door. Are you thinking of living there, or renting it out?', media: [gal('Amenities at Hawa', 'photos', HW, [['courtyard-pool', 'A large pool in the courtyard'], ['pool-wide', 'Three courtyards, each 35 by 35 metres'], ['pool-sunset', 'Sunset swims'], ['pool-cabana', 'Shade by the pool'], ['kids-splash', "Children's splash pad"], ['retail-promenade', 'Cafes, dining and boutiques at your door'], ['garden-walk', 'Walking paths beside the residences'], ['cycle-track', 'A morning ride on the Masaar track']])], suggestions: ['Show me the layouts', 'What is the price?', 'Where exactly is it?'] } },
    { re: /plan|layout|bedroom|studio|مخطط|غرف/i, r: { text: 'Hawa offers two studio layouts, two one-bedroom layouts and three two-bedroom layouts; the B layouts add a balcony or terrace. Which size suits you best?', media: [gal('All Hawa floor plans', 'plans', HW, [['plan-studio-a', 'Studio, layout A'], ['plan-studio-b', 'Studio, layout B with balcony'], ['plan-1br-a', 'One bedroom, layout A'], ['plan-1br-b', 'One bedroom, layout B with balcony'], ['plan-2br-a', 'Two bedroom, layout A with balcony'], ['plan-2br-b', 'Two bedroom, layout B with terrace'], ['plan-2br-c', 'Two bedroom, layout C with terrace']])], suggestions: ['Studio', 'One bedroom', 'Two bedroom'] } },
    { re: /where|location|map|direction|أين|موقع/i, r: { text: 'Our sales office is at District 11, directly on E311 in Muwaileh, next to City Centre Al Zahia and five minutes from Sharjah Airport. Would you like to book a visit?', media: [gal('Where District 11 is', 'photos', DD, [['location-map', 'District 11 on E311, beside City Centre Al Zahia'], ['aerial', 'The District 11 plot beside E311, from above']]), OFFICE_MAP], suggestions: ['Book a visit', 'Show me the offices'] } },
    { re: /office|d11|district|clinic|business|مكتب|ديستركت/i, r: { text: 'District 11 sits directly on E311, five minutes from Sharjah Airport, with a 368-key business hotel for your visiting clients and more than 3,000 parking spaces. It is already 75% sold. Would you like to see the office floor plans?', media: [gal('Life at District 11', 'photos', DD, [['night-arcades', 'The plaza'], ['interior-signature-lobby', 'Signature lobbies'], ['interior-reception', 'Reception lobbies'], ['interior-lounge', 'Business lounges'], ['interior-event-lounge', 'Event hall'], ['interior-wellness', 'Wellness studio'], ['interior-cafe', 'Cafes'], ['interior-valet', 'Valet drop-off']])], suggestions: ['Show me the floor plans', 'Payment plan', 'Where is it?'] } },
    { re: /price|cost|pay|سعر|دفع/i, r: { text: 'Hawa starts from AED 592,000 with 5% down and 1% a month, handover Q4 2028. District 11 offices start from AED 2.2 million on a 40/60 plan with 5% down. Which project interests you more?', media: [], suggestions: ['Hawa Residence', 'District 11'] } },
  ];
  function demoAnswer(text) {
    var hit = null;
    for (var i = 0; i < DEMO.length && !hit; i++) if (DEMO[i].re.test(text)) hit = DEMO[i].r;
    var r = hit || { text: 'This is a demo answer. Add your n8n Chat URL to get real answers. Try asking about the amenities, the floor plans, the offices or the location.', media: [], suggestions: ['Show me the amenities', 'Floor plans', 'Where is it?'] };
    return new Promise(function (resolve) { setTimeout(function () { resolve(r); }, 650); });
  }

  // ---------------------------------------------------------------- start
  window.AlMarwanChat = {
    open: function () { openChat(); },
    close: function () { closeChat(); },
    send: function (text) { openChat(); send(text); },
  };
  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
