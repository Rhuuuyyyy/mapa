// Utility Functions
function getAuthToken() {
    return localStorage.getItem('access_token');
}

function logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/';
}

function checkAuth() {
    const token = getAuthToken();
    if (!token) {
        window.location.href = '/';
        return false;
    }
    return true;
}

async function fetchAPI(url, options = {}) {
    const token = getAuthToken();

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    const response = await fetch(url, mergedOptions);

    if (response.status === 401) {
        logout();
        return null;
    }

    return response;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Toast Notification System
const Toast = {
    container: null,

    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'info', duration = 5000) {
        if (!this.container) this.init();

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const titles = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Atenção',
            info: 'Informação'
        };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type] || titles.info}</div>
                <div class="toast-message">${this.escapeHtml(message)}</div>
            </div>
            <button class="toast-close" aria-label="Fechar">×</button>
            ${duration > 0 ? `<div class="toast-progress" style="animation-duration: ${duration}ms;"></div>` : ''}
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));

        this.container.appendChild(toast);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.remove(toast), duration);
        }

        return toast;
    },

    remove(toast) {
        toast.classList.add('toast-removing');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    },

    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize toast system
Toast.init();

// Confirmation Modal
function showConfirmModal(options) {
    return new Promise((resolve) => {
        const {
            title = 'Confirmar ação',
            message = 'Tem certeza que deseja continuar?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            type = 'warning' // 'warning' or 'danger'
        } = options;

        const modal = document.createElement('div');
        modal.className = 'confirm-modal';

        const icon = type === 'danger' ? '🗑️' : '⚠️';

        modal.innerHTML = `
            <div class="confirm-modal-content">
                <div class="confirm-modal-icon ${type}">
                    ${icon}
                </div>
                <h3 class="confirm-modal-title">${title}</h3>
                <p class="confirm-modal-message">${message}</p>
                <div class="confirm-modal-actions">
                    <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                    <button class="btn btn-${type}" data-action="confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Focus on confirm button
        setTimeout(() => {
            const confirmBtn = modal.querySelector('[data-action="confirm"]');
            if (confirmBtn) confirmBtn.focus();
        }, 100);

        function cleanup(result) {
            modal.style.opacity = '0';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                resolve(result);
            }, 200);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup(false);
            }

            const action = e.target.dataset.action;
            if (action === 'confirm') {
                cleanup(true);
            } else if (action === 'cancel') {
                cleanup(false);
            }
        });

        // ESC key to cancel
        function handleEscape(e) {
            if (e.key === 'Escape') {
                cleanup(false);
                document.removeEventListener('keydown', handleEscape);
            }
        }
        document.addEventListener('keydown', handleEscape);
    });
}

// Button Loading State
function setButtonLoading(button, loading = true) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }
}

// Upload Progress Tracking
class UploadTracker {
    constructor() {
        this.uploads = new Map();
    }

    start(id, fileName) {
        const tracker = {
            id,
            fileName,
            progress: 0,
            element: null
        };

        this.uploads.set(id, tracker);
        return tracker;
    }

    updateProgress(id, progress) {
        const tracker = this.uploads.get(id);
        if (tracker) {
            tracker.progress = progress;
            if (tracker.element) {
                const fill = tracker.element.querySelector('.progress-fill');
                const text = tracker.element.querySelector('.progress-text');
                if (fill) fill.style.width = `${progress}%`;
                if (text) text.textContent = `${Math.round(progress)}%`;
            }
        }
    }

    complete(id) {
        this.updateProgress(id, 100);
        setTimeout(() => {
            this.uploads.delete(id);
        }, 2000);
    }

    error(id) {
        this.uploads.delete(id);
    }
}

const uploadTracker = new UploadTracker();

// Drag and Drop Helper
function setupDragAndDrop(element, onFiles) {
    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.classList.add('dragover');
    });

    element.addEventListener('dragleave', (e) => {
        e.preventDefault();
        element.classList.remove('dragover');
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onFiles(files);
        }
    });
}

// Debounce function for search/filter
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Copy to clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        Toast.success('Copiado para a área de transferência!');
        return true;
    } catch (err) {
        Toast.error('Erro ao copiar para a área de transferência');
        return false;
    }
}

// Form Modal (for catalog entry forms)
function showFormModal(options) {
    return new Promise((resolve) => {
        const {
            title = 'Formulário',
            content = '',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar'
        } = options;

        const modal = document.createElement('div');
        modal.className = 'confirm-modal';

        modal.innerHTML = `
            <div class="confirm-modal-content" style="max-width: 600px;">
                <h3 class="confirm-modal-title" style="text-align: left; margin-bottom: 20px;">${title}</h3>
                <div class="modal-body" style="margin-bottom: 20px;">
                    ${content}
                </div>
                <div class="confirm-modal-actions">
                    <button class="btn btn-secondary" data-action="cancel">${cancelText}</button>
                    <button class="btn btn-primary" data-action="confirm">${confirmText}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Focus on first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);

        function cleanup(result) {
            modal.style.opacity = '0';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                resolve(result);
            }, 200);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup(false);
            }

            const action = e.target.dataset.action;
            if (action === 'confirm') {
                cleanup(true);
            } else if (action === 'cancel') {
                cleanup(false);
            }
        });

        // ESC key to cancel
        function handleEscape(e) {
            if (e.key === 'Escape') {
                cleanup(false);
                document.removeEventListener('keydown', handleEscape);
            }
        }
        document.addEventListener('keydown', handleEscape);
    });
}

// Export utilities to window for use in other scripts
window.Toast = Toast;
window.showConfirmModal = showConfirmModal;
window.showFormModal = showFormModal;
window.setButtonLoading = setButtonLoading;
window.uploadTracker = uploadTracker;
window.setupDragAndDrop = setupDragAndDrop;
window.debounce = debounce;
window.copyToClipboard = copyToClipboard;
