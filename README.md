# Sistema de Gestão Comercial — Operação & Estoque

[![Status: Concluído](https://img.shields.io/badge/STATUS-CONCLUÍDO-green?style=for-the-badge)](https://github.com/Guilherme-Bisof/Sistema-de-Gestao)
[![Electron](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/)

> Aplicação Desktop nativa para Windows desenvolvida com Electron e Node.js para centralização operacional, conciliação financeira e controle de estoque veicular. Projetada sob o conceito **Offline-First**, garantindo persistência local, zero dependência de conexão externa e execução autônoma.

---

## 📋 Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades Principais](#funcionalidades-principais)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Organização do Projeto](#organização-do-projeto)
- [O Que Este Projeto Demonstra](#o-que-este-projeto-demonstra)
- [Como Executar a Aplicação](#como-executar-a-aplicação)
- [Build e Empacotamento (.exe)](#build-e-empacotamento-exe)
- [Melhorias Futuras](#melhorias-futuras)

---

##  Sobre o Projeto

O projeto foi desenvolvido para atender a demanda de centralização de processos comerciais, substituindo controles manuais em planilhas descentralizadas. A solução integra a flexibilidade das tecnologias web dentro do runtime nativo do **Electron**, assegurando autonomia operacional para os terminais da loja sem riscos de paralisação por instabilidades de rede.

---

##  Funcionalidades Principais

* **Gestão Financeira & Fluxo de Caixa:** Lançamento de contas a pagar e a receber com cálculo dinâmico de saldo e rotinas de alerta de vencimento.
* **Controle de Estoque de Veículos:** Cadastro de veículos com ficha técnica detalhada e gerenciamento de múltiplas fotos com compressão e armazenamento otimizado em Base64.
* **Módulo de Clientes:** Centralização de registros cadastrais e rastreabilidade de negociações.
* **Persistência Offline-First:** Mecanismo de gravação em disco local seguro e independente de infraestrutura de nuvem.
* **Rotinas de Backup e Recuperação:** Exportação e importação da base de dados em formato JSON para proteção contra falhas operacionais ou corrupção de hardware.

---

##  Tecnologias Utilizadas

* **Runtime Desktop:** Electron, Node.js
* **Camada de Apresentação (UI):** HTML5 Semântico, CSS3 Avançado (Flexbox, CSS Grid, Variáveis CSS)
* **Lógica da Aplicação:** JavaScript ES6+ (Manipulação assíncrona, eventos de DOM e IPC do Electron)
* **Empacotamento & Distribuição:** Electron Packager

---

##  Organização do Projeto
```bash
Sistema de Gestao/
├── src/
│   ├── assets/      # Recursos visuais estáticos e ícones
│   ├── css/         # Folhas de estilo modulares e temas
│   ├── js/          # Controladores lógicos e persistência local (database.js, script.js)
│   └── index.html   # Camada de apresentação e interface com usuário
├── main.js          # Processo principal (Main Process) e ciclo de vida do Electron
└── package.json     # Metadados e scripts de execução/build
```

---

## O Que Este Projeto Demonstra

* **Desenvolvimento de Aplicações Desktop:** Uso de Electron para transformar tecnologias web em executáveis nativos com comunicação segura entre processos.
* **Engenharia de Software Offline-First:** Estruturação de fluxos transacionais locais com preservação de dados e tratamento de integridade.
* **Otimização de Performance:** Tratamento e compressão de imagens em memória local, reduzindo a pegada de armazenamento no terminal.
* **Arquitetura Orientada a Negócio:** Mapeamento de requisitos operacionais em fluxos funcionais claros para os operadores.

---

##  Como Executar a Aplicação

### Pré-requisitos
* Node.js LTS instalado
* Git instalado

```bash
# 1. Clonar o repositório
git clone [https://github.com/Guilherme-Bisof/Sistema-de-Gestao.git](https://github.com/Guilherme-Bisof/Sistema-de-Gestao.git)
cd Sistema-de-Gestao

# 2. Instalar as dependências
npm install

# 3. Iniciar em ambiente de desenvolvimento
npm start
```

---

## Build e Empacotamento (.exe)
```bash
npx electron-packager . "Sistema de Gestao" --platform=win32 --arch=x64 --icon=src/assets/icon.ico --overwrite
```

---

## Melhorias Futuras
- [ ] Migração do motor de persistência para SQLite relacional local.
- [ ] Emissão de relatórios gerenciais e comprovantes em formato PDF.
- [ ] Implementação de testes automatizados de fluxo com Playwright ou Spectron.
