# 🏗️ Civil Connection

> **"Conectando ideias, construindo o futuro"**  
> *Plataforma web integrada para conectar profissionais, obras e clientes no setor da construção civil.*  
> **Projeto Acadêmico - Etec**

---

## 📌 Sumário

1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Estrutura do Projeto (Organização Padrão)](#-estrutura-do-projeto-organização-padrão)
3. [Tecnologias Utilizadas](#-tecnologias-utilizadas)
4. [Como Executar o Projeto](#-como-executar-o-projeto)
   - [1. Backend (Spring Boot + Java 17)](#1-executando-o-backend)
   - [2. Frontend (Web)](#2-executando-o-frontend)
   - [3. Banco de Dados (Supabase PostgreSQL)](#3-configurando-o-supabase)
5. [Funcionalidades e Telas (Spec Etec)](#-funcionalidades-e-telas-spec-etec)
6. [Endpoints da API REST](#-endpoints-da-api-rest)
7. [Documentação Adicional](#-documentação-adicional)

---

## 📖 Sobre o Projeto

O **Civil Connection** foi desenvolvido com o propósito de facilitar e profissionalizar a contratação e acompanhamento de obras no ecossistema da construção civil. A plataforma centraliza:
- **Clientes e Incorporadores**: Podem publicar novos projetos e acompanhar o diário de obras em tempo real.
- **Engenheiros e Arquitetos**: Vitrine profissional com credenciamento (CREA/CAU), especialidades e contato direto.
- **Empreiteiras e Mestres de Obras**: Gestão de etapas construtivas com rastreabilidade, prazos e métricas.

---

## 📁 Estrutura do Projeto (Organização Padrão)

O repositório foi organizado no modelo corporativo padrão desacoplado, separando responsabilidades de forma clara e intuitiva:

```text
CivilConection/
├── backend/                       # API REST em Java 17 com Spring Boot 3
│   ├── src/main/java/             # Código-fonte Java (Controller, Service, Repository, Model, DTO)
│   ├── src/main/resources/        # Configurações de banco (application.properties) e estáticos
│   ├── src/test/java/             # Testes automatizados (JUnit 5)
│   ├── build.gradle               # Build Gradle compatível com Java 17
│   ├── gradlew & gradlew.bat      # Wrappers do Gradle
│   └── README.md                  # Documentação específica do backend
│
├── index.html                     # Site estático publicado (deploy Vercel a partir da raiz)
│   profissionais.html             #   As páginas da raiz são as versões de produção;
│   obras.html                     #   carregam css/tailwind.css (build do Tailwind CLI),
│   diario.html                    #   js/config.js (URL da API) e js/app.js (integração REST)
│   cadastro.html
│   ├── assets/images/             # Logotipo e imagens do site público
│   ├── css/                       # tailwind.css (gerado) + styles.css (customizações)
│   └── js/                        # config.js (API/Supabase) + app.js (integração REST)
│
├── frontend/                      # Cópia fonte da interface para desenvolvimento isolado
│   ├── assets/images/             # Imagens e Logotipo oficial
│   ├── css/styles.css             # Estilos utilitários e animações
│   ├── js/app.js                  # Integração REST e controle de tela
│   ├── index.html                 # Página Inicial / Portal com métricas e busca
│   ├── profissionais.html         # Vitrine e busca de profissionais credenciados
│   ├── obras.html                 # Painel de acompanhamento de obras e projetos
│   ├── diario.html                # Gestão de diário de obras e vistorias
│   ├── cadastro.html              # Autenticação e Registro (Cliente / Profissional)
│   └── README.md                  # Instruções de desenvolvimento web
│
├── tools/tailwind/                # Build de produção do Tailwind CSS (npm run build)
│
├── database/                      # Banco de Dados & Scripts Supabase
│   ├── schema.sql                 # DDL de criação das tabelas (PostgreSQL / Supabase)
│   ├── seed.sql                   # Carga de dados realistas para demonstração
│   ├── rls-policies.sql           # Políticas de Row Level Security (RLS)
│   └── README.md                  # Guia passo a passo de integração com Supabase
│
├── docs/                          # Documentação e Especificações Técnicas
│   ├── spec.md                    # Especificação acadêmica original do projeto (Etec)
│   ├── architecture.md            # Arquitetura, fluxo de dados e diagramas (Mermaid)
│   └── api.md                     # Documentação completa de todos os endpoints REST
│
├── design/                        # Identidade Visual e Protótipos
│   ├── tokens/DESIGN.md           # Tokens de Design System (cores, fontes Sora/Inter)
│   ├── branding/logo.png          # Logotipo original da marca
│   ├── mockups/                   # Telas de prototipação organizadas por tela
│   └── README.md                  # Especificação de design e assets
│
├── .env.example                   # Modelo de variáveis de ambiente para Supabase
├── .gitignore                     # Ignora arquivos temporários, compilação e caches
├── .vercelignore                  # Limita o deploy Vercel aos arquivos do site
└── README.md                      # Documentação central do ecossistema
```

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologias |
|---|---|
| **Backend** | Java 17, Spring Boot 3.2.5, Spring Data JPA, Hibernate, Bean Validation, BCrypt |
| **Banco de Dados** | Supabase (PostgreSQL Cloud), Fallback automático para H2 Database |
| **Frontend** | HTML5 Semântico, Tailwind CSS, Vanilla JavaScript (ES6+), Google Material Symbols |
| **Design & UI** | Design Tokens `Construct Modern`, Fontes Sora & Inter |

---

## 🚀 Como Executar o Projeto

### 1. Executando o Backend

O backend pode ser executado imediatamente. Se não houver banco Supabase configurado, ele iniciará automaticamente com banco **H2 em memória** populado com dados iniciais:

```bash
# 1. Navegue até a pasta backend
cd backend

# 2. No Windows:
.\gradlew.bat bootRun

# No Linux/macOS:
./gradlew bootRun
```

O backend estará ativo em: `http://localhost:8080`  
Console H2 (desenvolvimento): `http://localhost:8080/h2-console`

---

### 2. Executando o Frontend

Você pode acessar a interface de duas formas:

- **Opção A (Integrada no Spring Boot - Mais Rápida)**:  
  Com o backend rodando, abra no navegador:  
  👉 **`http://localhost:8080/index.html`** ou **`http://localhost:8080/`**

- **Opção B (Standalone com Live Server / VS Code)**:  
  Abra a pasta `frontend/` no VS Code e inicie com a extensão **Live Server** no arquivo `index.html`.

> 💡 **Integração Frontend ↔ API**: a URL base da API é definida em
> [`js/config.js`](js/config.js) (`API_CONFIG.baseUrl`):
>
> | Cenário | Valor de `baseUrl` |
> |---|---|
> | Páginas servidas pelo próprio backend (`http://localhost:8080`) | `''` (padrão, mesma origem) |
> | HTML aberto direto no navegador (`file://`) ou servidor estático separado | automático: `http://localhost:8080` |
> | Backend publicado (Render, Railway, VPS...) | `'https://seu-backend.example.com'` |
>
> Quando a API não está acessível (ex.: site estático publicado na Vercel sem o
> backend), as páginas **mantêm o conteúdo de demonstração** já embutido no HTML
> e registram apenas um aviso informativo no console — sem erros.

---

### 3. Build de Produção do Tailwind CSS

As páginas **não utilizam mais o CDN** `cdn.tailwindcss.com` (que é destinado
apenas a desenvolvimento). O stylesheet de produção é gerado pelo **Tailwind CLI**
e versionado em `css/tailwind.css` (já compilado e minificado).

Para regenerar o CSS após alterar classes ou tokens de design:

```bash
cd tools/tailwind
npm install
npm run build      # gera css/tailwind.css e sincroniza com frontend/ e backend/
npm run watch      # modo desenvolvimento com recompilação automática
```

- A configuração do tema (tokens "Construct Modern") vive em
  [`tools/tailwind/tailwind.config.js`](tools/tailwind/tailwind.config.js) — o
  mesmo tema que antes era embutido via `<script>` em cada página.
- Os tokens de design também estão documentados em
  [`design/tokens/DESIGN.md`](design/tokens/DESIGN.md).

---

### 4. Publicação na Vercel

O site público é um **deploy estático da raiz do repositório** (as páginas
`*.html` + pastas `css/`, `js/` e `assets/`). O arquivo
[`.vercelignore`](.vercelignore) exclui do deploy tudo que não é web
(`backend/`, `src/`, `tools/`, `design/`, `docs/`, `.env`, ...), mantendo
arquivos internos fora do endereço público.

Como não há etapa de build na Vercel (o CSS já vem compilado), nenhuma
configuração adicional é necessária — basta o push para a branch de produção.

---

### 5. Configurando o Supabase

Para conectar o projeto ao banco de dados em nuvem do **Supabase**:

1. Crie um projeto no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** do Supabase e execute os scripts na ordem:
   - [`database/schema.sql`](database/schema.sql)
   - [`database/seed.sql`](database/seed.sql)
   - [`database/rls-policies.sql`](database/rls-policies.sql)
3. Copie o arquivo [`.env.example`](.env.example) para `.env` e configure sua URL de conexão:
   ```properties
   SPRING_DATASOURCE_URL=jdbc:postgresql://<SEU-HOST-SUPABASE>:5432/postgres?sslmode=require
   SPRING_DATASOURCE_USERNAME=postgres.<SEU-PROJECT-REF>
   SPRING_DATASOURCE_PASSWORD=<SUA-SENHA-SUPABASE>
   ```
4. Para mais detalhes, consulte o [Guia do Banco de Dados](database/README.md).

---

## 📱 Funcionalidades e Telas (Spec Etec)

1. **Página Inicial (`index.html`)**:
   - Menu de navegação responsivo institucional.
   - Hero section com chamada de ação e busca dinâmica de obras/profissionais.
   - Barra de métricas em tempo real (obras concluídas, profissionais, satisfação).
   - Apresentação de soluções e serviços do setor.
2. **Vitrine de Profissionais (`profissionais.html`)**:
   - Listagem interativa de especialistas com filtros por área de atuação e localização.
   - Avaliações por estrelas, selo CREA/CAU e contato direto.
3. **Obras & Projetos (`obras.html`)**:
   - Catálogo de projetos residenciais, comerciais e de infraestrutura.
   - Barra de progresso visual de conclusão da obra.
4. **Diário de Obras (`diario.html`)**:
   - Acompanhamento das etapas construtivas (Fundações, Alvenaria, Instalações, Acabamentos).
   - Status de cada etapa (Pendente, Em Andamento, Concluído).
5. **Autenticação e Cadastro (`cadastro.html`)**:
   - Alternância entre Novo Cadastro e Login existente.
   - Perfis de acesso para Clientes e Profissionais com criptografia de senha via BCrypt.

---

## 📡 Endpoints da API REST

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/stats` | Estatísticas gerais do ecossistema |
| `GET` | `/api/profissionais` | Listagem e busca de profissionais |
| `POST` | `/api/profissionais` | Cadastro de perfil profissional |
| `GET` | `/api/obras` | Listagem e filtro de obras por categoria |
| `POST` | `/api/obras` | Cadastro de nova obra |
| `GET` | `/api/etapas/obra/{obraId}` | Lista etapas de uma obra específica |
| `PUT` | `/api/etapas/{id}/status` | Atualiza status e progresso de uma etapa |
| `POST` | `/api/usuarios` | Cadastro de novo usuário |

Consulte a [Documentação Completa da API](docs/api.md) para detalhes de payload e respostas.

---

## 📚 Documentação Adicional

- [📄 Especificação Original (Spec Etec)](docs/spec.md)
- [🏛️ Arquitetura e Diagramas do Sistema](docs/architecture.md)
- [📡 Especificação Técnica da API REST](docs/api.md)
- [🗄️ Guia do Banco de Dados & Supabase](database/README.md)
- [🎨 Guia do Design System & Identidade Visual](design/README.md)
- [💻 Guia do Frontend Web](frontend/README.md)
- [☕ Guia do Backend Spring Boot](backend/README.md)
