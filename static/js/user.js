// Check authentication on page load
if (!checkAuth()) {
    window.location.href = '/';
}

// Load user info, uploads and reports on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserInfo();
    await loadUploads();
    await loadReports();
});

async function loadUserInfo() {
    try {
        const response = await fetchAPI('/api/user/me');
        if (response && response.ok) {
            const user = await response.json();
            document.getElementById('userName').textContent = user.full_name;
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadUploads() {
    const tbody = document.getElementById('uploadsTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Carregando uploads...</td></tr>';
    
    try {
        const response = await fetchAPI('/api/user/uploads');
        if (response && response.ok) {
            const uploads = await response.json();
            
            if (uploads.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Nenhum arquivo enviado ainda</td></tr>';
                return;
            }
            
            tbody.innerHTML = uploads.map(upload => `
                <tr>
                    <td>${upload.filename}</td>
                    <td>${formatDate(upload.upload_date)}</td>
                    <td>
                        <span class="status-badge ${upload.status}">
                            ${getStatusText(upload.status)}
                        </span>
                        ${upload.error_message ? `<br><small style="color: var(--danger-color);">${upload.error_message}</small>` : ''}
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="deleteUpload(${upload.id}, '${upload.filename}')" class="btn btn-danger">Excluir</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading uploads:', error);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar uploads</td></tr>';
    }
}

async function loadReports() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="loading">Carregando relatórios...</td></tr>';
    
    try {
        const response = await fetchAPI('/api/user/reports');
        if (response && response.ok) {
            const reports = await response.json();
            
            if (reports.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px;">Nenhum relatório gerado ainda</td></tr>';
                return;
            }
            
            tbody.innerHTML = reports.map(report => `
                <tr>
                    <td>${report.report_period || '-'}</td>
                    <td>${formatDate(report.generated_at)}</td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="downloadReport(${report.id})" class="btn btn-success">Download</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Erro ao carregar relatórios</td></tr>';
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'processed': 'Processado',
        'error': 'Erro'
    };
    return statusMap[status] || status;
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('xmlFile');
    const statusDiv = document.getElementById('uploadStatus');
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        statusDiv.textContent = 'Por favor, selecione um arquivo XML';
        statusDiv.className = 'status-message error';
        statusDiv.style.display = 'block';
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file extension
    if (!file.name.toLowerCase().endsWith('.xml')) {
        statusDiv.textContent = 'Apenas arquivos XML são permitidos';
        statusDiv.className = 'status-message error';
        statusDiv.style.display = 'block';
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Disable button during upload
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
    statusDiv.style.display = 'none';
    
    try {
        const token = getAuthToken();
        const response = await fetch('/api/user/upload-xml', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            statusDiv.textContent = 'Arquivo enviado com sucesso!';
            statusDiv.className = 'status-message success';
            statusDiv.style.display = 'block';
            
            // Reset form
            fileInput.value = '';
            
            // Reload uploads
            await loadUploads();
        } else {
            const error = await response.json();
            statusDiv.textContent = error.detail || 'Erro ao enviar arquivo';
            statusDiv.className = 'status-message error';
            statusDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        statusDiv.textContent = 'Erro ao enviar arquivo';
        statusDiv.className = 'status-message error';
        statusDiv.style.display = 'block';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar XML';
    }
});

async function deleteUpload(uploadId, filename) {
    if (!confirm(`Tem certeza que deseja excluir o arquivo "${filename}"?`)) {
        return;
    }
    
    try {
        const response = await fetchAPI(`/api/user/uploads/${uploadId}`, {
            method: 'DELETE'
        });
        
        if (response && response.ok) {
            await loadUploads();
            alert('Arquivo excluído com sucesso!');
        } else {
            const error = await response.json();
            alert(error.detail || 'Erro ao excluir arquivo');
        }
    } catch (error) {
        console.error('Error deleting upload:', error);
        alert('Erro ao excluir arquivo');
    }
}

async function downloadReport(reportId) {
    // Placeholder - será implementado quando a geração de relatórios estiver pronta
    alert('Funcionalidade de download será implementada após a definição do formato do relatório MAPA');
}