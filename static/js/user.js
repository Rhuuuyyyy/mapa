// Check authentication on page load
if (!checkAuth()) {
    window.location.href = '/';
}

// Load user info, uploads and reports on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserInfo();
    await loadUploads();
    await loadReports();
    setupUploadDragDrop();
});

async function loadUserInfo() {
    try {
        const response = await fetchAPI('/api/user/me');
        if (response && response.ok) {
            const user = await response.json();
            const userNameEl = document.getElementById('userName');
            if (userNameEl) {
                userNameEl.textContent = user.full_name;
            }
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        Toast.error('Erro ao carregar informações do usuário');
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
            const countEl = document.getElementById('uploadCount');
            if (countEl) {
                countEl.textContent = `${uploads.length} arquivo${uploads.length !== 1 ? 's' : ''}`;
            }

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

                // Escape filename to prevent XSS
                const safeFilename = document.createElement('div');
                safeFilename.textContent = upload.filename;

                const errorMsg = upload.error_message ? `
                    <br><small style="color: var(--danger-color); font-size: 11px;">
                        ⚠️ ${safeFilename.textContent}
                    </small>
                ` : '';

                return `
                    <tr>
                        <td>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 20px;">${fileIcon}</span>
                                <span style="font-weight: 500;">${safeFilename.innerHTML}</span>
                            </div>
                        </td>
                        <td><span class="badge badge-primary">${fileType}</span></td>
                        <td>${formatDate(upload.upload_date)}</td>
                        <td>
                            <span class="status-badge ${upload.status}">
                                ${getStatusText(upload.status)}
                            </span>
                            ${errorMsg}
                        </td>
                        <td>
                            <div class="action-buttons">
                                <button onclick="deleteUpload(${upload.id}, '${upload.filename.replace(/'/g, "\\'")}') " class="btn btn-danger" title="Excluir arquivo">
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
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><div class="empty-state-icon">❌</div><p>Erro ao carregar uploads</p></td></tr>';
        Toast.error('Erro ao carregar lista de uploads');
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
            const countEl = document.getElementById('reportCount');
            if (countEl) {
                countEl.textContent = `${reports.length} relatório${reports.length !== 1 ? 's' : ''}`;
            }

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

            tbody.innerHTML = reports.map(report => {
                // Escape period to prevent XSS
                const safePeriod = document.createElement('div');
                safePeriod.textContent = report.report_period || 'N/A';

                return `
                <tr>
                    <td>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 20px;">📊</span>
                            <span style="font-weight: 500;">${safePeriod.innerHTML}</span>
                        </div>
                    </td>
                    <td>${formatDate(report.generated_at)}</td>
                    <td>
                        <div class="action-buttons">
                            <button onclick="downloadReport(${report.id})" class="btn btn-success" title="Baixar relatório">
                                📥 Download
                            </button>
                            <button onclick="deleteReport(${report.id}, '${(report.report_period || 'N/A').replace(/'/g, "\\'")} ')" class="btn btn-danger" title="Excluir relatório">
                                🗑️ Excluir
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading reports:', error);
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><div class="empty-state-icon">❌</div><p>Erro ao carregar relatórios</p></td></tr>';
        Toast.error('Erro ao carregar lista de relatórios');
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

// Upload Form Handler
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('xmlFile');
    const submitButton = e.target.querySelector('button[type="submit"]');

    if (!fileInput.files || fileInput.files.length === 0) {
        Toast.warning('Por favor, selecione um arquivo XML ou PDF');
        return;
    }

    const file = fileInput.files[0];

    // Validate file extension
    const fileExt = file.name.toLowerCase().split('.').pop();
    if (!['xml', 'pdf'].includes(fileExt)) {
        Toast.error('Apenas arquivos XML ou PDF são permitidos');
        return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        Toast.error('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Disable button during upload
    setButtonLoading(submitButton, true);

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
            Toast.success(`Arquivo "${file.name}" enviado e processado com sucesso!`);

            // Reset form
            fileInput.value = '';

            // Reload uploads after a short delay
            setTimeout(async () => {
                await loadUploads();
            }, 1000);
        } else {
            const error = await response.json();
            Toast.error(error.detail || 'Erro ao enviar arquivo');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        Toast.error('Erro ao enviar arquivo. Tente novamente.');
    } finally {
        setButtonLoading(submitButton, false);
    }
});

// Generate Report Form Handler
document.getElementById('generateReportForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const period = document.getElementById('reportPeriod').value;
    const submitButton = e.target.querySelector('button[type="submit"]');

    if (!period) {
        Toast.warning('Selecione um trimestre');
        return;
    }

    // Disable button
    setButtonLoading(submitButton, true);

    try {
        const response = await fetchAPI(`/api/user/generate-report/${period}`, {
            method: 'POST'
        });

        if (response && response.ok) {
            const result = await response.json();
            Toast.success(`Relatório gerado com sucesso! ${result.total_nfes} NF-e(s) processada(s).`, 6000);

            // Reset form
            document.getElementById('reportPeriod').value = '';

            // Reload reports
            setTimeout(async () => {
                await loadReports();
            }, 1000);
        } else {
            const error = await response.json();
            Toast.error(error.detail || 'Erro ao gerar relatório');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        Toast.error('Erro ao gerar relatório. Tente novamente.');
    } finally {
        setButtonLoading(submitButton, false);
    }
});

async function deleteUpload(uploadId, filename) {
    const confirmed = await showConfirmModal({
        title: 'Excluir Arquivo',
        message: `Tem certeza que deseja excluir o arquivo "${filename}"?\n\nEsta ação não pode ser desfeita.`,
        confirmText: 'Sim, excluir',
        cancelText: 'Cancelar',
        type: 'danger'
    });

    if (!confirmed) return;

    try {
        const response = await fetchAPI(`/api/user/uploads/${uploadId}`, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            Toast.success('Arquivo excluído com sucesso!');
            await loadUploads();
        } else {
            const error = await response.json();
            Toast.error(error.detail || 'Erro ao excluir arquivo');
        }
    } catch (error) {
        console.error('Error deleting upload:', error);
        Toast.error('Erro ao excluir arquivo');
    }
}

async function deleteReport(reportId, period) {
    const confirmed = await showConfirmModal({
        title: 'Excluir Relatório',
        message: `Tem certeza que deseja excluir o relatório "${period}"?\n\nEsta ação não pode ser desfeita.`,
        confirmText: 'Sim, excluir',
        cancelText: 'Cancelar',
        type: 'danger'
    });

    if (!confirmed) return;

    try {
        const response = await fetchAPI(`/api/user/reports/${reportId}`, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            Toast.success('Relatório excluído com sucesso!');
            await loadReports();
        } else {
            const error = await response.json();
            Toast.error(error.detail || 'Erro ao excluir relatório');
        }
    } catch (error) {
        console.error('Error deleting report:', error);
        Toast.error('Erro ao excluir relatório');
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

            Toast.success('Download iniciado com sucesso!');
        } else {
            const error = await response.json();
            Toast.error(error.detail || 'Erro ao baixar relatório');
        }
    } catch (error) {
        console.error('Error downloading report:', error);
        Toast.error('Erro ao baixar relatório');
    }
}

// Drag and drop functionality for upload box
function setupUploadDragDrop() {
    const uploadBox = document.querySelector('.upload-box');
    const fileInput = document.getElementById('xmlFile');

    if (!uploadBox || !fileInput) return;

    setupDragAndDrop(uploadBox, (files) => {
        const file = files[0];
        const fileExt = file.name.toLowerCase().split('.').pop();

        if (['xml', 'pdf'].includes(fileExt)) {
            // Create a new FileList with the dropped file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            Toast.info(`Arquivo selecionado: ${file.name}`);
        } else {
            Toast.warning('Apenas arquivos XML ou PDF são permitidos');
        }
    });
}

// ESC key handling for modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Handle any open modals if needed
    }
});
