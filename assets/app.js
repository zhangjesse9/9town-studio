/* 9-Town Studio — rendering, routing, language switch, motion */
(function () {
  'use strict';
  var S = window.SITE, G = window.GALLERY, P = S.projects;
  var BASE = window.ASSET_BASE || 'assets/img/';
  var app = document.getElementById('app');
  var hdr = document.getElementById('hdr');
  var curtain = document.getElementById('curtain');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lang = 'en';
  try {
    lang = localStorage.getItem('lang') || (/^zh/i.test(navigator.language || '') ? 'zh' : 'en');
  } catch (e) { /* storage unavailable */ }

  var state = { filter: 'all', view: 'grid' };
  var heroTimer = null, io = null;

  function t(o) { return o == null ? '' : (typeof o === 'string' ? o : (o[lang] || o.en || '')); }
  function u(k) { return t(S.ui[k]); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function src(f) { return BASE + f; }
  function cover(p) { return G[p.slug][0]; }
  function find(slug) { for (var i = 0; i < P.length; i++) if (P[i].slug === slug) return P[i]; return null; }
  function area(n) { return n ? n.toLocaleString('en-US') + ' m²' : ''; }
  function arrow() { return '<span class="arr" aria-hidden="true">→</span>'; }
  function href(p) { return '#p-' + p.slug; }
  function view() { return lang === 'zh' ? '查看' : 'View'; }
  /* split a heading into masked pieces that rise into place */
  function split(s) {
    var parts = lang === 'zh' ? s.split('') : s.split(' ');
    return parts.map(function (w, i) {
      return '<span class="w"><i style="--d:' + (i * (lang === 'zh' ? 28 : 55)) + 'ms">' + esc(w) + '</i></span>';
    }).join(lang === 'zh' ? '' : ' ');
  }
  function clock() {
    try {
      return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Shanghai', hour12: false }).format(new Date());
    } catch (e) { return ''; }
  }

  /* ---------- chrome ---------- */
  var NAV = [['projects', 'projects'], ['studio', 'studio'], ['architect', 'zhang-yingpeng'], ['contact', 'contact']];

  function renderChrome(route) {
    var links = NAV.map(function (n, i) {
      var on = route === n[1] || (n[1] === 'projects' && route === 'project');
      return '<a href="#' + n[1] + '"' + (on ? ' class="on"' : '') + '><sup>' + pad(i + 1) + '</sup>' + esc(u(n[0])) + '</a>';
    }).join('');
    document.getElementById('nav').innerHTML = links;
    document.getElementById('menu').innerHTML = '<nav>' + links + '</nav><p class="mono">' + nl(t(S.firm.address)) + '<br>' + S.firm.email + '</p>';
    document.getElementById('lang').setAttribute('data-lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.getElementById('ftr').innerHTML =
      '<div class="wrap ftr-in">' +
        '<div class="ftr-a"><img src="' + src('logo-red.png') + '" alt="九城都市 9-Town Studio" width="570" height="187"><p>' + esc(t(S.firm.full)) + '</p></div>' +
        '<div><h4>' + esc(u('address')) + '</h4><p>' + nl(t(S.firm.address)) + '</p></div>' +
        '<div><h4>' + esc(u('contact')) + '</h4><p>' + S.firm.email + '<br>' + S.firm.tel + '</p></div>' +
        '<div><h4>' + esc(u('offices')) + '</h4><p>' + esc(t(S.firm.offices)) + '<br><span class="mono">' + (lang === 'zh' ? '苏州时间 ' : 'Suzhou ') + '<span class="js-clock">' + clock() + '</span></span></p></div>' +
      '</div>' +
      '<a class="ftr-w" href="#home" aria-label="9-Town Studio"><span>9-TOWN</span><span>STUDIO</span></a>' +
      '<div class="wrap ftr-b mono"><span>© 2002–' + new Date().getFullYear() + ' ' + esc(t(S.firm.full)) + '. ' + esc(u('rights')) + '</span></div>';
  }

  /* ---------- pages ---------- */
  function home() {
    var H = S.home;
    var slides = H.heroSlugs.map(find);
    var html = '<section class="hero" id="hero">' +
      slides.map(function (p, i) {
        return '<div class="slide' + (i === 0 ? ' on' : '') + '"><div style="background-image:url(' + src(cover(p).f) + ')"></div></div>';
      }).join('') +
      '<div class="hero-shade"></div>' +
      '<div class="hero-side mono" aria-hidden="true">' + (lang === 'zh' ? '苏州 · 上海 — 始于 2002' : 'Suzhou · Shanghai — Est. 2002') + '</div>' +
      '<div class="hero-caps wrap">' + slides.map(function (p, i) {
        return '<a class="hero-cap' + (i === 0 ? ' on' : '') + '" href="' + href(p) + '" data-cur="' + view() + '">' +
          '<span class="mono hero-i">' + esc(t(S.cats[p.cat])) + ' — ' + esc(t(p.loc)) + (p.year ? ' — ' + p.year : '') + '</span>' +
          '<h1>' + split(t(p.name)) + '</h1>' +
          '<p>' + esc(t(p.tag)) + '</p></a>';
      }).join('') + '</div>' +
      '<div class="hero-foot wrap"><div class="hero-dots">' + slides.map(function (p, i) {
        return '<button type="button" data-i="' + i + '"' + (i === 0 ? ' class="on"' : '') + ' aria-label="' + (i + 1) + '"><i></i></button>';
      }).join('') + '</div><div class="hero-n mono"><b id="heroN">01</b> / ' + pad(slides.length) + '</div></div>' +
      '</section>';

    html += '<section class="stmt wrap"><p class="mono kick" data-r>' + (lang === 'zh' ? '（主张）' : '(Manifesto)') + '</p><h2 data-r>' + t(H.statement) + '</h2>' +
      '<div class="stmt-b" data-r><p>' + esc(t(H.intro)) + '</p>' +
      '<a class="lnk" href="#studio">' + esc(u('readMore')) + ' ' + arrow() + '</a></div></section>';

    var hl = ['zhengyi-campus', 'huaqiao-art-sports-center', 'yulin-grottoes', 'xiangcheng-church', 'health-town-pavilion', 'liangxi-memorial'].map(find);
    html += '<section class="hl" id="hl"><div class="hl-bg">' + hl.map(function (p, i) {
      return '<img loading="lazy" src="' + src(cover(p).f) + '" alt=""' + (i === 0 ? ' class="on"' : '') + '>';
    }).join('') + '</div><div class="wrap"><p class="mono kick">' + (lang === 'zh' ? '（精选作品）' : '(Selected works)') + '</p><ul>' + hl.map(function (p, i) {
      return '<li data-r><a href="' + href(p) + '" data-i="' + i + '" data-cur="' + view() + '"><span class="mono">' + (p.year || '') + '</span><h3>' + esc(t(p.name)) + '</h3><span class="mono hl-c">' + esc(t(S.cats[p.cat])) + '</span></a></li>';
    }).join('') + '</ul><a class="lnk" href="#projects">' + esc(u('allProjects')) + ' <sup class="mono">' + P.length + '</sup> ' + arrow() + '</a></div></section>';

    var words = t(H.marquee).map(function (w) { return '<span>' + esc(w) + '</span><b></b>'; }).join('');
    html += '<div class="marquee" aria-hidden="true"><div>' + words + words + words + words + '</div></div>';

    html += '<section class="wrap nine-sec"><header class="sec-h" data-r><h2>' + esc(u('selected')) + '</h2></header><div class="ninegrid">';
    var k = 0;
    H.nineSlugs.forEach(function (slug) {
      if (!slug) {
        html += '<a class="nt nt-c" href="#projects"><span>' + nl(u('nineCta')) + ' ' + arrow() + '</span></a>';
        return;
      }
      var p = find(slug); k++;
      html += '<a class="nt" href="' + href(p) + '" data-cur="' + view() + '"><img loading="lazy" src="' + src(cover(p).f) + '" alt="' + esc(t(p.name)) + '">' +
        '<div><h3>' + esc(t(p.name)) + '</h3><p class="mono">' + esc(t(p.loc)) + '</p></div></a>';
    });
    html += '</div></section>';

    var Z = S.person;
    html += '<section class="who"><div class="wrap who-in">' +
      '<img data-r src="' + src('zhang-yingpeng.jpg') + '" alt="' + esc(t(Z.name)) + '" width="536" height="518">' +
      '<div data-r><blockquote>“' + esc(t(Z.quote)) + '”</blockquote>' +
      '<p class="who-n"><strong>' + esc(t(Z.name)) + '</strong> <span class="mono">' + esc(t(Z.role)) + '</span></p>' +
      '<a class="lnk" href="#zhang-yingpeng">' + esc(u('meet')) + ' ' + arrow() + '</a></div></div></section>';

    app.innerHTML = html;

    var hero = document.getElementById('hero'), cur = 0;
    function go(i) {
      var prev = cur;
      cur = (i + slides.length) % slides.length;
      if (prev === cur) return;
      [].forEach.call(hero.querySelectorAll('.slide'), function (el, j) {
        el.classList.toggle('was', j === prev);
        el.classList.toggle('on', j === cur);
      });
      ['.hero-cap', '.hero-dots button'].forEach(function (sel) {
        [].forEach.call(hero.querySelectorAll(sel), function (el, j) { el.classList.toggle('on', j === cur); });
      });
      document.getElementById('heroN').textContent = pad(cur + 1);
    }
    function start() { clearInterval(heroTimer); heroTimer = setInterval(function () { go(cur + 1); }, 6500); }
    hero.querySelector('.hero-dots').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      go(+b.getAttribute('data-i')); start();
    });
    start();

    var hlEl = document.getElementById('hl');
    hlEl.addEventListener('mouseover', function (e) {
      var a = e.target.closest('a[data-i]'); if (!a) return;
      var n = +a.getAttribute('data-i');
      [].forEach.call(hlEl.querySelectorAll('.hl-bg img'), function (im, j) { im.classList.toggle('on', j === n); });
    });
  }

  function projects() {
    var cats = ['all'].concat(Object.keys(S.cats));
    var html = '<section class="wrap page-h"><p class="mono kick">' + (lang === 'zh' ? '（2002 — 至今）' : '(2002 — now)') + '</p><h1>' + split(u('projects')) + '<sup class="mono">' + P.length + '</sup></h1>' +
      '<div class="bar"><div class="filters" id="filters">' + cats.map(function (c) {
        var n = c === 'all' ? P.length : P.filter(function (p) { return p.cat === c; }).length;
        return '<button type="button" data-c="' + c + '"' + (state.filter === c ? ' class="on"' : '') + '>' + esc(c === 'all' ? u('all') : t(S.cats[c])) + '<sup class="mono">' + n + '</sup></button>';
      }).join('') + '</div>' +
      '<div class="views mono" id="views">' + ['grid', 'list'].map(function (v) {
        return '<button type="button" data-v="' + v + '"' + (state.view === v ? ' class="on"' : '') + '>' + esc(u(v)) + '</button>';
      }).join('') + '</div></div></section>' +
      '<section class="wrap" id="plist"></section>';
    app.innerHTML = html;
    drawList();
    document.getElementById('filters').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.filter = b.getAttribute('data-c'); mark(this, b); drawList();
    });
    document.getElementById('views').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.view = b.getAttribute('data-v'); mark(this, b); drawList();
    });
  }
  function mark(box, b) { [].forEach.call(box.children, function (x) { x.classList.toggle('on', x === b); }); }

  var SPAN = [7, 5, 4, 4, 4, 5, 7, 6, 6];
  function drawList() {
    var list = P.filter(function (p) { return state.filter === 'all' || p.cat === state.filter; });
    var el = document.getElementById('plist'), html;
    if (state.view === 'grid') {
      html = '<div class="grid">' + list.map(function (p, i) {
        var c = cover(p), s = SPAN[i % SPAN.length];
        return '<a class="tile s' + s + '" href="' + href(p) + '" data-cur="' + view() + '" style="animation-delay:' + (i * 45) + 'ms">' +
          '<div class="tile-i"><img loading="lazy" src="' + src(c.f) + '" alt="' + esc(t(p.name)) + '">' +
          '<span class="tile-n mono">' + pad(P.indexOf(p) + 1) + '</span>' +
          '<div class="tile-o"><p>' + esc(t(p.tag)) + '</p></div></div>' +
          '<div class="tile-t"><h3>' + esc(t(p.name)) + '</h3><p class="mono">' + esc(t(S.cats[p.cat])) + (p.year ? ' — ' + p.year : '') + '</p></div></a>';
      }).join('') + '</div>';
    } else {
      html = '<div class="rows"><div class="row row-h mono"><span>No.</span><span>' + esc(u('name')) + '</span><span>' + esc(u('type')) + '</span><span>' + esc(u('location')) + '</span><span>' + esc(u('year')) + '</span><span>' + esc(u('area')) + '</span></div>' +
        list.map(function (p, i) {
          return '<a class="row" href="' + href(p) + '" data-img="' + src(cover(p).f) + '" style="animation-delay:' + (i * 25) + 'ms">' +
            '<span class="mono">' + pad(P.indexOf(p) + 1) + '</span><span class="row-n">' + esc(t(p.name)) + '</span><span class="mono">' + esc(t(S.cats[p.cat])) + '</span><span class="mono">' + esc(t(p.loc)) + '</span><span class="mono">' + (p.year || '—') + '</span><span class="mono">' + (area(p.area) || '—') + '</span></a>';
        }).join('') + '</div>';
    }
    el.innerHTML = html;
  }

  function project(slug) {
    var p = find(slug);
    if (!p) return missing();
    var imgs = G[slug], c = imgs[0];
    var facts = [
      ['type', t(S.cats[p.cat])], ['location', t(p.loc)], ['design', p.design], ['completed', p.year],
      ['area', area(p.area)], ['client', t(p.client)], ['lead', t(p.lead)], ['team', t(p.team)],
      ['partner', t(p.partner)], ['materials', t(p.materials)], ['recognition', t(p.awards)],
      ['photo', (imgs.filter(function (x) { return x.ph; })[0] ? u(imgs.filter(function (x) { return x.ph; })[0].ph) : '')]
    ].filter(function (f) { return f[1]; });
    var idx = P.indexOf(p), nx = P[(idx + 1) % P.length];

    var html = '<section class="phero"><div class="phero-im" id="pim"><img src="' + src(c.f) + '" alt="' + esc(t(c)) + '" data-lb="0"></div>' +
      '<div class="hero-shade"></div><div class="phero-t wrap"><span class="mono hero-i">' + pad(idx + 1) + ' / ' + pad(P.length) + ' — ' + esc(t(S.cats[p.cat])) + '</span><h1>' + split(t(p.name)) + '</h1></div></section>' +
      '<section class="wrap pstrip mono">' + [['location', t(p.loc)], ['completed', p.year], ['area', area(p.area)]].filter(function (f) { return f[1]; }).map(function (f) {
        return '<div><span>' + esc(u(f[0])) + '</span><b>' + esc(f[1]) + '</b></div>';
      }).join('') + '</section>' +
      '<section class="wrap pbody"><div class="ptext"><p class="lead" data-r>' + esc(t(p.tag)) + '</p>' + p.text.map(function (x) { return '<p data-r>' + esc(t(x)) + '</p>'; }).join('') + '</div>' +
      '<aside data-r><dl class="mono">' + facts.map(function (f) {
        return '<div><dt>' + esc(u(f[0])) + '</dt><dd>' + esc(f[1]) + '</dd></div>';
      }).join('') + '</dl></aside></section>';

    if (imgs.length > 1) {
      var rest = imgs.slice(1), i = 0, wantFull = true, g = '';
      var fig = function (m, n, cls) {
        return '<figure class="' + cls + '" data-r><img loading="lazy" src="' + src(m.f) + '" width="' + m.w + '" height="' + m.h + '" alt="' + esc(t(m)) + '" data-lb="' + (n + 1) + '" data-cur="+"><figcaption class="mono">' + pad(n + 1) + (t(m) ? ' — ' + esc(t(m)) : '') + '</figcaption></figure>';
      };
      while (i < rest.length) {
        var m = rest[i], land = m.w / m.h >= 1.25;
        if (i === rest.length - 1 || (wantFull && land)) { g += fig(m, i, land ? 'full' : 'solo'); i += 1; }
        else { g += fig(m, i, 'half') + fig(rest[i + 1], i + 1, 'half'); i += 2; }
        wantFull = !wantFull;
      }
      html += '<section class="pgal">' + g + '</section>';
    }
    html += '<a class="pnext" href="' + href(nx) + '" data-cur="' + (lang === 'zh' ? '下一个' : 'Next') + '"><img loading="lazy" src="' + src(cover(nx).f) + '" alt=""><div class="wrap"><span class="mono">' + esc(u('next')) + ' — ' + pad(P.indexOf(nx) + 1) + '</span><h2>' + esc(t(nx.name)) + ' ' + arrow() + '</h2></div></a>';
    app.innerHTML = html;
    app.setAttribute('data-slug', slug);
  }

  function rowsList(title, items) {
    return '<div class="tl" data-r><h2>' + esc(t(title)) + '</h2><ul>' + items.map(function (x) {
      return '<li><span class="mono">' + esc(x.y || '') + '</span><div><strong>' + esc(t(x.t || x.a)) + '</strong>' + (x.p || x.j ? '<em>' + esc(t(x.p || x.j)) + '</em>' : '') + '</div></li>';
    }).join('') + '</ul></div>';
  }

  function studio() {
    var D = S.studio;
    app.innerHTML = '<section class="wrap page-h"><p class="mono kick">(' + esc(u('studio')) + ')</p><h1 class="h-xl">' + split(t(D.title)) + '</h1></section>' +
      '<section class="banner" data-r><img src="' + src('studio-office.jpg') + '" alt=""></section>' +
      '<section class="wrap cols"><div class="stats" data-r>' + D.stats.map(function (s) {
        return '<div><b>' + s.n + '</b><span class="mono">' + esc(t(s.l)) + '</span></div>';
      }).join('') + '</div><div class="prose">' + D.paras.map(function (x) { return '<p data-r>' + esc(t(x)) + '</p>'; }).join('') + '</div></section>' +
      '<section class="svc"><div class="wrap"><h2 class="mono kick">(' + esc(t(D.servicesTitle)) + ')</h2><ul>' + D.services.map(function (s, i) {
        return '<li data-r><i class="mono">' + pad(i + 1) + '</i>' + esc(t(s)) + '</li>';
      }).join('') + '</ul></div></section>' +
      '<section class="wrap">' + rowsList(D.awardsTitle, D.awards) +
      '<div class="tl" data-r><h2>' + esc(t(D.booksTitle)) + '</h2><ul>' + D.books.map(function (b, i) {
        return '<li><span class="mono">' + pad(i + 1) + '</span><div><strong>' + esc(t(b)) + '</strong></div></li>';
      }).join('') + '</ul></div></section>' +
      '<section class="wrap cta"><a class="big" href="#projects">' + esc(u('allProjects')) + ' ' + arrow() + '</a></section>';
  }

  function person() {
    var Z = S.person;
    app.innerHTML = '<section class="wrap page-h zh-h"><div><p class="mono kick">(' + esc(t(Z.role)) + ')</p><h1 class="h-xl">' + split(t(Z.name)) + '</h1>' +
      '<ul class="tags mono">' + Z.titles.map(function (x) { return '<li>' + esc(t(x)) + '</li>'; }).join('') + '</ul></div>' +
      '<img src="' + src('zhang-yingpeng.jpg') + '" alt="' + esc(t(Z.name)) + '" width="536" height="518"></section>' +
      '<section class="quote"><div class="wrap"><blockquote data-r>“' + esc(t(Z.quote)) + '”</blockquote></div></section>' +
      '<section class="wrap cols"><div></div><div class="prose">' + Z.paras.map(function (x) { return '<p data-r>' + esc(t(x)) + '</p>'; }).join('') + '</div></section>' +
      '<section class="wrap">' + rowsList(Z.eduTitle, Z.edu) + rowsList(Z.careerTitle, Z.career) + rowsList(Z.honoursTitle, Z.honours) + rowsList(Z.writingTitle, Z.writing) + '</section>' +
      '<section class="wrap cta"><a class="big" href="#projects">' + esc(u('allProjects')) + ' ' + arrow() + '</a></section>';
  }

  function contact() {
    var F = S.firm, C = S.contact;
    app.innerHTML = '<section class="wrap page-h"><p class="mono kick">(' + esc(u('contact')) + ')</p><h1 class="h-xl">' + split(t(C.title)) + '</h1></section>' +
      '<section class="wrap ct"><p class="big ct-mail" id="mail">' + F.email + '</p><button class="copy mono" id="copy" type="button">' + (lang === 'zh' ? '复制邮箱' : 'Copy address') + '</button><p class="ct-n">' + esc(t(C.note)) + '</p>' +
      '<div class="ct-g" data-r>' +
      '<div><h4>' + esc(u('address')) + '</h4><p>' + esc(t(F.full)) + '<br>' + nl(t(F.address)) + '</p></div>' +
      '<div><h4>' + esc(u('tel')) + '</h4><p class="mono">' + F.tel + '</p><h4>' + esc(u('fax')) + '</h4><p class="mono">' + F.fax + '</p></div>' +
      '<div><h4>' + esc(u('offices')) + '</h4><p>' + esc(t(F.offices)) + '</p><p class="mono">' + (lang === 'zh' ? '苏州时间 ' : 'Suzhou ') + '<span class="js-clock">' + clock() + '</span></p></div>' +
      '</div></section>' +
      '<section class="banner" data-r><img src="' + src('zhengyi-campus-01.jpg') + '" alt=""></section>';
    document.getElementById('copy').addEventListener('click', function () {
      var b = this, done = function () { b.textContent = lang === 'zh' ? '已复制' : 'Copied'; };
      var sel = function () { var r = document.createRange(); r.selectNodeContents(document.getElementById('mail')); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); };
      try { navigator.clipboard.writeText(F.email).then(done, sel); } catch (e) { sel(); }
    });
  }

  function missing() {
    app.innerHTML = '<section class="wrap page-h"><h1 class="h-xl">404</h1><p>' + esc(u('notFound')) + '</p><a class="lnk" href="#home">' + esc(t(S.firm.name)) + ' ' + arrow() + '</a></section>';
  }

  /* ---------- router ---------- */
  function parse() {
    var h = location.hash.replace(/^#\/?/, '');
    if (h.indexOf('project/') === 0) h = 'p-' + h.slice(8);
    if (!h || h === 'home') return { route: 'home', arg: '' };
    if (h.slice(0, 2) === 'p-') return { route: 'project', arg: h.slice(2) };
    return { route: h, arg: '' };
  }

  function render(keepScroll) {
    clearInterval(heroTimer);
    var r = parse();
    closeMenu(); closeLb(); hidePeek(); setCur(null);
    app.removeAttribute('data-slug');
    renderChrome(r.route);
    var title = '';
    if (r.route === 'home') home();
    else if (r.route === 'projects') { projects(); title = u('projects'); }
    else if (r.route === 'project') { project(r.arg); var p = find(r.arg); title = p ? t(p.name) : ''; }
    else if (r.route === 'studio') { studio(); title = u('studio'); }
    else if (r.route === 'zhang-yingpeng') { person(); title = t(S.person.name); }
    else if (r.route === 'contact') { contact(); title = u('contact'); }
    else missing();
    document.title = (title ? title + ' — ' : '') + (lang === 'zh' ? '九城都市 9-Town Studio' : '9-Town Studio 九城都市');
    document.body.className = 'r-' + r.route + (r.route === 'home' || (r.route === 'project' && find(r.arg)) ? ' has-hero' : '');
    if (!keepScroll) window.scrollTo(0, 0);
    observe();
    onScroll();
  }

  /* scroll reveals: content is readable before it settles, it only drifts into place */
  function observe() {
    if (io) io.disconnect();
    var els = app.querySelectorAll('[data-r]');
    if (reduce || !('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    [].forEach.call(els, function (el) { el.classList.add('rv'); io.observe(el); });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY;
      var over = document.body.classList.contains('has-hero') && y < window.innerHeight * 0.7;
      hdr.classList.toggle('over', over);
      hdr.classList.toggle('scrolled', y > 8);
      var pim = document.getElementById('pim');
      if (pim && !reduce && y < window.innerHeight) pim.style.transform = 'translate3d(0,' + (y * 0.28) + 'px,0) scale(' + (1 + y / 6000) + ')';
    });
  }

  function navigate() {
    if (reduce || !curtain) return render(false);
    curtain.className = 'curtain in';
    setTimeout(function () {
      render(false);
      curtain.className = 'curtain out';
      setTimeout(function () { curtain.className = 'curtain'; }, 620);
    }, 430);
  }

  /* ---------- menu ---------- */
  var menu = document.getElementById('menu'), menuBtn = document.getElementById('menuBtn');
  function closeMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('lock'); hdr.classList.remove('menu-open'); }
  menuBtn.addEventListener('click', function () {
    if (!menu.hidden) return closeMenu();
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); document.documentElement.classList.add('lock'); hdr.classList.add('menu-open');
  });

  /* ---------- language ---------- */
  document.getElementById('lang').addEventListener('click', function () {
    lang = lang === 'en' ? 'zh' : 'en';
    try { localStorage.setItem('lang', lang); } catch (e) { /* ignore */ }
    render(true);
  });

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lb'), lbI = 0, lbList = [];
  function showLb(i) {
    lbI = (i + lbList.length) % lbList.length;
    var m = lbList[lbI];
    lb.querySelector('img').src = src(m.f);
    lb.querySelector('img').alt = t(m);
    lb.querySelector('figcaption').textContent = pad(lbI + 1) + ' / ' + pad(lbList.length) + '   ' + t(m) + (m.ph ? '   © ' + u(m.ph) : '');
  }
  function closeLb() { lb.hidden = true; document.documentElement.classList.remove('lock'); }
  app.addEventListener('click', function (e) {
    var im = e.target.closest('img[data-lb]'); if (!im) return;
    lbList = G[app.getAttribute('data-slug')] || [];
    if (!lbList.length) return;
    lb.hidden = false; document.documentElement.classList.add('lock');
    showLb(+im.getAttribute('data-lb'));
  });
  lb.addEventListener('click', function (e) {
    if (e.target.closest('.lb-p')) showLb(lbI - 1);
    else if (e.target.closest('.lb-n') || e.target.tagName === 'IMG') showLb(lbI + 1);
    else closeLb();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLb(); closeMenu(); }
    if (lb.hidden) return;
    if (e.key === 'ArrowLeft') showLb(lbI - 1);
    if (e.key === 'ArrowRight') showLb(lbI + 1);
  });

  /* ---------- index hover preview ---------- */
  var peek = document.getElementById('peek');
  function hidePeek() { peek.classList.remove('on'); }
  app.addEventListener('mousemove', function (e) {
    var row = e.target.closest('a.row');
    if (!row) return hidePeek();
    var url = row.getAttribute('data-img');
    if (peek.getAttribute('data-u') !== url) { peek.style.backgroundImage = 'url(' + url + ')'; peek.setAttribute('data-u', url); }
    var x = Math.min(e.clientX + 28, window.innerWidth - 400), y = Math.min(e.clientY + 28, window.innerHeight - 280);
    peek.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    peek.classList.add('on');
  });
  app.addEventListener('mouseleave', hidePeek);

  /* ---------- cursor ---------- */
  var cur = document.getElementById('cur'), cx = -100, cy = -100, tx = -100, ty = -100;
  function setCur(label) {
    if (!cur) return;
    cur.classList.toggle('big', !!label);
    cur.firstChild.textContent = label || '';
  }
  if (cur && fine && !reduce) {
    document.documentElement.classList.add('has-cur');
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY; cur.classList.add('live');
      var el = e.target.closest ? e.target.closest('[data-cur]') : null;
      setCur(el ? el.getAttribute('data-cur') : null);
    });
    document.addEventListener('mouseleave', function () { cur.classList.remove('live'); });
    (function loop() {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
  }

  setInterval(function () {
    [].forEach.call(document.querySelectorAll('.js-clock'), function (el) { el.textContent = clock(); });
  }, 30000);

  window.addEventListener('hashchange', navigate);
  window.addEventListener('scroll', onScroll, { passive: true });
  render(true);

  /* intro: nine squares, then the page */
  var intro = document.getElementById('intro');
  if (intro) {
    var seen = false;
    try { seen = sessionStorage.getItem('intro') === '1'; sessionStorage.setItem('intro', '1'); } catch (e) { /* ignore */ }
    if (seen || reduce) intro.remove();
    else {
      intro.classList.add('go');
      setTimeout(function () { intro.classList.add('done'); }, 1500);
      setTimeout(function () { intro.remove(); }, 2300);
    }
  }
})();
