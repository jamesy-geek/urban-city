// Mock Language Strings
const translations = {
    en: {
        welcome: "Hello! I am CityMind. I can help you with city info, apply for permissions, or raise a complaint ticket.",
        collectIssue: "I can help you raise a complaint. First, what type of issue are you facing?",
        collectLoc: "Got it. What is the approximate location or address of this issue?",
        collectDesc: "Please provide a brief description of the problem.",
        ticketCreated: "Your ticket has been registered at the 1st Level (Municipality Corporation). If it is not resolved in 7 days, it will be automatically escalated to the District Commissioner.",
        historyEmpty: "You don't have any tickets yet.",
        historyAvailable: "Here is your ticket history:",
        fallback: "I'm sorry, I couldn't understand that. What would you like to do?"
    },
    kn: {
        welcome: "ನಮಸ್ಕಾರ! ನಾನು ಸಿಟಿಮೈಂಡ್. ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ನೀವು ದೂರನ್ನು ದಾಖಲಿಸಬಹುದು.",
        collectIssue: "ನಾನು ದೂರು ದಾಖಲಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. ನಿಮ್ಮ ಸಮಸ್ಯೆ ಏನು?",
        collectLoc: "ಆಯಿತು. ಈ ಸಮಸ್ಯೆಯ ಸ್ಥಳ ಅಥವಾ ವಿಳಾಸವನ್ನು ನೀಡಿ.",
        collectDesc: "ದಯವಿಟ್ಟು ಸಮಸ್ಯೆಯ ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆಯನ್ನು ನೀಡಿ.",
        ticketCreated: "ನಿಮ್ಮ ದೂರನ್ನು ನಗರಸಭೆಯಲ್ಲಿ ದಾಖಲಿಸಲಾಗಿದೆ. 7 ದಿನಗಳಲ್ಲಿ ಬಗೆಹರಿಯದಿದ್ದರೆ, ಅದು ಜಿಲ್ಲಾಧಿಕಾರಿಗಳಿಗೆ ವರ್ಗಾವಣೆಯಾಗುತ್ತದೆ.",
        historyEmpty: "ನೀವು ಇನ್ನೂ ಯಾವುದೇ ದೂರನ್ನು ದಾಖಲಿಸಿಲ್ಲ.",
        historyAvailable: "ನಿಮ್ಮ ದೂರುಗಳ ಇತಿಹಾಸ ಇಲ್ಲಿದೆ:",
        fallback: "ಕ್ಷಮಿಸಿ, ಅರ್ಥವಾಗಲಿಲ್ಲ. ನೀವು ಏನು ಮಾಡಲು ಬಯಸುತ್ತೀರಿ?"
    },
    hi: {
        welcome: "नमस्ते! मैं CityMind हूँ। मैं आपकी सहायता कर सकता हूँ, आप शिकायत दर्ज कर सकते हैं।",
        collectIssue: "मैं शिकायत दर्ज करने में मदद करूँगा। आपकी समस्या क्या है?",
        collectLoc: "ठीक है। कृपया इस समस्या का स्थान या पता बताएं।",
        collectDesc: "कृपया समस्या का संक्षिप्त विवरण दें।",
        ticketCreated: "आपकी शिकायत नगर निगम में दर्ज कर ली गई है। यदि यह 7 दिनों में हल नहीं होती है, तो यह जिला आयुक्त को भेज दी जाएगी।",
        historyEmpty: "आपने अभी तक कोई शिकायत दर्ज नहीं की है।",
        historyAvailable: "यहां आपके टिकट का इतिहास है:",
        fallback: "क्षमा करें, मुझे समझ नहीं आया। आप क्या करना चाहेंगे?"
    }
};

let currentLang = 'en';

// State
let tickets = []; 
let chatStage = 'neutral'; 
let currentDraft = {};

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const langPills = document.querySelectorAll('.lang-pill');

const ticketsOverlay = document.getElementById('ticketsOverlay');
const ticketsDocumentNav = document.getElementById('ticketsDocumentNav');
const closeTicketsBtn = document.getElementById('closeTicketsBtn');
const ticketsList = document.getElementById('ticketsList');
const ticketCountBadge = document.getElementById('ticketCountBadge');

// Chat UI helpers
function scrollToBottom() {
    setTimeout(() => {
        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        });
    }, 50);
}

// Typing Indicator Manager
let typingIndicatorElement = null;

function showTypingIndicator() {
    if (typingIndicatorElement) return;
    
    typingIndicatorElement = document.createElement('div');
    typingIndicatorElement.classList.add('message', 'bot-message', 'fade-in');
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    const indicator = document.createElement('div');
    indicator.classList.add('typing-indicator');
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    contentDiv.appendChild(indicator);
    typingIndicatorElement.appendChild(contentDiv);
    
    chatBox.appendChild(typingIndicatorElement);
    scrollToBottom();
}

function hideTypingIndicator() {
    if (typingIndicatorElement) {
        typingIndicatorElement.remove();
        typingIndicatorElement = null;
    }
}

// Emulate bot typing delay
function botReply(text, isHtml = false, delay = 800) {
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', 'bot-message', 'fade-in');
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        if (isHtml) {
            contentDiv.innerHTML = text;
        } else {
            const p = document.createElement('p');
            p.innerText = text;
            contentDiv.appendChild(p);
        }
        
        msgDiv.appendChild(contentDiv);
        chatBox.appendChild(msgDiv);
        scrollToBottom();
    }, delay + Math.random() * 500); // randomize slight extra delay for realism
}

// Adding raw user message
function userReply(text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', 'user-message', 'fade-in');
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    const p = document.createElement('p');
    p.innerText = text;
    contentDiv.appendChild(p);
    
    msgDiv.appendChild(contentDiv);
    chatBox.appendChild(msgDiv);
    scrollToBottom();
}


// Intent Detection & Logic
function processUserInput(text) {
    const lowerText = text.toLowerCase();
    
    // Feature 4: Ticketing conversational flow parsing
    if (chatStage === 'collect_issue') {
        currentDraft.issue = text;
        chatStage = 'collect_loc';
        botReply(translations[currentLang].collectLoc);
        return;
    } else if (chatStage === 'collect_loc') {
        currentDraft.loc = text;
        chatStage = 'collect_desc';
        botReply(translations[currentLang].collectDesc);
        return;
    } else if (chatStage === 'collect_desc') {
        currentDraft.desc = text;
        createTicket();
        return;
    }
    
    // Feature 4 Intents
    if (lowerText.includes('complaint') || lowerText.includes('issue') || lowerText.includes('ticket') && !lowerText.includes('history')) {
        chatStage = 'collect_issue';
        currentDraft = {}; // reset
        
        // Add dynamic chips for issue types
        const issueChips = `
            <p>${translations[currentLang].collectIssue}</p>
            <div class="suggested-chips">
                <button class="chip" data-intent="Pothole">Pothole</button>
                <button class="chip" data-intent="Broken Streetlight">Broken Streetlight</button>
                <button class="chip" data-intent="Water Supply">Water Supply</button>
                <button class="chip" data-intent="Garbage">Garbage Issues</button>
            </div>
        `;
        botReply(issueChips, true, 1000);
    } 
    else if (lowerText.includes('history') || lowerText.includes('my tickets') || lowerText.includes('show ticket')) {
        showHistoryInChat();
    } 
    else {
        // Smart fallback with interaction chips
        const fallbackChips = `
            <p>${translations[currentLang].fallback}</p>
            <div class="suggested-chips">
                <button class="chip" data-intent="complaint">Raise a complaint</button>
                <button class="chip" data-intent="history">Show my tickets</button>
            </div>
        `;
        botReply(fallbackChips, true, 800);
    }
}

// Execute Ticket Creation Logic
function createTicket() {
    showTypingIndicator(); // Show typing deliberately longer for "processing"
    
    setTimeout(() => {
        hideTypingIndicator();
        
        const ticketId = 'TKT-' + Math.floor(Math.random() * 90000 + 10000);
        const newTicket = {
            id: ticketId,
            issue: currentDraft.issue,
            loc: currentDraft.loc,
            desc: currentDraft.desc,
            status: 'open',
            date: new Date().toLocaleDateString()
        };
        
        tickets.push(newTicket);
        updateTicketBadge();
        updateTicketsPanel();
        
        chatStage = 'neutral';
        
        const cardHtml = `
            <p>${translations[currentLang].ticketCreated}</p>
            <div class="ui-card">
                <div class="ticket-info">
                    <p><strong>Ticket ID:</strong> <span class="mono-text">${ticketId}</span></p>
                    <p><strong>Issue:</strong> ${newTicket.issue}</p>
                    <p><strong>Location:</strong> ${newTicket.loc}</p>
                    <p style="margin-top:10px;"><span class="status-badge open">Open - Municipality Level</span></p>
                </div>
            </div>
        `;
        
        // Final message
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('message', 'bot-message', 'fade-in');
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.innerHTML = cardHtml;
        msgDiv.appendChild(contentDiv);
        chatBox.appendChild(msgDiv);
        scrollToBottom();
        
        // Mock escalation after 12 seconds
        setTimeout(() => {
            escalateTicket(ticketId);
        }, 12000);
        
    }, 2000); 
}

// History logic
function showHistoryInChat() {
    if (tickets.length === 0) {
        botReply(translations[currentLang].historyEmpty);
    } else {
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            let html = `<p>${translations[currentLang].historyAvailable}</p>`;
            tickets.forEach(tk => {
                let statusClass = "open";
                let statusText = "Open";
                if(tk.status === "escalated") { statusClass = "escalated"; statusText = "Escalated"; }
                if(tk.status === "resolved ticket") { statusClass = "resolved"; statusText = "Resolved"; }

                html += `
                <div class="ui-card" style="margin-top: 10px;">
                    <div class="ticket-info">
                        <p style="display:flex; justify-content:space-between">
                            <strong class="mono-text">${tk.id}</strong> 
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </p>
                        <p>${tk.issue} - ${tk.date}</p>
                    </div>
                </div>`;
            });
            
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message', 'bot-message', 'fade-in');
            const contentDiv = document.createElement('div');
            contentDiv.classList.add('message-content');
            contentDiv.innerHTML = html;
            msgDiv.appendChild(contentDiv);
            chatBox.appendChild(msgDiv);
            scrollToBottom();
            
        }, 1200);
    }
}

// Side Panel / Document logic
function updateTicketsPanel() {
    if(tickets.length === 0) return;
    ticketsList.innerHTML = '';
    
    tickets.reverse().forEach(tk => {
        let statusClass = "open";
        let statusText = "Open";
        if(tk.status === "escalated") { statusClass = "escalated"; statusText = "Escalated"; }
        if(tk.status === "resolved ticket") { statusClass = "resolved"; statusText = "Resolved"; }

        const isEscalated = tk.status === 'escalated';
        const isResolved = tk.status === 'resolved ticket';

        const card = document.createElement('div');
        card.classList.add('ticket-history-card');
        card.innerHTML = `
            <header>
                <span class="mono-text">${tk.id}</span>
                <span>${tk.date}</span>
            </header>
            <h4>${tk.issue}</h4>
            <p style="font-size: 0.8rem; color:var(--text-muted);"><i class="fa-solid fa-location-dot"></i> ${tk.loc}</p>
            <p style="margin-top:10px;"><span class="status-badge ${statusClass}">${statusText}</span></p>
            
            <div class="ticket-tracker">
                <div class="progress-line">
                    <div class="step ${tk.status==='open' || isEscalated || isResolved ? 'active' : ''}" title="Level 1: Municipality"></div>
                    <div class="step ${isEscalated ? 'escalated' : (isResolved ? 'active' : '')}" title="Level 2: District Commissioner"></div>
                    <div class="step ${isResolved ? 'resolved' : ''}" title="Resolved"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size: 0.7rem; color: var(--text-muted); margin-top: 5px;">
                    <span>Level 1</span>
                    <span>Level 2</span>
                    <span>Resolved</span>
                </div>
            </div>
        `;
        ticketsList.appendChild(card);
    });
    tickets.reverse(); // restore array order
}

function updateTicketBadge() {
    ticketCountBadge.innerText = tickets.length;
}

// Simulate backend Auto-Escalation
function escalateTicket(id) {
    const tk = tickets.find(t => t.id === id);
    if(tk && tk.status === 'open') {
        tk.status = 'escalated';
        updateTicketsPanel();
        botReply(`Notification: Your ticket <strong class="mono-text">${tk.id}</strong> has not resolved in 7 days and has been auto-escalated to Level 2 (District Commissioner).`, true, 500);
    }
}

// Events
sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if(text) {
        userReply(text);
        userInput.value = '';
        processUserInput(text);
    }
});

userInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') { sendBtn.click(); }
});

// Feature 2: Language Switcher
langPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
        langPills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        currentLang = e.target.dataset.lang;
    });
});

// Suggested Intent Chips - global listener makes interaction smooth
document.addEventListener('click', (e) => {
    if(e.target.classList.contains('chip')) {
        const intent = e.target.dataset.intent;
        
        // Normal commands
        if(intent === 'complaint') {
            userReply("I want to raise a complaint");
            processUserInput("complaint");
        } else if (intent === 'history') {
            userReply("Show my tickets");
            processUserInput("history");
        } else {
            // It's a contextual interaction chip (e.g. "Pothole")
            userReply(e.target.innerText);
            processUserInput(e.target.innerText);
            
            // visually disable the chip container so they can't double click
            e.target.parentElement.style.opacity = '0.5';
            e.target.parentElement.style.pointerEvents = 'none';
        }
    }
});

// Feature 4: Side Panel Toggles
ticketsDocumentNav.addEventListener('click', (e) => {
    e.preventDefault();
    ticketsOverlay.classList.add('active');
    updateTicketsPanel();
});
closeTicketsBtn.addEventListener('click', () => {
    ticketsOverlay.classList.remove('active');
});

// Mock translate
document.getElementById('langToggle').addEventListener('click', () => {
    alert("Global navigation translation activated (Mock).");
});
