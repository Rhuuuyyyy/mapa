/**
 * MAPA SaaS - Scripts Principais
 */

// Configuração global
const API_BASE = '';

// Função helper para fazer requests autenticadas
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('access_token');

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    const response = await fetch(API_BASE + url, finalOptions);

    if (!response.ok) {
        if (response.status === 401) {
            // Token inválido/expirado - redirecionar para login
            localStorage.removeItem('access_token');
            window.location.href = '/login.html';
            throw new Error('Sessão expirada');
        }

        const error = await response.json();
        throw new Error(error.detail || 'Erro na requisição');
    }

    return response.json();
}

// Função de logout
function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/login.html';
}

// Formatação de data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}

// Mensagens de feedback
function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = message;
    element.className = type === 'success' ? 'success-message' : 'error-message';
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// Validação de período MAPA (Q1-2025, Q2-2025, etc.)
function validatePeriod(period) {
    const regex = /^Q[1-4]-\d{4}$/;
    return regex.test(period);
}

// Export
window.apiRequest = apiRequest;
window.logout = logout;
window.formatDate = formatDate;
window.showMessage = showMessage;
window.validatePeriod = validatePeriod;
