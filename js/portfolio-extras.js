/* ===================================================
   js/portfolio-extras.js — Swanand Kadam Portfolio
   1. Interactive "All Work" Preview + Case Study Modal
   2. Interactive 6-Stage Journey Flow
   3. Live GitHub Contributions Heatmap (@swanandkadam8061)
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- 1. All Work Index + Case Study Modal ----------
  const PROJECTS = {
    voicekhata: {
      eyebrow: 'Team Project · Hackday',
      title: 'VoiceKhata — Voice Ledger for Shopkeepers',
      summary: 'A voice-powered credit ledger for neighbourhood shopkeepers — speak transactions, review parsed items, and store entries offline or via FastAPI + SQLite.',
      problem: 'Small shopkeepers and local vendors often lack the time or typing speed to maintain digital financial records, making manual ledgers slow and error-prone.',
      solution: 'VoiceKhata transcribes spoken credit (Udhar) and debit entries, extracts amounts and customer names, and logs transactions in the browser or to a FastAPI + SQLite backend.',
      contribution: 'I connected the review form to the authenticated ledger, fixed Hindi amount and customer parsing, and added transcription retries that preserve manual corrections.',
      stack: ['HTML5', 'CSS3', 'Vanilla JS', 'Web Speech API', 'localStorage', 'FastAPI'],
      links: [
        { label: 'Live Demo ↗', href: 'https://nishantekka2007-sys.github.io/voicekhata-hackday/', primary: true },
        { label: 'GitHub ↗', href: 'https://github.com/nishantekka2007-sys/voicekhata-hackday', primary: false }
      ]
    },
    braintrust: {
      eyebrow: 'Personal Project · LLM Tooling',
      title: 'Brain Trust — Multi-Model LLM Workspace',
      summary: 'Send one shared conversation to multiple language models on Groq or OpenRouter and compare their answers side by side in a single browser workspace.',
      problem: 'Switching between separate AI chat tabs makes it tedious to compare reasoning, latency, and phrasing across models on the same prompt.',
      solution: 'Brain Trust dispatches a unified prompt stream through a lightweight Node.js gateway to Groq and OpenRouter endpoints and renders model outputs side by side.',
      contribution: 'Built the browser workspace and Node.js gateway, plus session-scoped personal API key upload/paste handling.',
      stack: ['Node.js', 'JavaScript', 'Groq API', 'OpenRouter', 'HTML/CSS'],
      links: [
        { label: 'Repository ↗', href: 'https://github.com/swanandkadam8061/Brain-Trust', primary: true },
        { label: 'Workspace Commit ↗', href: 'https://github.com/swanandkadam8061/Brain-Trust/commit/465bda7bdf383af3ff38f7dc8a44858917b3e746', primary: false }
      ]
    },
    perplexity: {
      eyebrow: 'Personal Project · In-Browser ML',
      title: 'Perplexity Explorer — Token Probability Visualizer',
      summary: 'Runs DistilGPT-2 directly in the browser via Transformers.js to show how each individual word or token drives a sentence’s perplexity score.',
      problem: 'Perplexity is often treated as an opaque single number, hiding which unexpected token actually caused the spike.',
      solution: 'Computes per-token log-probabilities client-side with DistilGPT-2 and displays the top-8 next-token predictions plus an editable probability simulator.',
      contribution: 'Implemented token scoring, top-8 next-token predictions, and the interactive simulator before model download.',
      stack: ['JavaScript', 'Transformers.js', 'DistilGPT-2', 'HTML & CSS'],
      links: [
        { label: 'Repository ↗', href: 'https://github.com/swanandkadam8061/Perplexity-Explorer', primary: true },
        { label: 'Implementation Commit ↗', href: 'https://github.com/swanandkadam8061/Perplexity-Explorer/commit/4028d6f9035a902dcbb8454d11362bf4c67e4b75', primary: false }
      ]
    },
    assistant: {
      eyebrow: 'Personal Project · This Site',
      title: 'Browser AI Portfolio & 3D Locker',
      summary: 'Client-side portfolio featuring a CSS 3D parallax locker hero, Three.js sculpted guide characters, and an offline-first AI assistant with optional Ollama support.',
      problem: 'Static portfolios don’t let visitors query project details interactively without paying for hosted LLM APIs.',
      solution: 'Combines an instant deterministic intent engine with optional local Ollama endpoints, accessible dialog controls, and lightweight Three.js character guides.',
      contribution: 'Sole developer — designed and built the 3D locker interaction, Three.js guide dolls, AI assistant dialog, and S&AI-compliant layout.',
      stack: ['Vanilla JS', 'Three.js', 'WebGL', 'Ollama API', 'CSS 3D'],
      links: [
        { label: 'Repository ↗', href: 'https://github.com/swanandkadam8061/Portfolio', primary: true },
        { label: 'View Hero ↑', href: '#hero', primary: false }
      ]
    },
    sai: {
      eyebrow: 'Open Source · S&AI Program',
      title: 'S&AI AI-For-Beginners Contributions',
      summary: 'Ten tested Python labs for the AI-For-Beginners curriculum.',
      problem: 'Students need small examples that show what happens when an algorithm encounters ambiguous or invalid input.',
      solution: 'Each lab pairs a runnable example with tests and lesson notes.',
      contribution: 'I submitted tasks R38-T051 through R38-T060, covering topics from deterministic elite selection to training-only imputation.',
      stack: ['Python', 'unittest', 'Markdown'],
      links: [
        { label: 'View My PRs ↗', href: 'https://github.com/S-AI-Projects/AI-For-Beginners/pulls?q=is%3Apr+author%3Aswanandkadam8061', primary: true },
        { label: 'Repository ↗', href: 'https://github.com/S-AI-Projects/AI-For-Beginners', primary: false }
      ]
    }
  };

  const workItems = document.querySelectorAll('.work-item');
  const peekMain  = document.getElementById('peekMain');
  const caseModal = document.getElementById('projectCaseModal');
  const caseClose = document.getElementById('caseModalCloseBtn');
  const caseEyebrow = document.getElementById('caseModalEyebrow');
  const caseTitle   = document.getElementById('caseModalTitle');
  const caseBody    = document.getElementById('caseModalBody');
  const caseFoot    = document.getElementById('caseModalFoot');

  function renderPeek(key) {
    const p = PROJECTS[key];
    if (!p || !peekMain) return;
    peekMain.innerHTML = '';

    const eye = document.createElement('div');
    eye.className = 'peek-eyebrow';
    eye.textContent = p.eyebrow;

    const h4 = document.createElement('h4');
    h4.className = 'peek-title';
    h4.textContent = p.title;

    const desc = document.createElement('p');
    desc.className = 'peek-desc';
    desc.textContent = p.summary;

    const stack = document.createElement('div');
    stack.className = 'peek-stack';
    p.stack.slice(0, 5).forEach((s) => {
      const span = document.createElement('span');
      span.textContent = s;
      stack.appendChild(span);
    });

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-outline-sm peek-open-btn';
    btn.textContent = 'Read Case Study →';
    btn.addEventListener('click', () => openCaseModal(key));

    peekMain.append(eye, h4, desc, stack, btn);
  }

  function openCaseModal(key) {
    const p = PROJECTS[key];
    if (!p || !caseModal) return;

    if (caseEyebrow) caseEyebrow.textContent = p.eyebrow;
    if (caseTitle) caseTitle.textContent = p.title;

    if (caseBody) {
      caseBody.innerHTML = '';
      const blocks = [
        ['Problem Statement', p.problem],
        ['Solution Overview', p.solution],
        ['My Contribution', p.contribution]
      ];
      blocks.forEach(([heading, copy]) => {
        const div = document.createElement('div');
        div.className = 'case-block';
        const h3 = document.createElement('h3');
        h3.textContent = heading;
        const para = document.createElement('p');
        para.textContent = copy;
        div.append(h3, para);
        caseBody.appendChild(div);
      });

      const stackDiv = document.createElement('div');
      stackDiv.className = 'project-stack';
      p.stack.forEach((s) => {
        const sp = document.createElement('span');
        sp.textContent = s;
        stackDiv.appendChild(sp);
      });
      caseBody.appendChild(stackDiv);
    }

    if (caseFoot) {
      caseFoot.innerHTML = '';
      p.links.forEach((lnk) => {
        const a = document.createElement('a');
        a.href = lnk.href;
        a.className = lnk.primary ? 'btn-primary btn-sm' : 'btn-ghost btn-sm';
        a.textContent = lnk.label;
        if (lnk.href.startsWith('http')) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        } else {
          a.addEventListener('click', () => caseModal.close());
        }
        caseFoot.appendChild(a);
      });
    }

    caseModal.showModal();
  }

  workItems.forEach((item) => {
    const key = item.dataset.project;
    item.addEventListener('mouseenter', () => {
      workItems.forEach((el) => el.classList.remove('is-active'));
      item.classList.add('is-active');
      renderPeek(key);
    });
    item.addEventListener('focus', () => {
      workItems.forEach((el) => el.classList.remove('is-active'));
      item.classList.add('is-active');
      renderPeek(key);
    });
    item.addEventListener('click', () => openCaseModal(key));
  });

  // Wire initial static button in HTML
  const initialPeekBtn = document.querySelector('[data-open-case="voicekhata"]');
  if (initialPeekBtn) initialPeekBtn.addEventListener('click', () => openCaseModal('voicekhata'));

  if (caseClose && caseModal) {
    caseClose.addEventListener('click', () => caseModal.close());
    caseModal.addEventListener('click', (e) => {
      if (e.target === caseModal) caseModal.close();
    });
  }

  // ---------- 2. Interactive 6-Stage Journey Flow ----------
  const STAGES = [
    {
      num: '01', pill: 'Start',
      title: 'First-Year B.Tech CS, India',
      desc: 'Started my undergraduate Computer Science & Engineering degree, focusing on building practical software alongside core coursework from day one.',
      tags: ['B.Tech CSE', 'Foundations', 'First Year']
    },
    {
      num: '02', pill: 'Learn',
      title: 'Python, JavaScript & Web Craft',
      desc: 'Practised Python, Vanilla JavaScript, HTML5/CSS3, Git workflows, and responsive UI architecture without relying on heavy frameworks.',
      tags: ['Python', 'JavaScript', 'HTML5 / CSS3', 'Git']
    },
    {
      num: '03', pill: 'Explore AI',
      title: 'Brain Trust & Perplexity Explorer',
      desc: 'Built developer-focused AI tools: a Node.js multi-model comparison workspace (Groq/OpenRouter) and an in-browser DistilGPT-2 token perplexity visualizer.',
      tags: ['Node.js', 'Transformers.js', 'DistilGPT-2', 'Ollama']
    },
    {
      num: '04', pill: 'Compete',
      title: 'VoiceKhata Hackathon MVP',
      desc: 'Collaborated in a hackathon team to ship VoiceKhata — a voice-powered credit ledger for local shopkeepers with editable Hindi transcripts and a FastAPI ledger.',
      tags: ['Web Speech API', 'Hackday', 'FastAPI', 'SQLite']
    },
    {
      num: '05', pill: 'Open Source',
      title: 'S&AI AI-For-Beginners Contributions',
      desc: 'Contributed pull requests to S-AI-Projects/AI-For-Beginners covering ten runnable Python labs with regression tests and lesson notes.',
      tags: ['Open Source', 'unittest', 'S&AI Program']
    },
    {
      num: '06', pill: 'Next',
      title: 'Software & AI Engineering Internships',
      desc: 'Actively seeking software engineering and AI engineering internship opportunities where I can ship real systems and learn fast.',
      tags: ['SWE Intern', 'AI Engineering', 'Open to Work']
    }
  ];

  const journeyTabs = document.querySelectorAll('.journey-tab');
  const stageNum   = document.getElementById('journeyStageNum');
  const stagePill  = document.getElementById('journeyStagePill');
  const stageTitle = document.getElementById('journeyStageTitle');
  const stageDesc  = document.getElementById('journeyStageDesc');
  const stageTags  = document.getElementById('journeyStageTags');

  journeyTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.dataset.stage);
      const s = STAGES[idx];
      if (!s) return;

      journeyTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });

      if (stageNum) stageNum.textContent = s.num;
      if (stagePill) stagePill.textContent = s.pill;
      if (stageTitle) stageTitle.textContent = s.title;
      if (stageDesc) stageDesc.textContent = s.desc;
      if (stageTags) {
        stageTags.innerHTML = '';
        s.tags.forEach((tag) => {
          const sp = document.createElement('span');
          sp.textContent = tag;
          stageTags.appendChild(sp);
        });
      }
    });
  });

  // ---------- 3. Live GitHub Contributions Heatmap ----------
  const ghGrid   = document.getElementById('ghGrid');
  const ghMonths = document.getElementById('ghMonths');
  const ghNote   = document.getElementById('ghNote');
  const ghTip    = document.getElementById('ghTip');
  const statEls  = {
    total: document.querySelector('[data-gh-stat="total"]'),
    cur:   document.querySelector('[data-gh-stat="cur"]'),
    long:  document.querySelector('[data-gh-stat="long"]'),
    best:  document.querySelector('[data-gh-stat="best"]')
  };

  async function loadGitHubHeatmap() {
    if (!ghGrid) return;
    try {
      const res = await fetch('https://github-contributions-api.jogruber.de/v4/swanandkadam8061?y=last');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const days = data.contributions || [];
      if (!days.length) throw new Error('No contribution data');

      // Compute stats
      let total = 0;
      let best = 0;
      let longest = 0;
      let run = 0;
      for (const d of days) {
        total += d.count;
        if (d.count > best) best = d.count;
        if (d.count > 0) {
          run++;
          if (run > longest) longest = run;
        } else {
          run = 0;
        }
      }

      // Current streak (from today backwards, allowing today=0 if yesterday>0)
      let current = 0;
      for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].count > 0) {
          current++;
        } else if (i === days.length - 1) {
          continue;
        } else {
          break;
        }
      }

      if (statEls.total) statEls.total.textContent = total.toLocaleString();
      if (statEls.cur)   statEls.cur.textContent   = `${current}d`;
      if (statEls.long)  statEls.long.textContent  = `${longest}d`;
      if (statEls.best)  statEls.best.textContent  = `${best}`;

      // Group into weeks (columns of 7)
      ghGrid.innerHTML = '';
      if (ghMonths) ghMonths.innerHTML = '';

      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      let lastMonth = -1;
      const totalWeeks = Math.ceil(days.length / 7);

      if (ghMonths) {
        ghMonths.style.gridTemplateColumns = `repeat(${totalWeeks}, 1fr)`;
      }
      ghGrid.style.gridTemplateColumns = `repeat(${totalWeeks}, 1fr)`;

      for (let w = 0; w < totalWeeks; w++) {
        const weekSlice = days.slice(w * 7, w * 7 + 7);
        if (ghMonths && weekSlice[0]) {
          const m = new Date(weekSlice[0].date + 'T00:00:00').getMonth();
          const mSpan = document.createElement('span');
          if (m !== lastMonth) {
            mSpan.textContent = monthNames[m];
            lastMonth = m;
          }
          ghMonths.appendChild(mSpan);
        }

        const col = document.createElement('div');
        col.className = 'gh-col';
        weekSlice.forEach((d) => {
          const cell = document.createElement('span');
          cell.className = 'gh-cell';
          cell.dataset.l = String(Math.min(4, Math.max(0, d.level || 0)));
          cell.dataset.date = d.date;
          cell.dataset.count = String(d.count);
          cell.tabIndex = 0;
          cell.setAttribute('aria-label', `${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}`);
          col.appendChild(cell);
        });
        ghGrid.appendChild(col);
      }

      if (ghNote) ghNote.textContent = `Live GitHub data for @swanandkadam8061 · ${total} contributions in the last year`;

      // Tooltip interactions
      if (ghTip) {
        const showTip = (cell) => {
          const c = cell.dataset.count;
          const dt = cell.dataset.date;
          ghTip.textContent = `${c} contribution${c === '1' ? '' : 's'} on ${dt}`;
          ghTip.hidden = false;
          const rect = cell.getBoundingClientRect();
          const cardRect = ghGrid.closest('.gh-card').getBoundingClientRect();
          ghTip.style.left = `${rect.left - cardRect.left + rect.width / 2}px`;
          ghTip.style.top  = `${rect.top - cardRect.top - 34}px`;
        };
        const hideTip = () => { ghTip.hidden = true; };

        ghGrid.addEventListener('mouseover', (e) => {
          const cell = e.target.closest('.gh-cell');
          if (cell) showTip(cell);
        });
        ghGrid.addEventListener('mouseout', (e) => {
          if (e.target.closest('.gh-cell')) hideTip();
        });
        ghGrid.addEventListener('focusin', (e) => {
          const cell = e.target.closest('.gh-cell');
          if (cell) showTip(cell);
        });
        ghGrid.addEventListener('focusout', hideTip);
      }
    } catch {
      if (ghNote) ghNote.textContent = 'GitHub live stats unavailable offline — view @swanandkadam8061 directly on GitHub.';
    }
  }

  loadGitHubHeatmap();
});
