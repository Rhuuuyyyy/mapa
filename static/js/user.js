// Check authentication on page load
if (!checkAuth()) {
    window.location.href = '/';
}

// Load user info, catalog, and uploads on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserInfo();
    await loadCatalog();
    await loadUploads();
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

// ============================================================================
// CATALOG MANAGEMENT FUNCTIONS
// ============================================================================

async function loadCatalog() {
    const tbody = document.getElementById('catalogTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="4" class="loading"><div class="spinner"></div> Carregando catálogo...</td></tr>';

    try {
        const response = await fetchAPI('/api/user/catalog');
        if (response && response.ok) {
            const entries = await response.json();

            if (entries.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" class="empty-state">
                            <div class="empty-state-icon">📚</div>
                            <p>Nenhum produto cadastrado ainda. Clique em "Adicionar Produto" para começar!</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = entries.map(entry => {
                const safeProductName = escapeHtml(entry.product_name);
                const safeMapaReg = escapeHtml(entry.mapa_registration);
                const safeReference = escapeHtml(entry.product_reference || '-');

                return `
                    <tr>
                        <td style="font-weight: 500;">${safeProductName}</td>
                        <td><span class="badge badge-primary">${safeMapaReg}</span></td>
                        <td style="font-size: 14px; color: #666;">${safeReference}</td>
                        <td>
                            <div class="action-buttons">
                                <button onclick="showEditCatalogModal(${entry.id}, '${entry.product_name.replace(/'/g, "\\'")}', '${entry.mapa_registration.replace(/'/g, "\\'")}', '${(entry.product_reference || '').replace(/'/g, "\\'")}')" class="btn btn-secondary" title="Editar" style="padding: 6px 12px;">
                                    ✏️
                                </button>
                                <button onclick="deleteCatalogEntry(${entry.id}, '${entry.product_name.replace(/'/g, "\\'")} ')" class="btn btn-danger" title="Excluir" style="padding: 6px 12px;">
                                    🗑️
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading catalog:', error);
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state"><div class="empty-state-icon">❌</div><p>Erro ao carregar catálogo</p></td></tr>';
        Toast.error('Erro ao carregar catálogo');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function showAddCatalogModal() {
    const formHtml = `
        <div class="modal-form">
            <div class="form-group">
                <label for="catalogProductName">Nome do Produto (exato do XML)</label>
                <input type="text" id="catalogProductName" class="form-input" required
                    placeholder="Ex: CLORETO DE POTASSIO GRANULADO">
            </div>
            <div class="form-group">
                <label for="catalogMapaReg">Número de Registro MAPA</label>
                <input type="text" id="catalogMapaReg" class="form-input" required
                    placeholder="Ex: RS-003295-9.000007">
            </div>
            <div class="form-group">
                <label for="catalogReference">Referência (opcional)</label>
                <input type="text" id="catalogReference" class="form-input"
                    placeholder="Nota ou referência adicional">
            </div>
        </div>
    `;

    const confirmed = await showFormModal({
        title: 'Adicionar Produto ao Catálogo',
        content: formHtml,
        confirmText: 'Adicionar',
        cancelText: 'Cancelar'
    });

    if (confirmed) {
        const productName = document.getElementById('catalogProductName').value.trim();
        const mapaReg = document.getElementById('catalogMapaReg').value.trim();
        const reference = document.getElementById('catalogReference').value.trim();

        if (!productName || !mapaReg) {
            Toast.error('Preencha os campos obrigatórios');
            return;
        }

        await createCatalogEntry(productName, mapaReg, reference);
    }
}

async function showEditCatalogModal(entryId, productName, mapaReg, reference) {
    const formHtml = `
        <div class="modal-form">
            <div class="form-group">
                <label for="catalogProductName">Nome do Produto (exato do XML)</label>
                <input type="text" id="catalogProductName" class="form-input" required
                    value="${escapeHtml(productName)}">
            </div>
            <div class="form-group">
                <label for="catalogMapaReg">Número de Registro MAPA</label>
                <input type="text" id="catalogMapaReg" class="form-input" required
                    value="${escapeHtml(mapaReg)}">
            </div>
            <div class="form-group">
                <label for="catalogReference">Referência (opcional)</label>
                <input type="text" id="catalogReference" class="form-input"
                    value="${escapeHtml(reference)}">
            </div>
        </div>
    `;

    const confirmed = await showFormModal({
        title: 'Editar Produto do Catálogo',
        content: formHtml,
        confirmText: 'Salvar',
        cancelText: 'Cancelar'
    });

    if (confirmed) {
        const newProductName = document.getElementById('catalogProductName').value.trim();
        const newMapaReg = document.getElementById('catalogMapaReg').value.trim();
        const newReference = document.getElementById('catalogReference').value.trim();

        if (!newProductName || !newMapaReg) {
            Toast.error('Preencha os campos obrigatórios');
            return;
        }

        await updateCatalogEntry(entryId, newProductName, newMapaReg, newReference);
    }
}

async function createCatalogEntry(productName, mapaRegistration, reference) {
    try {
        const response = await fetchAPI('/api/user/catalog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_name: productName,
                mapa_registration: mapaRegistration,
                product_reference: reference || null
            })
        });

        if (response && response.ok) {
            Toast.success('Produto adicionado ao catálogo com sucesso!');
            await loadCatalog();
        } else {
            const error = await response.json();
            Toast.error(error.detail || 'Erro ao adicionar produto');
        }
    } catch (error) {
        console.error('Error creating catalog entry:', error);
        Toast.error('Erro ao adicionar produto ao catálogo');
    }
}

async function updateCatalogEntry(entryId, productName, mapaRegistration, reference) {
    try {
        const response = await fetchAPI(`/api/user/catalog/${entryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product_name: productName,
                mapa_registration: mapaRegistration,
                product_reference: reference || null
            })
        });

        if (response && response.ok) {
            Toast.success('Produto atualizado com sucesso!');
            await loadCatalog();
        } else {
            const error = await response.json();
            Toast.error(error.detail || 'Erro ao atualizar produto');
        }
    } catch (error) {
        console.error('Error updating catalog entry:', error);
        Toast.error('Erro ao atualizar produto');
    }
}

async function deleteCatalogEntry(entryId, productName) {
    const confirmed = await showConfirmModal({
        title: 'Excluir Produto do Catálogo',
        message: `Tem certeza que deseja excluir "${productName}" do catálogo?\n\nEsta ação não pode ser desfeita.`,
        confirmText: 'Sim, excluir',
        cancelText: 'Cancelar',
        type: 'danger'
    });

    if (!confirmed) return;

    try {
        const response = await fetchAPI(`/api/user/catalog/${entryId}`, {
            method: 'DELETE'
        });

        if (response && response.ok) {
            Toast.success('Produto excluído do catálogo com sucesso!');
            await loadCatalog();
        } else {
            const error = await response.json();
            Toast.error(error.detail || 'Erro ao excluir produto');
        }
    } catch (error) {
        console.error('Error deleting catalog entry:', error);
        Toast.error('Erro ao excluir produto do catálogo');
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

// Store current report data globally for PDF export
let currentReportData = null;
let currentReportPeriod = null;

// Generate Report Form Handler
document.getElementById('generateReportForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const period = document.getElementById('reportPeriod').value;
    const submitButton = e.target.querySelector('button[type="submit"]');

    if (!period) {
        Toast.warning('Selecione um trimestre');
        return;
    }

    // Hide any previous results
    document.getElementById('reportResultsSection').style.display = 'none';
    document.getElementById('unregisteredProductsSection').style.display = 'none';

    // Disable button
    setButtonLoading(submitButton, true);

    try {
        const response = await fetchAPI(`/api/user/generate-report/${period}`, {
            method: 'POST'
        });

        if (response && response.ok) {
            const result = await response.json();

            if (result.success) {
                // Success - display results table
                displayReportResults(result, period);
                Toast.success(`Processamento concluído! ${result.total_nfes} NF-e(s) processada(s).`, 6000);
            }
        } else {
            const error = await response.json();

            // Check if it's an unregistered products error
            if (error.detail && error.detail.unregistered_products) {
                displayUnregisteredProducts(error.detail.unregistered_products);
                Toast.error('Existem produtos não cadastrados no catálogo. Veja a lista abaixo.', 8000);
            } else {
                Toast.error(error.detail || 'Erro ao processar arquivos');
            }
        }
    } catch (error) {
        console.error('Error generating report:', error);
        Toast.error('Erro ao processar arquivos. Tente novamente.');
    } finally {
        setButtonLoading(submitButton, false);
    }
});

function displayReportResults(result, period) {
    currentReportData = result;
    currentReportPeriod = period;

    // Show results section
    const resultsSection = document.getElementById('reportResultsSection');
    resultsSection.style.display = 'block';

    // Update summary
    const summary = document.getElementById('reportResultsSummary');
    summary.textContent = `Processadas ${result.total_nfes} NF-e(s) do período ${period}. Total de ${result.rows.length} produto(s) agregado(s).`;

    // Populate table
    const tbody = document.getElementById('reportResultsTableBody');
    tbody.innerHTML = result.rows.map(row => `
        <tr>
            <td><strong>${escapeHtml(row.mapa_registration)}</strong></td>
            <td style="font-size: 14px;">${escapeHtml(row.product_reference)}</td>
            <td>${escapeHtml(row.unit)}</td>
            <td style="text-align: right; font-weight: 500;">${formatNumber(row.quantity_import)}</td>
            <td style="text-align: right; font-weight: 500;">${formatNumber(row.quantity_domestic)}</td>
        </tr>
    `).join('');

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function displayUnregisteredProducts(unregisteredProducts) {
    // Show unregistered products section
    const errorSection = document.getElementById('unregisteredProductsSection');
    errorSection.style.display = 'block';

    // Populate table
    const tbody = document.getElementById('unregisteredProductsTableBody');
    tbody.innerHTML = unregisteredProducts.map(product => `
        <tr>
            <td><strong>${escapeHtml(product.product_name)}</strong></td>
            <td>${escapeHtml(product.nfe_number)}</td>
            <td style="text-align: right;">${formatNumber(product.quantity)}</td>
            <td>${escapeHtml(product.unit)}</td>
        </tr>
    `).join('');

    // Scroll to error section
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatNumber(value) {
    // Format number with 2 decimal places and thousand separators
    const num = parseFloat(value);
    if (isNaN(num)) return '0,00';

    return num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

async function exportToPDF() {
    if (!currentReportData) {
        Toast.error('Nenhum relatório para exportar');
        return;
    }

    Toast.info('Gerando PDF...');

    try {
        // Use window.print() with custom CSS for PDF generation
        const printWindow = window.open('', '_blank');
        const tableHtml = generatePrintableTable(currentReportData, currentReportPeriod);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Relatório MAPA - ${currentReportPeriod}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { font-size: 18px; margin-bottom: 10px; text-align: center; }
                    .info { font-size: 12px; margin-bottom: 20px; text-align: center; color: #666; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background-color: #f0f0f0; font-size: 12px; font-weight: bold; padding: 8px; border: 1px solid #ccc; text-align: left; }
                    td { font-size: 11px; padding: 6px; border: 1px solid #ccc; }
                    .text-right { text-align: right; }
                    @media print {
                        body { padding: 10px; }
                        h1 { font-size: 16px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${tableHtml}
                <div class="no-print" style="margin-top: 20px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; font-size: 14px; cursor: pointer;">Imprimir / Salvar PDF</button>
                    <button onclick="window.close()" style="padding: 10px 20px; font-size: 14px; cursor: pointer; margin-left: 10px;">Fechar</button>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        Toast.success('PDF aberto em nova aba');
    } catch (error) {
        console.error('Error exporting PDF:', error);
        Toast.error('Erro ao gerar PDF');
    }
}

function generatePrintableTable(data, period) {
    const rows = data.rows.map(row => `
        <tr>
            <td><strong>${escapeHtml(row.mapa_registration)}</strong></td>
            <td>${escapeHtml(row.product_reference)}</td>
            <td style="text-align: center;">${escapeHtml(row.unit)}</td>
            <td class="text-right">${formatNumber(row.quantity_import)}</td>
            <td class="text-right">${formatNumber(row.quantity_domestic)}</td>
        </tr>
    `).join('');

    return `
        <h1>Relatório MAPA - Matérias-Primas</h1>
        <div class="info">
            <p>Período: ${escapeHtml(period)}</p>
            <p>Total de NF-e(s) processadas: ${data.total_nfes}</p>
            <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Registro MAPA</th>
                    <th style="width: 30%;">Produto (Referência)</th>
                    <th style="width: 10%; text-align: center;">Unidade</th>
                    <th style="width: 15%; text-align: right;">Qtd. Importação</th>
                    <th style="width: 20%; text-align: right;">Qtd. Outras Entradas</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

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
