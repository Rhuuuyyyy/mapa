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