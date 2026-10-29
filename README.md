# RORDENS — app de desktop

Aplicativo de desktop (Mac e Windows) do **RORDENS For People**. Ele é só uma janela própria, com ícone no Dock e na barra de tarefas, que abre **https://rordens.ai/people**. A conta, as conversas e os dados são os mesmos do site.

Este repositório é público de propósito: qualquer pessoa pode conferir que o app **só abre o site do RORDENS** e não faz mais nada por conta própria.

## O que o app faz
- Abre `https://rordens.ai/people` numa janela (`main.js`, uns 70 linhas).
- Endereços do RORDENS, do Supabase (login) e da Stripe (pagamento) abrem dentro do app; qualquer outro endereço abre no navegador do sistema.
- Não tem acesso ao sistema além do que o navegador oferece. O recurso "Liberar arquivos" do site pede a sua escolha e o seu consentimento a cada vez.
- Sem telemetria, sem serviço em segundo plano, sem atualização escondida.

## Conferir o download
Cada versão publica o arquivo `SHA256SUMS.txt`. Para conferir: `shasum -a 256 <arquivo>` e compare.

## Construir
```
npm ci
npm run dist:mac   # no Mac (Apple Silicon)
npm run dist:win   # instalador do Windows
```
O workflow `Build` gera o instalador do Windows num Windows de verdade (Actions → Run workflow).

## Segurança
Para relatar uma falha: **contact@rordens.ai**. Veja `SECURITY.md`.

© DMG Prestação de Serviços (Diego Marcondes Guerra), CNPJ 20.512.829/0001-80. Todos os direitos reservados; o código está público para auditoria.
