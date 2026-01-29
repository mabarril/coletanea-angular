# Guia de Atualização Semanal do Calendário

Este documento descreve o processo de atualização semanal dos eventos do calendário a partir do Microsoft Bookings.

## 📋 Visão Geral

O calendário de eventos (`co.lendário`) exibe informações extraídas de um arquivo TSV (Tab-Separated Values) exportado do Microsoft Bookings. Este arquivo deve ser atualizado **semanalmente** para garantir que os eventos exibidos estejam sempre atualizados.

## 📂 Localização do Arquivo

O arquivo de dados está localizado em:
```
src/assets/data/eventos.tsv
```

## 🔄 Processo de Atualização Semanal

### Passo 1: Exportar Dados do Microsoft Bookings

1. Acesse o **Microsoft Bookings** através do portal do Office 365
2. Navegue até a seção de **Reservas** ou **Bookings**
3. Localize a opção de **Exportar** ou **Download**
4. Selecione o formato **TSV** (Tab-Separated Values)
5. Escolha o período desejado (recomenda-se exportar pelo menos as próximas 2-4 semanas)
6. Faça o download do arquivo

### Passo 2: Preparar o Arquivo

1. Localize o arquivo baixado (geralmente na pasta `Downloads`)
2. O arquivo deve ter um nome similar a `BookingsReportingData.tsv` ou `BookingsReportingData(X).tsv`
3. **Importante**: Verifique se o arquivo contém as seguintes colunas:
   - Date Time
   - Customer Name
   - Service
   - Location
   - Duration (mins.)
   - Custom Fields (contendo informações do evento em formato JSON)

### Passo 3: Substituir o Arquivo no Projeto

Você tem **duas opções** para atualizar os eventos:

#### Opção A: Upload via Interface Web (Recomendado)

1. Acesse a página de upload: `http://localhost:4200/admin/upload-eventos` (ou URL de produção)
2. Arraste o arquivo TSV exportado para a área de upload, ou clique em "Selecionar Arquivo"
3. Aguarde a validação e processamento do arquivo
4. Verifique a prévia dos eventos carregados
5. O calendário será atualizado automaticamente

**Vantagens:**
- ✅ Não requer acesso ao servidor
- ✅ Validação instantânea do arquivo
- ✅ Prévia dos eventos antes de confirmar
- ✅ Atualização automática do calendário
- ✅ Pode ser feito de qualquer computador

**Nota:** Os dados ficam salvos no navegador (localStorage). Se limpar os dados do navegador, precisará fazer upload novamente.

---

#### Opção B: Substituição Manual no Servidor

1. Navegue até a pasta do projeto: `coletanea`
2. Acesse o diretório: `src/assets/data/`
3. **Faça backup** do arquivo atual `eventos.tsv` (opcional, mas recomendado)
4. Substitua o arquivo `eventos.tsv` pelo novo arquivo exportado
5. **Renomeie** o arquivo para `eventos.tsv` (se necessário)


#### Usando a Linha de Comando (Linux/Mac)

```bash
# Navegue até a pasta do projeto
cd /caminho/para/coletanea

# Faça backup do arquivo atual (opcional)
cp src/assets/data/eventos.tsv src/assets/data/eventos.tsv.backup

# Copie o novo arquivo
cp ~/Downloads/BookingsReportingData.tsv src/assets/data/eventos.tsv
```

#### Usando o Windows Explorer

1. Abra o Windows Explorer
2. Navegue até `Downloads` e localize o arquivo exportado
3. Copie o arquivo
4. Navegue até `coletanea/src/assets/data/`
5. Cole e substitua o arquivo `eventos.tsv`

### Passo 4: Verificar a Atualização

#### Opção A: Servidor em Execução (Desenvolvimento)

Se o servidor de desenvolvimento estiver rodando, ele detectará automaticamente a mudança:

1. O navegador deve recarregar automaticamente
2. Abra o console do navegador (F12)
3. Procure pela mensagem: `Loaded X events from TSV file`
4. Verifique se os novos eventos aparecem no calendário

#### Opção B: Reiniciar o Servidor

Se o servidor não estiver rodando ou se preferir reiniciar:

```bash
# Pare o servidor (se estiver rodando)
# Pressione Ctrl+C no terminal

# Inicie o servidor novamente
npm start
```

#### Opção C: Ambiente de Produção

Se a aplicação estiver em produção:

1. Faça o build da aplicação:
   ```bash
   npm run build
   ```
2. Implante a nova versão no servidor de produção
3. Ou, se o servidor suportar, apenas substitua o arquivo `eventos.tsv` na pasta de assets

## 🔍 Verificação e Troubleshooting

### Como Verificar se a Atualização Funcionou

1. Acesse a página do calendário: `http://localhost:4200/colendario` (desenvolvimento)
2. Abra o Console do Navegador (F12 → Console)
3. Procure pela mensagem: `Loaded X events from TSV file`
4. Verifique se os eventos exibidos correspondem aos dados do arquivo TSV

### Problemas Comuns

#### ❌ Erro 404: Arquivo não encontrado

**Sintoma**: Console mostra `Error loading TSV file: 404`

**Solução**:
- Verifique se o arquivo está em `src/assets/data/eventos.tsv`
- Verifique se o nome do arquivo está correto (deve ser exatamente `eventos.tsv`)
- Reinicie o servidor de desenvolvimento

#### ❌ Nenhum evento é exibido

**Sintoma**: Calendário vazio, mas sem erros no console

**Possíveis causas**:
- Todos os eventos no arquivo TSV são de datas passadas (o sistema filtra eventos antigos)
- Arquivo TSV está vazio ou mal formatado
- Campos personalizados (Custom Fields) não contêm as informações esperadas

**Solução**:
- Verifique se há eventos futuros no arquivo TSV
- Abra o arquivo TSV em um editor de texto e verifique o formato
- Certifique-se de que a coluna "Custom Fields" contém JSON válido

#### ❌ Erro ao parsear o arquivo

**Sintoma**: Console mostra `Error parsing TSV row` ou `Could not parse date/time`

**Solução**:
- Verifique se o formato de data está correto: `DD/MM/YYYY HH:MM`
- Certifique-se de que o arquivo usa tabulações (TAB) como separador, não espaços
- Verifique se não há linhas vazias ou corrompidas no arquivo

## 📊 Formato do Arquivo TSV

O arquivo deve seguir este formato:

```
Date Time	Customer Name	Customer Email	...	Custom Fields	...
27/01/2026 09:00	Nome do Cliente	email@exemplo.com	...	{"Nome do evento": "Workshop OKR", "Quantidade estimada de participantes": "50"}	...
```

### Campos Importantes

- **Date Time**: Data e hora no formato `DD/MM/YYYY HH:MM`
- **Service**: Nome do serviço (usado como fallback se não houver nome no Custom Fields)
- **Duration (mins.)**: Duração em minutos
- **Custom Fields**: JSON contendo:
  - `Nome do evento`: Nome do evento a ser exibido
  - `Quantidade estimada de participantes`: Capacidade do evento

## 🔐 Boas Práticas

1. **Backup Regular**: Mantenha backups dos arquivos TSV anteriores
2. **Validação**: Sempre verifique o arquivo após a exportação antes de substituir
3. **Agendamento**: Defina um dia fixo da semana para fazer a atualização (ex: toda segunda-feira)
4. **Documentação**: Registre quando foi feita a última atualização
5. **Teste**: Sempre teste no ambiente de desenvolvimento antes de atualizar produção

## 📞 Suporte

Em caso de problemas ou dúvidas:
1. Verifique os logs do console do navegador
2. Consulte este documento
3. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: 29/01/2026
