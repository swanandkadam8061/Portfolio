/* ===================================================
   js/ai-assistant.js — Swanand AI & Voice Interface
   Embedded Knowledge Engine + VoiceKhata Voice Ledger Simulator
   Optional Local Ollama / Google Gemma API Endpoint Connection
   =================================================== */

(function () {
  'use strict';

  // Knowledge base about Swanand Kadam & Projects
  const topics = [
    { words: /voicekhata|ledger|shopkeeper|speech/, section: 'projects', answer: 'VoiceKhata is a team project for neighbourhood shops. Swanand connected the review form to the signed-in ledger, fixed Hindi item parsing, and improved Whisper retries.' },
    { words: /brain trust|groq|openrouter/, section: 'projects', answer: 'Brain Trust sends a shared conversation to multiple models. Swanand built its browser workspace and Node.js gateway.' },
    { words: /perplexity|token|distilgpt/, section: 'projects', answer: 'Perplexity Explorer runs DistilGPT-2 in the browser to show how individual words affect a sentence’s score.' },
    { words: /contact|email|reach|github|linkedin/, section: 'contact', answer: 'Email Swanand at swanandkadam8061@gmail.com. His contact card also links to GitHub and LinkedIn.' },
    { words: /skill|python|tech|stack|language|ai tool/, section: 'skills', answer: 'Swanand uses Python, JavaScript, HTML and CSS. His toolkit links to examples of Whisper, Transformers.js, Node.js, FastAPI and SQLite in his work.' },
    { words: /hobb|interest|gaming|sports|anime|fashion|movie|fitness/, section: 'beyond', answer: 'Outside of code, Swanand enjoys weight training, sports, gaming, anime, fashion, movies and series.' },
    { words: /open.source|course|education|learn|journey/, section: 'contributions', answer: 'Swanand is studying computer science. His S&AI coursework includes Python labs on genetic algorithms, prediction metrics, embeddings and data preparation.' },
    { words: /project|portfolio|work/, section: 'projects', answer: 'Selected projects include VoiceKhata, Brain Trust, Perplexity Explorer and this interactive portfolio. Each project lists Swanand’s contribution and links to the code.' },
    { words: /who|about|swanand/, section: 'about', answer: 'Swanand Kadam is a computer science student in India and an aspiring software developer interested in AI, web development and open-source tools.' }
  ];

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
      if (voiceRecordBtn) voiceRecordBtn.hidden = false;
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
        showSystemMessage('Microphone input is unavailable. Type your question below.');
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
    return topics.find(topic => topic.words.test(query.toLowerCase())) || {
      answer: 'Try asking about a project by name, my skills, interests, coursework or contact details.'
    };
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
  function appendMessage(sender, text, sectionId = null) {
    if (!chatMessages) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `ai-msg ai-msg-${sender}`;

    const bubble = document.createElement('div');
    bubble.className = 'ai-bubble';

    bubble.textContent = text;
    if (sender === 'bot' && sectionId) {
      const section = document.getElementById(sectionId);
      const link = document.createElement('a');
      link.href = '#' + section.id;
      link.textContent = section.querySelector('h2').textContent;
      link.addEventListener('click', () => {
        aiModal.close();
        section.tabIndex = -1;
        section.focus({preventScroll: true});
      });
      bubble.append(document.createElement('br'), link);
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
      const pending = document.createElement('p');
      pending.textContent = 'Waiting for the configured model…';
      chatMessages.append(pending);
      try {
        const response = await fetch(customEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({ model: customModel, prompt: topics.map(topic => topic.answer).join(' ') + '\nQuestion: ' + query, stream: false })
        });
        if (!response.ok) throw new Error('Model request failed');
        const payload = await response.json();
        const answer = payload.response || payload.text;
        if (typeof answer !== 'string' || !answer.trim()) throw new Error('Empty model response');
        appendMessage('bot', answer);
        return;
      } catch {
        showSystemMessage('The configured model is unavailable. Answering from the portfolio.');
      } finally {
        pending.remove();
      }
    }
    const topic = generateAIResponse(query);
    appendMessage('bot', topic.answer, topic.section);
  }

  function setupEvents() {
    aiToggleBtn.addEventListener('click', () => {
      aiModal.showModal();
      chatInput.focus();
    });
    aiCloseBtn.addEventListener('click', () => aiModal.close());
    aiModal.addEventListener('close', () => { if (isListening) recognition.stop(); });

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
        vkResult.textContent = JSON.stringify(parsed, null, 2);
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
          if (settingsStatus) settingsStatus.textContent = `Saved model settings for ${model}.`;
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

