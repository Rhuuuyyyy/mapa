// Check authentication on page load
if (!checkAuth()) {
    window.location.href = '/';
}

let currentEditingUserId = null;

// Load admin info and users on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadAdminInfo();
    await loadUsers();
});

async function loadAdminInfo() {
    try {
        const response = await fetchAPI('/api/admin/me');
        if (response && response.ok) {
            const admin = await response.json();
            document.getElementById('adminName').textContent = admin.full_name;

            // Check if user is actually an admin
            if (!admin.is_admin) {
                Toast.error('Acesso negado. Você não é um administrador.');
                setTimeout(() => logout(), 2000);
            }
        }
    } catch (error) {
        console.error('Error loading admin info:', error);
        Toast.error('Erro ao carregar informações do administrador');
    }
}

async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="loading"><div class="spinner"></div> Carregando usuários...</td></tr>';

    try {
        const response = await fetchAPI('/api/admin/users');
        if (response && response.ok) {
            const users = await response.json();

            if (users.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="empty-state">
                            <div class="empty-state-icon">👥</div>
                            <p>Nenhum usuário cadastrado. Crie o primeiro usuário!</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = users.map(user => {
                // Escape user data to prevent XSS
                const safeName = document.createElement('div');
                safeName.textContent = user.full_name;
                const safeEmail = document.createElement('div');
                safeEmail.textContent = user.email;
                const safeCompany = document.createElement('div');
                safeCompany.textContent = user.company_name || '-';

                return `
                <tr>
                    <td>${user.id}</td>
                    <td>${safeName.innerHTML}</td>
                    <td>${safeEmail.innerHTML}</td>
                    <td>${safeCompany.innerHTML}</td>
                    <td>${user.is_admin ? '<span class="badge badge-primary">Sim</span>' : 'Não'}</td>
                    <td>
                        <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                            ${user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="editUser(${user.id})" class="btn btn-success">✏️ Editar</button>
                            <button onclick="deleteUser(${user.id}, '${user.full_name.replace(/'/g, "\\'")}' )" class="btn btn-danger">🗑️ Excluir</button>
                        </div>
                    </td>
                </tr>
            `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state"><div class="empty-state-icon">❌</div><p>Erro ao carregar usuários</p></td></tr>';
        Toast.error('Erro ao carregar lista de usuários');
    }
}

function showCreateUserModal() {
    currentEditingUserId = null;
    document.getElementById('modalTitle').textContent = 'Novo Usuário';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').required = true;
    document.getElementById('isActive').checked = true;
    document.getElementById('modalError').style.display = 'none';
    document.getElementById('userModal').style.display = 'flex';

    // Focus on first input
    setTimeout(() => {
        document.getElementById('fullName').focus();
    }, 100);
}

async function editUser(userId) {
    currentEditingUserId = userId;
    document.getElementById('modalTitle').textContent = 'Editar Usuário';
    document.getElementById('userPassword').required = false;
    document.getElementById('modalError').style.display = 'none';

    try {
        const response = await fetchAPI(`/api/admin/users/${userId}`);
        if (response && response.ok) {
            const user = await response.json();

            document.getElementById('userId').value = user.id;
            document.getElementById('fullName').value = user.full_name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('companyName').value = user.company_name || '';
            document.getElementById('userPassword').value = '';
            document.getElementById('isAdmin').checked = user.is_admin;
            document.getElementById('isActive').checked = user.is_active;

            document.getElementById('userModal').style.display = 'flex';

            // Focus on first input
            setTimeout(() => {
                document.getElementById('fullName').focus();
            }, 100);
        }
    } catch (error) {
        console.error('Error loading user:', error);
        Toast.error('Erro ao carregar dados do usuário');
    }
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
    currentEditingUserId = null;
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorDiv = document.getElementById('modalError');
    errorDiv.style.display = 'none';

    const submitButton = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitButton, true);

    const userData = {
        full_name: document.getElementById('fullName').value,
        email: document.getElementById('userEmail').value,
        company_name: document.getElementById('companyName').value || null,
        is_admin: document.getElementById('isAdmin').checked,
    };

    const password = document.getElementById('userPassword').value;
    if (password) {
        userData.password = password;
    }

    // For updates only
    if (currentEditingUserId) {
        userData.is_active = document.getElementById('isActive').checked;
    }

    try {
        let response;

        if (currentEditingUserId) {
            // Update existing user
            response = await fetchAPI(`/api/admin/users/${currentEditingUserId}`, {
                method: 'PUT',
                body: JSON.stringify(userData)
            });
        } else {
            // Create new user
            response = await fetchAPI('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
        }

        if (response && response.ok) {
            closeUserModal();
            await loadUsers();

            const message = currentEditingUserId
                ? 'Usuário atualizado com sucesso!'
                : 'Usuário criado com sucesso!';
            Toast.success(message);
        } else {
            const error = await response.json();
            errorDiv.textContent = error.detail || 'Erro ao salvar usuário';
            errorDiv.style.display = 'block';
            Toast.error(error.detail || 'Erro ao salvar usuário');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        errorDiv.textContent = 'Erro ao salvar usuário';
        errorDiv.style.display = 'block';
        Toast.error('Erro ao salvar usuário');
    } finally {
        setButtonLoading(submitButton, false);
    }
});

async function deleteUser(userId, userName) {
    const confirmed = await showConfirmModal({
        title: 'Excluir Usuário',
        message: `Tem certeza que deseja excluir o usuário "${userName}"?\n\nTodos os uploads e relatórios deste usuário também serão excluídos. Esta ação não pode ser desfeita.`,
        confirmText: 'Sim, excluir',
        cancelText: 'Cancelar',
        type: 'danger'
    });

    if (!confirmed) return;

    try {
        const response = await fetchAPI(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            await loadUsers();
            Toast.success('Usuário excluído com sucesso!');
        } else {
            const error = await response.json();
            Toast.error(error.detail || 'Erro ao excluir usuário');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        Toast.error('Erro ao excluir usuário');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('userModal');
    if (event.target === modal) {
        closeUserModal();
    }
}

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('userModal');
        if (modal && modal.style.display === 'flex') {
            closeUserModal();
        }
    }
});
