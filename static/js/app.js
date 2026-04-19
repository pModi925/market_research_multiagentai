/**
 * AI Market Research Generator — Frontend Logic
 * Handles form submission, polling, UI state management, and interactions.
 */

// ============================================
// State
// ============================================
let currentJobId = null;
let currentReportId = null;
let currentReportText = '';
let pollInterval = null;
let agentStepIndex = 0;
let agentStepTimer = null;

// ============================================
// Theme Toggle
// ============================================
(function initTheme() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
})();

document.getElementById('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
});

// ============================================
// Character Count
// ============================================
document.getElementById('productIdea').addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('charCount').textContent = `${count} character${count !== 1 ? 's' : ''}`;
});

// ============================================
// Section Navigation
// ============================================
function showSection(name) {
    const sections = ['inputSection', 'loadingSection', 'resultSection', 'historySection', 'errorSection'];
    sections.forEach(id => document.getElementById(id).classList.add('hidden'));

    // Update nav
    document.getElementById('navHome').classList.remove('active');
    document.getElementById('navHistory').classList.remove('active');

    switch (name) {
        case 'input':
            document.getElementById('inputSection').classList.remove('hidden');
            document.getElementById('navHome').classList.add('active');
            break;
        case 'loading':
            document.getElementById('loadingSection').classList.remove('hidden');
            break;
        case 'result':
            document.getElementById('resultSection').classList.remove('hidden');
            document.getElementById('navHome').classList.add('active');
            break;
        case 'history':
            document.getElementById('historySection').classList.remove('hidden');
            document.getElementById('navHistory').classList.add('active');
            loadHistory();
            break;
        case 'error':
            document.getElementById('errorSection').classList.remove('hidden');
            break;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// Start Generation
// ============================================
async function startGeneration() {
    const textarea = document.getElementById('productIdea');
    const productIdea = textarea.value.trim();

    if (!productIdea) {
        textarea.focus();
        textarea.style.borderColor = '#ef4444';
        setTimeout(() => { textarea.style.borderColor = ''; }, 2000);
        return;
    }

    // Disable button
    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    btn.innerHTML = `
        <svg class="spin-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        Starting...
    `;

    try {
        const response = await fetch('/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_idea: productIdea })
        });

        const data = await response.json();

        if (data.status === 'started') {
            currentJobId = data.job_id;
            showLoadingState(productIdea);
            startPolling();
        } else {
            showError(data.message || 'Failed to start the pipeline.');
        }
    } catch (err) {
        showError('Could not connect to the server. Please ensure the Flask app is running.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Generate Report
        `;
    }
}

// ============================================
// Loading State
// ============================================
function showLoadingState(productIdea) {
    // Set the product idea preview
    document.getElementById('loadingIdeaPreview').textContent = productIdea.length > 200
        ? productIdea.substring(0, 200) + '...'
        : productIdea;

    // Reset agent steps
    agentStepIndex = 0;
    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`step${i}`);
        step.classList.remove('active', 'completed');
        step.querySelector('.step-status').textContent = 'Waiting...';
    }

    showSection('loading');
    simulateAgentProgress();
}

function simulateAgentProgress() {
    // Simulates agent progress since we can't get real-time feedback from CrewAI
    const agentNames = [
        'Researching market data...',
        'Analyzing competitors...',
        'Studying customer segments...',
        'Building product strategy...',
        'Synthesizing final report...'
    ];

    const statuses = [
        'Analyzing markets...',
        'Mapping competitors...',
        'Building personas...',
        'Designing strategy...',
        'Writing report...'
    ];

    // Activate first step immediately
    activateStep(1, statuses[0]);

    // Progressively activate steps (approximate timing for a multi-minute task)
    const intervals = [45000, 90000, 135000, 180000]; // 45s between each
    intervals.forEach((delay, i) => {
        setTimeout(() => {
            completeStep(i + 1);
            activateStep(i + 2, statuses[i + 1]);
        }, delay);
    });
}

function activateStep(index, statusText) {
    if (index > 5) return;
    const step = document.getElementById(`step${index}`);
    if (!step) return;
    step.classList.add('active');
    step.querySelector('.step-status').textContent = statusText;

    const loadingStatus = document.getElementById('loadingStatus');
    const descriptions = [
        'Agent 1 is analyzing market size, growth trends, and industry dynamics...',
        'Agent 2 is mapping the competitive landscape and identifying gaps...',
        'Agent 3 is developing customer personas and pain point analysis...',
        'Agent 4 is designing product strategy and MVP roadmap...',
        'Agent 5 is synthesizing everything into a comprehensive report...'
    ];
    loadingStatus.textContent = descriptions[index - 1] || 'Processing...';
}

function completeStep(index) {
    if (index > 5) return;
    const step = document.getElementById(`step${index}`);
    if (!step) return;
    step.classList.remove('active');
    step.classList.add('completed');
    step.querySelector('.step-status').textContent = 'Complete ✓';
}

// ============================================
// Polling
// ============================================
function startPolling() {
    if (pollInterval) clearInterval(pollInterval);

    pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/status/${currentJobId}`);
            const data = await response.json();

            if (data.status === 'completed') {
                clearInterval(pollInterval);
                pollInterval = null;

                // Complete all steps
                for (let i = 1; i <= 5; i++) completeStep(i);

                currentReportId = currentJobId;
                currentReportText = data.report;
                showResult(data.product_idea, data.report);
            } else if (data.status === 'failed') {
                clearInterval(pollInterval);
                pollInterval = null;
                showError(data.error || 'The AI pipeline encountered an error.');
            }
            // If still running, continue polling
        } catch (err) {
            // Network error — continue polling
            console.warn('Polling error:', err);
        }
    }, 5000); // Poll every 5 seconds
}

// ============================================
// Show Result
// ============================================
function showResult(productIdea, reportMarkdown) {
    document.getElementById('resultIdea').textContent = productIdea;
    document.getElementById('resultDate').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Render markdown
    const reportContainer = document.getElementById('reportContent');
    try {
        reportContainer.innerHTML = marked.parse(reportMarkdown);
    } catch {
        // Fallback: show plain text
        reportContainer.innerHTML = `<pre style="white-space: pre-wrap;">${escapeHtml(reportMarkdown)}</pre>`;
    }

    showSection('result');
}

// ============================================
// Copy & Download
// ============================================
async function copyReport() {
    try {
        await navigator.clipboard.writeText(currentReportText);
        document.getElementById('copyBtnText').textContent = 'Copied!';
        showToast('Report copied to clipboard!');
        setTimeout(() => {
            document.getElementById('copyBtnText').textContent = 'Copy to Clipboard';
        }, 2000);
    } catch {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = currentReportText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Report copied to clipboard!');
    }
}

function downloadReport() {
    if (currentReportId) {
        window.open(`/download/${currentReportId}`, '_blank');
    } else {
        // Fallback: create a blob download
        const blob = new Blob([currentReportText], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'market_research_report.md';
        a.click();
        URL.revokeObjectURL(url);
    }
}
function downloadReportPdf() {
    if (currentReportId) {
        window.print()
    } else { }
}
// ============================================
// New Report
// ============================================
function newReport() {
    currentJobId = null;
    currentReportId = null;
    currentReportText = '';
    showSection('input');
}

// ============================================
// History
// ============================================
async function loadHistory() {
    const container = document.getElementById('historyList');

    try {
        const response = await fetch('/history');
        const data = await response.json();

        if (!data.reports || data.reports.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    <p>No reports generated yet. Create your first one!</p>
                    <button class="btn-primary" onclick="showSection('input')">Get Started</button>
                </div>
            `;
            return;
        }

        container.innerHTML = data.reports.map(report => `
            <div class="history-item" onclick="loadReport('${report.id}')">
                <div class="history-item-info">
                    <div class="history-item-idea">${escapeHtml(report.product_idea)}</div>
                    <div class="history-item-date">${formatDate(report.created_at)}</div>
                </div>
                <div class="history-item-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Could not load history. Please try again.</p>
            </div>
        `;
    }
}

async function loadReport(reportId) {
    try {
        const response = await fetch(`/report/${reportId}`);
        const data = await response.json();

        if (data.status === 'success') {
            currentReportId = reportId;
            currentReportText = data.report.report;
            showResult(data.report.product_idea, data.report.report);
        } else {
            showToast('Report not found.');
        }
    } catch (err) {
        showToast('Error loading report.');
    }
}

// ============================================
// Error Handling
// ============================================
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showSection('error');
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================================
// Utilities
// ============================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoString) {
    try {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return isoString;
    }
}

// ============================================
// Keyboard Shortcut: Ctrl+Enter to submit
// ============================================
document.getElementById('productIdea').addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        startGeneration();
    }
});
