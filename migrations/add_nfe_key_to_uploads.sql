-- Migração: Adicionar campo nfe_key à tabela xml_uploads
-- Data: 2025-11-18
-- Descrição: Campo para armazenar chave de acesso da NF-e (44 dígitos) para validação de duplicatas

-- Adicionar coluna nfe_key
ALTER TABLE xml_uploads
ADD COLUMN IF NOT EXISTS nfe_key VARCHAR(44);

-- Criar índice na coluna nfe_key para buscas rápidas
CREATE INDEX IF NOT EXISTS ix_xml_uploads_nfe_key
ON xml_uploads(nfe_key);

-- Criar índice composto user_id + nfe_key para validação de duplicatas
CREATE INDEX IF NOT EXISTS ix_user_nfe_key
ON xml_uploads(user_id, nfe_key);

-- Comentário na coluna
COMMENT ON COLUMN xml_uploads.nfe_key IS 'Chave de acesso da NF-e (44 dígitos) para validação de duplicatas';
