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
    tbody.innerHTML = '<tr><td colspan="5" class="loading"><div class="spinner"></div> Carregando uploads...</td></tr>';
    
    try {
        const response = await fetchAPI('/api/user/uploads');
        if (response && response.ok) {
            const uploads = await response.json();
            
            // Update count
            document.getElementById('uploadCount').textContent = `${uploads.length} arquivo${uploads.length !== 1 ? 's' : ''}`;
            
            if (uploads.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state">
                            <div class="empty-state-icon">📭</div>
                            <p>Nenhum arquivo enviado ainda. Faça o upload de suas NF-es acima!</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = uploads.map(upload => {
                const fileExt = upload.filename.toLowerCase().split('.').pop();
                const fileIcon = fileExt === 'xml' ? '📄' : '📑';
                const fileType = fileExt.toUpperCase();
                
                return `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 20px;">${fileIcon}</span>
                                <span style="font-weight: 500;">${upload.filename}</span>
                            </div>
                        </td>
                        <td><span class="badge badge-primary">${fileType}</span></td>
                        <td>${formatDate(upload.upload_date)}</td>
                        <td>
                            <span class="status-badge ${upload.status}">
                                ${getStatusText(upload.status)}
                            </span>
                            ${upload.error_message ? `<br><small style="color: var(--danger-color); font-size: 11px;">⚠️ ${upload.error_message}</small>` : ''}
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button onclick="deleteUpload(${upload.id}, '${upload.filename}')" class="btn btn-danger" title="Excluir arquivo">
                                    🗑️ Excluir
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading uploads:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger-color); padding: 40px;">❌ Erro ao carregar uploads</td></tr>';
    }
}

async function loadReports() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '<tr><td colspan="3" class="loading"><div class="spinner"></div> Carregando relatórios...</td></tr>';
    
    try {
        const response = await fetchAPI('/api/user/reports');
        if (response && response.ok) {
            const reports = await response.json();
            
            // Update count
            document.getElementById('reportCount').textContent = `${reports.length} relatório${reports.length !== 1 ? 's' : ''}`;
            
            if (reports.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" class="empty-state">
                            <div class="empty-state-icon">📊</div>
                            <p>Nenhum relatório gerado ainda. Envie suas NF-es e gere seu relatório trimestral!</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = reports.map(report => `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">📊</span>
                            <span style="font-weight: 500;">${report.report_period || 'N/A'}</span>
                        </div>
                    </td>
                    <td>${formatDate(report.generated_at)}</td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="downloadReport(${report.id})" class="btn btn-success" title="Baixar relatório">
                                📥 Download
                            </button>
                            <button onclick="deleteReport(${report.id}, '${report.report_period}')" class="btn btn-danger" title="Excluir relatório">
                                🗑️ Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--danger-color); padding: 40px;">❌ Erro ao carregar relatórios</td></tr>';
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': '⏳ Pendente',
        'processed': '✅ Processado',
        'error': '❌ Erro'
    };
    return statusMap[status] || status;
}

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('xmlFile');
    const statusDiv = document.getElementById('uploadStatus');
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (!fileInput.files || fileInput.files.length === 0) {
        statusDiv.innerHTML = '<span class="alert-icon">⚠️</span> Por favor, selecione um arquivo XML ou PDF';
        statusDiv.className = 'status-message error';
        statusDiv.style.display = 'flex';
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file extension
    const fileExt = file.name.toLowerCase().split('.').pop();
    if (!['xml', 'pdf'].includes(fileExt)) {
        statusDiv.innerHTML = '<span class="alert-icon">⚠️</span> Apenas arquivos XML ou PDF são permitidos';
        statusDiv.className = 'status-message error';
        statusDiv.style.display = 'flex';
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Disable button during upload
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div> Enviando...';
    statusDiv.style.display = 'none';
    
    try {
        const token = getAuthToken();
        const response = await fetch('/api/user/upload-nfe', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            statusDiv.innerHTML = `<span class="alert-icon">✅</span> Arquivo enviado e processado com sucesso!`;
            statusDiv.className = 'status-message success';
            statusDiv.style.display = 'flex';
            
            // Reset form
            fileInput.value = '';
            
            // Reload uploads after a short delay
            setTimeout(async () => {
                await loadUploads();
            }, 1000);
        } else {
            const error = await response.json();
            statusDiv.innerHTML = `<span class="alert-icon">❌</span> ${error.detail || 'Erro ao enviar arquivo'}`;
            statusDiv.className = 'status-message error';
            statusDiv.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        statusDiv.innerHTML = '<span class="alert-icon">❌</span> Erro ao enviar arquivo. Tente novamente.';
        statusDiv.className = 'status-message error';
        statusDiv.style.display = 'flex';
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<span>📤</span> Enviar Arquivo';
    }
});

document.getElementById('generateReportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const period = document.getElementById('reportPeriod').value;
    const statusDiv = document.getElementById('generateStatus');
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (!period) {
        statusDiv.innerHTML = '<span class="alert-icon">⚠️</span> Selecione um trimestre';
        statusDiv.className = 'status-message error';
        statusDiv.style.display = 'flex';
        return;
    }
    
    // Disable button
    submitButton.disabled = true;
    submitButton.innerHTML = '<div class="spinner" style="width: 20px; height: 20px;"></div> Gerando relatório...';
    statusDiv.style.display = 'none';
    
    try {
        const response = await fetchAPI(`/api/user/generate-report/${period}`, {
            method: 'POST'
        });
        
        if (response && response.ok) {
            const result = await response.json();
            statusDiv.innerHTML = `<span class="alert-icon">✅</span> Relatório gerado com sucesso! ${result.total_nfes} NF-e(s) processada(s).`;
            statusDiv.className = 'status-message success';
            statusDiv.style.display = 'flex';
            
            // Reset form
            document.getElementById('reportPeriod').value = '';
            
            // Reload reports
            setTimeout(async () => {
                await loadReports();
            }, 1000);
        } else {
            const error = await response.json();
            statusDiv.innerHTML = `<span class="alert-icon">❌</span> ${error.detail || 'Erro ao gerar relatório'}`;
            statusDiv.className = 'status-message error';
            statusDiv.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error generating report:', error);
        statusDiv.innerHTML = '<span class="alert-icon">❌</span> Erro ao gerar relatório. Tente novamente.';
        statusDiv.className = 'status-message error';
        statusDiv.style.display = 'flex';
    } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = '<span>📊</span> Gerar Relatório MAPA';
    }
});

async function deleteUpload(uploadId, filename) {
    if (!confirm(`Tem certeza que deseja excluir o arquivo "${filename}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }
    
    try {
        const response = await fetchAPI(`/api/user/uploads/${uploadId}`, {
            method: 'DELETE'
        });
        
        if (response && response.ok) {
            await loadUploads();
            
            // Show success message
            const statusDiv = document.getElementById('uploadStatus');
            statusDiv.innerHTML = '<span class="alert-icon">✅</span> Arquivo excluído com sucesso!';
            statusDiv.className = 'status-message success';
            statusDiv.style.display = 'flex';
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        } else {
            const error = await response.json();
            alert(error.detail || 'Erro ao excluir arquivo');
        }
    } catch (error) {
        console.error('Error deleting upload:', error);
        alert('Erro ao excluir arquivo');
    }
}

async function deleteReport(reportId, period) {
    if (!confirm(`Tem certeza que deseja excluir o relatório "${period}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
    }
    
    try {
        const response = await fetchAPI(`/api/user/reports/${reportId}`, {
            method: 'DELETE'
        });
        
        if (response && response.ok) {
            await loadReports();
            
            // Show success message
            const statusDiv = document.getElementById('generateStatus');
            statusDiv.innerHTML = '<span class="alert-icon">✅</span> Relatório excluído com sucesso!';
            statusDiv.className = 'status-message success';
            statusDiv.style.display = 'flex';
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        } else {
            const error = await response.json();
            alert(error.detail || 'Erro ao excluir relatório');
        }
    } catch (error) {
        console.error('Error deleting report:', error);
        alert('Erro ao excluir relatório');
    }
}

async function downloadReport(reportId) {
    try {
        const token = getAuthToken();
        const response = await fetch(`/api/user/download-report/${reportId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'Relatorio_MAPA.xlsx';
            
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            // Download file
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Show success message
            const statusDiv = document.getElementById('generateStatus');
            statusDiv.innerHTML = '<span class="alert-icon">✅</span> Download iniciado com sucesso!';
            statusDiv.className = 'status-message success';
            statusDiv.style.display = 'flex';
            
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        } else {
            const error = await response.json();
            alert(error.detail || 'Erro ao baixar relatório');
        }
    } catch (error) {
        console.error('Error downloading report:', error);
        alert('Erro ao baixar relatório');
    }
}

// Drag and drop functionality for upload box
const uploadBox = document.querySelector('.upload-box');
const fileInput = document.getElementById('xmlFile');

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--primary-color)';
    uploadBox.style.background = 'var(--primary-light)';
});

uploadBox.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--border-color)';
    uploadBox.style.background = 'var(--background)';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = 'var(--border-color)';
    uploadBox.style.background = 'var(--background)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        
        // Trigger visual feedback
        const fileName = files[0].name;
        const fileExt = fileName.toLowerCase().split('.').pop();
        if (['xml', 'pdf'].includes(fileExt)) {
            const statusDiv = document.getElementById('uploadStatus');
            statusDiv.innerHTML = `<span class="alert-icon">📄</span> Arquivo selecionado: ${fileName}`;
            statusDiv.className = 'status-message success';
            statusDiv.style.display = 'flex';
        }
    }
});