import React, { useState, useRef } from 'react';
import { Upload, File, CheckCircle, XCircle, Loader2, FileText, AlertCircle, Clock } from 'lucide-react';
import { xmlUploads } from '../services/api';

const UploadXML = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.name.endsWith('.xml') || file.type === 'text/xml'
    );

    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results = [];

    for (const file of files) {
      try {
        const response = await xmlUploads.upload(file);
        results.push({
          filename: file.name,
          status: 'success',
          message: 'Upload realizado com sucesso',
          data: response
        });
      } catch (error) {
        results.push({
          filename: file.name,
          status: 'error',
          message: error.response?.data?.detail || 'Erro ao fazer upload'
        });
      }
    }

    setUploadResults(results);
    setFiles([]);
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload de XMLs</h1>
        <p className="text-gray-600 mt-1">
          Faça upload dos arquivos XML de NF-e para processamento automático
        </p>
      </div>

      {/* Área de Upload */}
      <div className="card">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-300 hover:border-emerald-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              dragActive ? 'bg-emerald-100' : 'bg-gray-100'
            }`}>
              <Upload className={`w-8 h-8 ${dragActive ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Arraste arquivos XML aqui
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ou clique no botão abaixo para selecionar
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xml,text/xml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Selecionar Arquivos
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Formatos aceitos: XML • Tamanho máximo: 10MB por arquivo
            </p>
          </div>
        </div>

        {/* Lista de arquivos selecionados */}
        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-emerald-600" />
              Arquivos selecionados ({files.length})
            </h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <File className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-4 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={uploading}
                  >
                    <XCircle className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full mt-4 h-12"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Enviando {files.length} arquivo(s)...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Enviar {files.length} arquivo(s)
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Resultados do Upload */}
      {uploadResults.length > 0 && (
        <div className="card">
          <h4 className="font-semibold text-gray-900 mb-4">Resultados do Upload</h4>
          <div className="space-y-2">
            {uploadResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg flex items-start space-x-3 ${
                  result.status === 'success'
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                {result.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{result.filename}</p>
                  <p className={`text-sm mt-1 ${
                    result.status === 'success' ? 'text-emerald-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-emerald-600" />
          Uploads Recentes
        </h3>
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Nenhum upload recente</p>
          <p className="text-sm mt-1">Os XMLs enviados aparecerão aqui</p>
        </div>
      </div>
    </div>
  );
};

export default UploadXML;
