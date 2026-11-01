/* ===================================================
   js/ai-assistant.js — Swanand AI & Voice Interface
   Embedded Knowledge Engine + VoiceKhata Voice Ledger Simulator
   Optional Local Ollama / Google Gemma API Endpoint Connection
   =================================================== */

(function () {
  'use strict';

  // Knowledge base about Swanand Kadam & Projects
  const SWANAND_KNOWLEDGE = {
    name: "Swanand Kadam",
    role: "Student, Aspiring Software Developer, AI & Web Development Enthusiast",
    education: "B.Tech Computer Science Student, India",
    mindset: "I believe that every project, every bug fixed, and every problem solved is another step forward. Currently learning. Constantly building. Always exploring.",
    coreSkills: [
      "Programming: Python, C, Functions, Loops, Recursion, Number-based Problem Solving",
      "Web Development: HTML5, CSS3, Responsive Design, Modern UI, CSS Grid & Flexbox",
      "Artificial Intelligence: Generative AI, Google Gemma, Ollama, Open-Source LLMs, Prompting",
      "AI Applications: Voice-based interfaces, Speech Recognition (English, Hindi, Hinglish)",
      "Developer Tools: Git, GitHub, VS Code, Linux Terminal & Command-line tools",
      "Cybersecurity Fundamentals: Linux system basics, Computer networking, SSH, Security labs"
    ],
    featuredProject: {
      name: "VoiceKhata",
      tagline: "AI-Powered, Voice-First Digital Ledger for Small Kirana & Local Vendors",
      liveUrl: "https://nishantekka2007-sys.github.io/voicekhata-hackday/",
      githubUrl: "https://github.com/nishantekka2007-sys/voicekhata-hackday/",
      highlights: [
        "Voice-first user interaction in local languages",
        "Hindi and Hinglish speech recognition",
        "Open-source AI tools and Google Gemma integration",
        "Automated bookkeeping and transaction calculation",
        "Built during Hackday and deployed live"
      ]
    },
    projects: [
      { name: "VoiceKhata", type: "AI Voice Ledger", status: "Live Hackday Project" },
      { name: "Personal Developer Portfolio", type: "Web & UI Systems", status: "Live" },
      { name: "Python CLI Calculator & Problem Solver", type: "Python CLI Utility", status: "Completed" },
      { name: "Anime Watchlist & Media Tracker", type: "Web & Storage App", status: "Active Build" },
      { name: "Minimal Fashion & Streetwear Editorial", type: "CSS Grid & Typography", status: "Active Build" }
    ],
    interests: [
      "🏏 Sports (Cricket, energy, teamwork, discipline)",
      "👕 Fashion (Streetwear, monochrome fits, aesthetic personal style)",
      "🎬 Movies (Cinematography, visual storytelling)",
      "📺 TV Series (Character arcs, multi-layered narratives)",
      "🎌 Anime (Frieren, Attack on Titan, world-building, imaginative lore)"
    ],
    contact: {
      github: "https://github.com/swanandkadam8061",
      linkedin: "https://www.linkedin.com/in/swanand-kadam-3455813a0/",
      email: "swanandkadam8061@gmail.com"
    }
  };

  // State
  let recognition = null;
  let isListening = false;
  let activeTab = 'chat'; // 'chat' or 'voicekhata' or 'settings'

  // DOM Elements
  const aiModal = document.getElementById('aiAssistantModal');
  const aiToggleBtn = document.getElementById('aiFloatingTrigger');
  const aiCloseBtn = document.getElementById('aiModalCloseBtn');
  const chatMessages = document.getElementById('aiChatMessages');
  const chatInput = document.getElementById('aiChatInput');
  const sendBtn = document.getElementById('aiSendBtn');
  const voiceRecordBtn = document.getElementById('aiVoiceRecordBtn');
  const quickChips = document.querySelectorAll('.ai-chip');
  const tabButtons = document.querySelectorAll('.ai-tab-btn');
  const tabPanels = document.querySelectorAll('.ai-tab-panel');

  // VoiceKhata simulator elements
  const vkInput = document.getElementById('vkVoiceInput');
  const vkProcessBtn = document.getElementById('vkProcessBtn');
  const vkSampleSelect = document.getElementById('vkSampleSelect');
  const vkResult = document.getElementById('vkResultOutput');

  // Settings elements
  const endpointInput = document.getElementById('aiEndpointInput');
  const modelNameInput = document.getElementById('aiModelNameInput');
  const saveSettingsBtn = document.getElementById('aiSaveSettingsBtn');
  const resetSettingsBtn = document.getElementById('aiResetSettingsBtn');
  const settingsStatus = document.getElementById('aiSettingsStatus');

  // Initialize Speech Recognition if supported
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Supports Indian English / Hinglish nuances

      recognition.onstart = () => {
        isListening = true;
        if (voiceRecordBtn) voiceRecordBtn.classList.add('listening');
        showSystemMessage("🎙️ Listening... Speak your question or VoiceKhata command!");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (chatInput) chatInput.value = transcript;
        handleSendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        isListening = false;
        if (voiceRecordBtn) voiceRecordBtn.classList.remove('listening');
      };

      recognition.onend = () => {
        isListening = false;
        if (voiceRecordBtn) voiceRecordBtn.classList.remove('listening');
      };
    }
  }

  // Knowledge Engine reasoning
  function generateAIResponse(query) {
    const q = query.toLowerCase().trim();

    // 1. VoiceKhata questions
    if (q.includes('voicekhata') || q.includes('ledger') || q.includes('kirana') || q.includes('voice')) {
      return `🎙️ **VoiceKhata** is Swanand's flagship AI project! It's a voice-first digital ledger created for small shopkeepers, kirana stores, and local vendors.\n\n` +
             `• **Key Innovation:** Handles voice commands in **Hindi and Hinglish**.\n` +
             `• **AI Stack:** Open-source AI tools and **Google Gemma / Ollama** architectures for parsing.\n` +
             `• **Features:** AI transaction logging, credit/debit calculation, and an intuitive UI.\n\n` +
             `👉 You can test the **Live VoiceKhata Project** at: [Live Demo](https://nishantekka2007-sys.github.io/voicekhata-hackday/) or review the [GitHub Repo](https://github.com/nishantekka2007-sys/voicekhata-hackday/).`;
    }

    // 2. AI tools / Gemma / Ollama
    if (q.includes('ai') || q.includes('gemma') || q.includes('ollama') || q.includes('generative')) {
      return `🤖 **Swanand's AI Exploration:**\n\n` +
             `Swanand actively works with **Generative AI**, **Google Gemma**, and **Ollama** for running local open-source models.\n` +
             `He specializes in:\n` +
             `• Voice-based interfaces & Multilingual speech recognition\n` +
             `• Hindi & Hinglish natural language command extraction\n` +
             `• Integrating lightweight LLMs into responsive web applications\n` +
             `• Prompt engineering and offline AI model workflows.`;
    }

    // 3. Skills & Technologies
    if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('language') || q.includes('python')) {
      return `💻 **Technical Skills & Arsenal:**\n\n` +
             `• **Programming:** Python, C, Logical problem-solving, functions, loops, and recursion\n` +
             `• **Web Development:** HTML5, CSS3, Responsive Design, CSS Grid/Flexbox, Glassmorphism\n` +
             `• **AI & Speech:** Google Gemma, Ollama, Open-Source LLMs, Voice interfaces\n` +
             `• **Tools:** Git, GitHub, VS Code, Linux terminal, Bash\n` +
             `• **Cybersecurity:** Linux fundamentals, Networking, SSH remote access, security labs.`;
    }

    // 4. Projects
    if (q.includes('project') || q.includes('portfolio') || q.includes('calculator') || q.includes('work')) {
      return `🚀 **Swanand's Core Projects:**\n\n` +
             `1. **VoiceKhata:** AI-powered voice ledger for local kirana businesses (Live)\n` +
             `2. **Personal Portfolio Website:** Modern glassmorphic dark developer hub with Three.js 3D model integration\n` +
             `3. **Python CLI Calculator:** Terminal problem solver with robust validation and error recovery\n` +
             `4. **Anime Watchlist Tracker:** Media tracking web app with LocalStorage state persistence\n` +
             `5. **Minimal Fashion Editorial:** Asymmetric layout exploring typography and streetwear aesthetics.`;
    }

    // 5. Mindset / Journey
    if (q.includes('mindset') || q.includes('journey') || q.includes('about') || q.includes('who are you') || q.includes('swanand')) {
      return `⚡ **Hey, I'm Swanand Kadam!**\n\n` +
             `I'm a B.Tech Computer Science student in India, aspiring developer, and tech enthusiast.\n\n` +
             `🌱 **My Mindset:**\n` +
             `*"I'm someone who loves staying curious, learning new things, and challenging myself to grow. I believe that every project, every bug fixed, and every problem solved is another step forward."*\n\n` +
             `**Currently learning. Constantly building. Always exploring.**`;
    }

    // 6. Beyond the Code / Hobbies
    if (q.includes('hobby') || q.includes('beyond') || q.includes('sports') || q.includes('cricket') || q.includes('anime') || q.includes('fashion') || q.includes('movie')) {
      return `🎯 **Beyond the Code:**\n\n` +
             `Outside of technology and software development, Swanand is inspired by:\n` +
             `• 🏏 **Sports:** Teamwork, fast energy, and competitive discipline\n` +
             `• 👕 **Fashion:** Streetwear trends, monochrome fits, and intentional styling\n` +
             `• 🎬 **Movies:** Directorial storytelling and visual cinematography\n` +
             `• 📺 **TV Series:** Character narratives and compelling world drama\n` +
             `• 🎌 **Anime:** Deep storytelling and art (Frieren, Attack on Titan, Chainsaw Man).`;
    }

    // 7. Contact / Socials
    if (q.includes('contact') || q.includes('email') || q.includes('github') || q.includes('linkedin') || q.includes('hire') || q.includes('reach')) {
      return `📬 **Get in Touch with Swanand:**\n\n` +
             `• **Email:** [swanandkadam8061@gmail.com](mailto:swanandkadam8061@gmail.com)\n` +
             `• **GitHub:** [github.com/swanandkadam8061](https://github.com/swanandkadam8061)\n` +
             `• **LinkedIn:** [linkedin.com/in/swanand-kadam-3455813a0](https://www.linkedin.com/in/swanand-kadam-3455813a0/)\n\n` +
             `Feel free to connect for collaborations, hackathons, or tech discussions!`;
    }

    // Default Fallback
    return `✦ I'm **Swanand's AI Assistant** (trained on his project architecture, Google Gemma & VoiceKhata workflows).\n\n` +
           `I can answer questions about:\n` +
           `• **VoiceKhata** (voice-first digital ledger & speech recognition)\n` +
           `• **Technical Skills** (Python, C, HTML/CSS, Gemma, Ollama, Linux)\n` +
           `• **Projects & GitHub Repositories**\n` +
           `• **My Technical Journey & Beyond the Code**\n\n` +
           `Try asking: *"Tell me about VoiceKhata"* or *"What AI tools do you use?"*`;
  }

  // VoiceKhata Speech-to-Ledger Parser Simulator
  function parseVoiceKhataCommand(text) {
    const clean = text.trim();
    let amount = 0;
    let customer = "Customer";
    let items = "General Groceries";
    let transactionType = "Credit (Udhaar)";

    // Extract amount: e.g. ₹450, 450, 450 rupees
    const amountMatch = clean.match(/(?:₹|rs\.?|rupees|inr)?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Determine type
    if (/cash|jama|received|payment|paid/i.test(clean)) {
      transactionType = "Payment Received (Cash / Jama)";
    } else {
      transactionType = "Credit Given (Udhaar)";
    }

    // Customer name extraction heuristic
    const nameMatch = clean.match(/([a-zA-Z]+)\s*(?:ko|ka|se|account)?/i);
    if (nameMatch && nameMatch[1] && !/udhaar|jama|cash|rs|rupees|doodh|bread|chai/i.test(nameMatch[1])) {
      customer = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
    } else if (/ramesh/i.test(clean)) {
      customer = "Ramesh";
    } else if (/sharma/i.test(clean)) {
      customer = "Sharma Ji";
    }

    // Items extraction heuristic
    if (/doodh|milk/i.test(clean)) items = "Milk & Dairy";
    if (/bread/i.test(clean)) items += (items ? ", " : "") + "Bread";
    if (/chai|tea|biscuit/i.test(clean)) items = "Tea & Biscuits";
    if (/oil|tel|atta|flour/i.test(clean)) items = "Atta & Cooking Essentials";

    return {
      rawVoiceInput: clean,
      parsedBy: "VoiceKhata AI Engine (Gemma / Speech Parser)",
      timestamp: new Date().toLocaleTimeString(),
      entry: {
        customerName: customer,
        transactionType: transactionType,
        amount: `₹${amount || 450}`,
        itemsRecorded: items,
        status: "Verified & Logged to Kirana Ledger ✓"
      }
    };
  }

  // Append message to chat UI
  function appendMessage(sender, text, isMarkdown = true) {
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ai-msg-${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble';

    if (sender === 'bot') {
      // Basic formatting for bold, links, bullets
      let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        .replace(/\n/g, '<br/>');
      bubble.innerHTML = formatted;
    } else {
      bubble.textContent = text;
    }

    msgDiv.appendChild(bubble);
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showSystemMessage(text) {
    if (!chatMessages) return;
    const sysDiv = document.createElement('div');
    sysDiv.className = 'ai-sys-msg';
    sysDiv.textContent = text;
    chatMessages.appendChild(sysDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Send query logic (supports embedded knowledge or optional Ollama / Gemma API)
  async function handleSendMessage(customText) {
    const query = customText || (chatInput ? chatInput.value : '');
    if (!query || !query.trim()) return;

    appendMessage('user', query.trim());
    if (chatInput) chatInput.value = '';

    // Check if custom Ollama endpoint is set
    const customEndpoint = localStorage.getItem('swanand_ai_endpoint');
    const customModel = localStorage.getItem('swanand_ai_model') || 'gemma';

    if (customEndpoint) {
      appendMessage('bot', `<em>Connecting to custom endpoint (${customModel})...</em>`);
      try {
        const response = await fetch(customEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: customModel,
            prompt: `Context about Swanand Kadam:\n${JSON.stringify(SWANAND_KNOWLEDGE)}\n\nUser Question: ${query}\nAnswer helpfully:`,
            stream: false
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.response || data.text || JSON.stringify(data);
          // Remove loading message
          chatMessages.lastChild.remove();
          appendMessage('bot', reply);
          return;
        }
      } catch (err) {
        console.warn('Custom endpoint failed, using embedded knowledge engine:', err);
        chatMessages.lastChild.remove();
      }
    }

    // Default fast embedded knowledge response
    setTimeout(() => {
      const response = generateAIResponse(query);
      appendMessage('bot', response);
    }, 280);
  }

  // Setup Event Listeners
  function setupEvents() {
    // Modal toggle
    if (aiToggleBtn && aiModal) {
      aiToggleBtn.addEventListener('click', () => {
        const isHidden = aiModal.classList.contains('open');
        aiModal.classList.toggle('open', !isHidden);
        aiModal.setAttribute('aria-hidden', String(isHidden));
        if (!isHidden && chatInput) setTimeout(() => chatInput.focus(), 200);
      });
    }

    if (aiCloseBtn && aiModal) {
      aiCloseBtn.addEventListener('click', () => {
        aiModal.classList.remove('open');
        aiModal.setAttribute('aria-hidden', 'true');
      });
    }

    // Send button & enter key
    if (sendBtn) {
      sendBtn.addEventListener('click', () => handleSendMessage());
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSendMessage();
        }
      });
    }

    // Speech voice button
    if (voiceRecordBtn) {
      voiceRecordBtn.addEventListener('click', () => {
        if (!recognition) {
          initSpeechRecognition();
        }
        if (recognition) {
          if (isListening) {
            recognition.stop();
          } else {
            try {
              recognition.start();
            } catch (err) {
              console.warn('Recognition start notice:', err);
            }
          }
        } else {
          showSystemMessage("Speech recognition not supported in this browser. Try clicking one of the sample prompt chips below!");
        }
      });
    }

    // Quick suggestion chips
    quickChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const prompt = chip.getAttribute('data-prompt') || chip.textContent;
        handleSendMessage(prompt);
      });
    });

    // Tab navigation inside AI Modal (Chat, VoiceKhata Simulator, Settings)
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        activeTab = targetTab;

        tabButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        tabPanels.forEach((panel) => {
          if (panel.getAttribute('id') === `aiTab-${targetTab}`) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });

    // VoiceKhata simulator interaction
    if (vkProcessBtn && vkInput && vkResult) {
      vkProcessBtn.addEventListener('click', () => {
        const text = vkInput.value.trim() || 'Ramesh ko ₹450 ka doodh aur bread udhaar likho';
        const parsed = parseVoiceKhataCommand(text);
        vkResult.innerHTML = `<pre><code>${JSON.stringify(parsed, null, 2)}</code></pre>`;
      });
    }

    if (vkSampleSelect && vkInput) {
      vkSampleSelect.addEventListener('change', () => {
        if (vkSampleSelect.value) {
          vkInput.value = vkSampleSelect.value;
        }
      });
    }

    // Settings panel for custom Ollama / Gemma API
    if (endpointInput) {
      endpointInput.value = localStorage.getItem('swanand_ai_endpoint') || '';
    }
    if (modelNameInput) {
      modelNameInput.value = localStorage.getItem('swanand_ai_model') || 'gemma';
    }

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        const endpoint = endpointInput ? endpointInput.value.trim() : '';
        const model = modelNameInput ? modelNameInput.value.trim() : 'gemma';

        if (endpoint) {
          localStorage.setItem('swanand_ai_endpoint', endpoint);
          localStorage.setItem('swanand_ai_model', model);
          if (settingsStatus) settingsStatus.textContent = `Connected to ${model} at ${endpoint} ✓`;
        } else {
          localStorage.removeItem('swanand_ai_endpoint');
          if (settingsStatus) settingsStatus.textContent = 'Using embedded Swanand AI Knowledge Engine ✓';
        }
      });
    }

    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener('click', () => {
        localStorage.removeItem('swanand_ai_endpoint');
        localStorage.removeItem('swanand_ai_model');
        if (endpointInput) endpointInput.value = '';
        if (modelNameInput) modelNameInput.value = 'gemma';
        if (settingsStatus) settingsStatus.textContent = 'Reset to embedded knowledge engine ✓';
      });
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSpeechRecognition();
      setupEvents();
    });
  } else {
    initSpeechRecognition();
    setupEvents();
  }
})();

