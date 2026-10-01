# 💻 Frontend - Civil Connection

Interface web moderna, responsiva e performática construída para o ecossistema da construção civil.

---

## 📁 Estrutura de Arquivos

```
frontend/
├── assets/
│   └── images/
│       └── logo.png         # Logotipo oficial em alta resolução
├── css/
│   └── styles.css           # Estilos complementares e transições
├── js/
│   └── app.js               # Integração REST API, controle de telas e interatividade
├── index.html               # Página Inicial / Portal com métricas e busca
├── profissionais.html       # Vitrine e busca de profissionais credenciados
├── obras.html               # Acompanhamento de Obras & Projetos
├── diario.html              # Gestão de Diário de Obras e Vistorias
├── cadastro.html            # Cadastro de Usuários / Login (Clientes e Profissionais)
└── README.md                # Guia técnico do frontend
```

---

## 🚀 Como Executar o Frontend

Você tem duas formas práticas de rodar o frontend:

### Modo 1: Integrado com o Backend Spring Boot (Recomendado)
O backend Spring Boot já serve todos os arquivos estáticos diretamente na porta 8080:
1. Inicie o backend:
   ```bash
   cd backend
   ./gradlew bootRun
   ```
2. Acesse no navegador:
   `http://localhost:8080/index.html` ou `http://localhost:8080/`

### Modo 2: Standalone com Servidor Estático / Live Server
1. Se preferir rodar apenas o frontend no VS Code, utilize a extensão **Live Server** clicando com o botão direito em `index.html` > **Open with Live Server**.
2. Ou use qualquer servidor estático local:
   ```bash
   # Com npx serve:
   npx serve frontend
   # Ou com Python:
   python -m http.server 3000 --directory frontend
   ```
3. Acesse `http://localhost:3000` (certifique-se de que o backend esteja rodando na porta 8080 para que as requisições à API `/api/*` funcionem).

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Semântico**: Estruturação acessível e SEO-friendly (`<title>`, meta description, OG tags, favicon e skip-link em todas as páginas).
- **Tailwind CSS (via CDN)**: Design System com paleta corporativa `Construct Modern`.
- **Vanilla JavaScript Moderno (ES6+)**: Comunicação assíncrona (`fetch`, `async/await`), manipulação do DOM e componentes dinâmicos.
- **Material Symbols & Google Fonts**: Tipografia com `Sora` (títulos) e `Archivo` (texto), com números tabulares para dados.
- **Imagens locais otimizadas** em `assets/images/` (fotos de canteiro geradas + tiles técnicos blueprint), sem dependência de URLs externas.
