/**
 * MAPA SaaS - Admin Dashboard Scripts
 */

const token = localStorage.getItem('access_token');

// Verificar autenticação e carregar dados
async function init() {
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const user = await apiRequest('/api/admin/me');
        document.getElementById('userName').textContent = user.full_name;

        if (!user.is_admin) {
            window.location.href = '/user_dashboard.html';
            return;
        }

        loadUsers();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        logout();
    }
}

// Carregar lista de usuários
async function loadUsers() {
    try {
        const users = await apiRequest('/api/admin/users');
        const tbody = document.getElementById('usersTableBody');

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>${user.full_name}</td>
                <td>${user.company_name || '-'}</td>
                <td>${user.is_admin ? 'Sim' : 'Não'}</td>
                <td>${user.is_active ? 'Sim' : 'Não'}</td>
                <td>
                    <button onclick="deleteUser(${user.id})" class="btn btn-secondary" style="padding: 0.5rem 1rem;">
                        Excluir
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

// Mostrar/esconder form de criar usuário
function showCreateUserForm() {
    document.getElementById('createUserForm').style.display = 'block';
}

function hideCreateUserForm() {
    document.getElementById('createUserForm').style.display = 'none';
    document.getElementById('newUserForm').reset();
}

// Criar usuário
document.getElementById('newUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById('newEmail').value,
        full_name: document.getElementById('newFullName').value,
        company_name: document.getElementById('newCompanyName').value || null,
        password: document.getElementById('newPassword').value,
        is_admin: document.getElementById('newIsAdmin').checked
    };

    try {
        await apiRequest('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        alert('Usuário criado com sucesso!');
        hideCreateUserForm();
        loadUsers();
    } catch (error) {
        alert('Erro ao criar usuário: ' + error.message);
    }
});

// Deletar usuário
async function deleteUser(userId) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
        return;
    }

    try {
        await apiRequest(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });

        alert('Usuário excluído com sucesso!');
        loadUsers();
    } catch (error) {
        alert('Erro ao excluir usuário: ' + error.message);
    }
}

// Inicializar
init();
