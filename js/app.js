// Civil Conection - Full Stack API Integration Script
//
// A API REST (Spring Boot) é consultada em API_CONFIG.baseUrl (js/config.js).
// Quando ela não está acessível (ex.: site estático publicado na Vercel sem o
// backend), as páginas mantêm o conteúdo protótipo já embutido no HTML e um
// único aviso informativo é registrado no console — sem erros vermelhos.

document.addEventListener('DOMContentLoaded', () => {
    initPageNavigation();

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'index.html' || currentPage === '' || currentPage === '/') {
        initHomePage();
    } else if (currentPage === 'profissionais.html') {
        initProfissionaisPage();
    } else if (currentPage === 'obras.html') {
        initObrasPage();
    } else if (currentPage === 'diario.html') {
        initDiarioPage();
    } else if (currentPage === 'cadastro.html') {
        initCadastroPage();
    }
});

// ==========================================
// API CONNECTION
// ==========================================
// Error raised when the REST backend cannot be reached at all (static hosting
// without the API, network failure, CORS, etc). Callers use it to decide
// between a hard failure and gracefully keeping the prototype content.
class ApiUnavailableError extends Error {
    constructor(message = 'Backend REST não disponível neste endereço') {
        super(message);
        this.name = 'ApiUnavailableError';
    }
}

// Once the API is deemed unreachable, further requests are skipped only for a
// short cooldown instead of being blocked forever: a transient failure (backend
// restarting, brief network drop) then recovers on the next user action or
// after the window expires, without requiring a page reload.
const API_RETRY_COOLDOWN_MS = 30000;
let apiUnavailableUntil = 0;
let apiWarningShown = false;

function isApiUnavailable(error) {
    return !!error && error.name === 'ApiUnavailableError';
}

function markApiUnavailable() {
    apiUnavailableUntil = Date.now() + API_RETRY_COOLDOWN_MS;
    if (!apiWarningShown) {
        apiWarningShown = true;
        console.warn(
            '[Civil Connection] Backend REST não disponível — mantendo o conteúdo de demonstração da página. ' +
            'Para usar dados reais: execute o backend Spring Boot (cd backend && ./gradlew bootRun) e, se necessário, ' +
            'configure API_CONFIG.baseUrl em js/config.js.'
        );
    }
}

// Resolves the base URL of the REST API:
// 1. explicit override in js/config.js (API_CONFIG.baseUrl);
// 2. pages opened via file:// cannot use a relative "/api", so fall back to
//    the default local Spring Boot address (http://localhost:8080);
// 3. otherwise same origin (pages served by the backend itself).
function getApiBaseUrl() {
    const config = window.CIVIL_API_CONFIG || {};
    if (typeof config.baseUrl === 'string' && config.baseUrl.trim() !== '') {
        return config.baseUrl.trim().replace(/\/+$/, '');
    }
    if (window.location.protocol === 'file:') {
        return 'http://localhost:8080';
    }
    return '';
}

// Helper for API calls
async function apiFetch(endpoint, options = {}) {
    if (Date.now() < apiUnavailableUntil) {
        throw new ApiUnavailableError();
    }

    try {
        const response = await fetch(getApiBaseUrl() + endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        // A 404 with a non-JSON body means there is no API behind this origin
        // (e.g. the static Vercel deployment) — not a "resource not found".
        const contentType = response.headers.get('content-type') || '';
        if (response.status === 404 && !contentType.includes('json')) {
            markApiUnavailable();
            throw new ApiUnavailableError();
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Erro ao processar requisição' }));
            throw new Error(errorData.message || 'Erro na requisição');
        }

        if (response.status === 204) return null;
        return await response.json();
    } catch (error) {
        if (isApiUnavailable(error)) {
            throw error;
        }
        if (error instanceof TypeError) {
            // Network / DNS / CORS failure: the API is simply not reachable.
            markApiUnavailable();
            throw new ApiUnavailableError();
        }
        console.error('API Error:', error);
        throw error;
    }
}

function showToast(message, isSuccess = true) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 z-50 px-6 py-3 rounded-lg text-white shadow-xl flex items-center gap-3 transition-all transform translate-y-0 ${
        isSuccess ? 'bg-emerald-600' : 'bg-red-600'
    }`;
    toast.innerHTML = `
        <span class="material-symbols-outlined">${isSuccess ? 'check_circle' : 'error'}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Navigation fix across pages
function initPageNavigation() {
    const navLinks = document.querySelectorAll('a[data-path], nav a, header a');
    navLinks.forEach(link => {
        const text = link.innerText.trim().toLowerCase();
        const pathAttr = link.getAttribute('data-path');

        if (pathAttr === 'inicio' || text.includes('início') || text.includes('inicio')) {
            link.href = 'index.html';
        } else if (pathAttr === 'encontrar-profissionais' || text.includes('profissionais')) {
            link.href = 'profissionais.html';
        } else if (pathAttr === 'obras-e-projetos' || text.includes('obras')) {
            link.href = 'obras.html';
        } else if (pathAttr === 'diario-de-obras' || text.includes('diário') || text.includes('diario')) {
            link.href = 'diario.html';
        } else if (pathAttr === 'dashboard-visao-geral' || text.includes('dashboard') || text.includes('cadastro') || text.includes('entrar')) {
            link.href = 'cadastro.html';
        }
    });

    // Logo click
    const logoImg = document.querySelector('header img');
    if (logoImg && logoImg.closest('a')) {
        logoImg.closest('a').href = 'index.html';
    } else if (logoImg && logoImg.parentElement) {
        logoImg.parentElement.style.cursor = 'pointer';
        logoImg.parentElement.addEventListener('click', () => window.location.href = 'index.html');
    }
}

// ==========================================
// 1. HOMEPAGE (index.html)
// ==========================================
async function initHomePage() {
    try {
        const stats = await apiFetch('/api/stats');
        updateHomeStats(stats);
    } catch (err) {
        // API offline (static deployment): keep the default metrics already
        // present in the HTML markup — but do NOT return early, the hero
        // search below must keep working.
        if (!isApiUnavailable(err)) {
            console.warn('Usando estatísticas padrão:', err);
        }
    }

    // Hero search integration
    const searchBtn = document.querySelector('#service-search-input')?.closest('.grid')?.querySelector('button');
    const searchInput = document.getElementById('service-search-input');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `profissionais.html?termo=${encodeURIComponent(query)}`;
            }
        });
    }
}

function updateHomeStats(stats) {
    if (!stats) return;

    // Look for metric numbers in the DOM and update them
    const statElements = document.querySelectorAll('[data-stat]');
    statElements.forEach(el => {
        const type = el.getAttribute('data-stat');
        if (type === 'obrasConcluidas') el.innerText = stats.obrasConcluidas || '142';
        if (type === 'profissionaisCadastrados') el.innerText = stats.profissionaisCadastrados || '1.280';
        if (type === 'totalObras') el.innerText = stats.totalObras || '350+';
        if (type === 'satisfacaoMedia') el.innerText = (stats.satisfacaoMedia || '4.9') + ' / 5.0';
    });
}

// ==========================================
// 2. PROFISSIONAIS (profissionais.html)
// ==========================================
async function initProfissionaisPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialTerm = urlParams.get('termo') || '';

    const searchInput = document.querySelector('input[placeholder*="Buscar"]') || document.querySelector('input[type="text"]');
    if (searchInput && initialTerm) {
        searchInput.value = initialTerm;
    }

    // Load initial data
    await carregarProfissionais({ termo: initialTerm });

    // Attach search event
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            carregarProfissionais({ termo: searchInput.value.trim() });
        }, 400));
    }

    // Filter selects/buttons
    const filterSelects = document.querySelectorAll('select');
    filterSelects.forEach(select => {
        select.addEventListener('change', () => {
            const cidade = document.querySelector('select[name="cidade"]')?.value || '';
            const profissao = document.querySelector('select[name="profissao"]')?.value || '';
            carregarProfissionais({ termo: searchInput?.value || '', cidade, profissao });
        });
    });
}

async function carregarProfissionais(filtros = {}) {
    // Only replace the real list container — never a generic grid, which could
    // match the search form or KPI cards.
    const container = document.getElementById('lista-profissionais');
    if (!container) return;

    try {
        let queryParams = new URLSearchParams();
        if (filtros.termo) queryParams.append('termo', filtros.termo);
        if (filtros.profissao) queryParams.append('profissao', filtros.profissao);
        if (filtros.cidade) queryParams.append('cidade', filtros.cidade);

        const profissionais = await apiFetch(`/api/profissionais?${queryParams.toString()}`);
        renderProfissionais(profissionais, container);
    } catch (err) {
        if (isApiUnavailable(err)) {
            // Backend offline (ex.: hospedagem estática): keep the prototype
            // cards already rendered in the HTML.
            return;
        }
        showToast('Erro ao carregar profissionais', false);
    }
}

function renderProfissionais(profissionais, container) {
    if (!profissionais || profissionais.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
                <p class="font-title-md">Nenhum profissional encontrado com os filtros selecionados.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = profissionais.map(p => `
        <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                <div class="flex items-start justify-between gap-space-sm mb-space-sm">
                    <div class="flex items-center gap-space-sm">
                        <div class="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-title-md">
                            ${p.nome ? p.nome.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                            <h3 class="font-title-md text-primary leading-snug">${p.nome || 'Profissional'}</h3>
                            <span class="font-label-sm text-secondary-container font-semibold uppercase tracking-wider">${p.profissao || 'Especialista'}</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-label-sm font-bold text-on-surface">
                        <span class="material-symbols-outlined text-amber-500 text-[16px]">star</span>
                        <span>${p.avaliacao ? p.avaliacao.toFixed(1) : '5.0'}</span>
                    </div>
                </div>

                <div class="flex items-center gap-1 text-on-surface-variant font-label-sm mb-space-sm">
                    <span class="material-symbols-outlined text-[16px]">location_on</span>
                    <span>${p.cidade || 'São Paulo, SP'}</span>
                </div>

                <p class="font-body-sm text-on-surface-variant line-clamp-3 mb-space-md">
                    ${p.descricao || 'Profissional especializado em execução de obras residenciais e comerciais com garantia de qualidade e conformidade.'}
                </p>

                ${p.especialidades ? `
                    <div class="flex flex-wrap gap-1 mb-space-md">
                        ${p.especialidades.split(',').map(esp => `
                            <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm">${esp.trim()}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>

            <div class="pt-space-sm border-t border-surface-container flex items-center justify-between gap-2">
                <span class="font-label-sm text-on-surface-variant">${p.contato || p.email || 'Contato via portal'}</span>
                <button onclick="contatarProfissional('${p.nome}', '${p.contato || p.email}')" class="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-sm hover:bg-primary-container transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">chat</span>
                    <span>Contatar</span>
                </button>
            </div>
        </div>
    `).join('');
}

function contatarProfissional(nome, contato) {
    alert(`Entrar em contato com ${nome}:\nE-mail / Telefone: ${contato}`);
}

// ==========================================
// 3. OBRAS E PROJETOS (obras.html)
// ==========================================
async function initObrasPage() {
    await carregarObras();

    const searchInput = document.querySelector('input[placeholder*="Buscar"]');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            carregarObras({ termo: searchInput.value.trim() });
        }, 400));
    }
}

async function carregarObras(filtros = {}) {
    // Prefer explicit ids; #projectsGrid is the list rendered by obras.html.
    const container = document.getElementById('lista-obras') || document.getElementById('projectsGrid');
    if (!container) return;

    try {
        let queryParams = new URLSearchParams();
        if (filtros.termo) queryParams.append('termo', filtros.termo);
        if (filtros.categoria) queryParams.append('categoria', filtros.categoria);
        if (filtros.status) queryParams.append('status', filtros.status);

        const obras = await apiFetch(`/api/obras?${queryParams.toString()}`);
        renderObras(obras, container);
    } catch (err) {
        if (isApiUnavailable(err)) {
            // Backend offline (ex.: hospedagem estática): keep the prototype
            // project cards already rendered in the HTML.
            return;
        }
        showToast('Erro ao carregar obras', false);
    }
}

function renderObras(obras, container) {
    if (!obras || obras.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl mb-2 text-outline">construction</span>
                <p class="font-title-md">Nenhuma obra cadastrada até o momento.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = obras.map(o => `
        <div class="bg-surface-card rounded-xl p-space-md shadow-sm border border-surface-container-high flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                <div class="flex items-center justify-between mb-space-xs">
                    <span class="px-2.5 py-0.5 rounded-full text-label-sm font-semibold uppercase bg-secondary-container/15 text-secondary-container">
                        ${o.categoria || 'Residencial'}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-label-sm font-semibold uppercase ${
                        o.status === 'CONCLUIDA' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }">
                        ${o.status === 'CONCLUIDA' ? 'Concluída' : 'Em Andamento'}
                    </span>
                </div>

                <h3 class="font-headline-sm text-primary my-space-xs">${o.nome}</h3>
                <p class="font-body-sm text-on-surface-variant line-clamp-2 mb-space-sm">${o.descricao || 'Sem descrição informada.'}</p>

                <div class="flex items-center gap-1 text-on-surface-variant font-label-sm mb-space-md">
                    <span class="material-symbols-outlined text-[16px]">location_on</span>
                    <span>${o.cidade || 'São Paulo, SP'}</span>
                    <span class="mx-1">•</span>
                    <span>Cliente: ${o.clienteNome || 'Proprietário'}</span>
                </div>

                <!-- Progress Bar -->
                <div class="mb-space-md">
                    <div class="flex justify-between text-label-sm font-semibold mb-1">
                        <span>Progresso Geral</span>
                        <span>${o.progresso || 0}%</span>
                    </div>
                    <div class="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                        <div class="h-full bg-secondary-container rounded-full transition-all duration-500" style="width: ${o.progresso || 0}%"></div>
                    </div>
                </div>
            </div>

            <div class="pt-space-sm border-t border-surface-container flex items-center justify-between">
                <span class="font-label-sm text-on-surface-variant">${o.etapas ? o.etapas.length : 0} etapas registradas</span>
                <a href="diario.html?obraId=${o.id}" class="px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-sm hover:bg-primary-container transition-colors flex items-center gap-1">
                    <span>Acompanhar Diário</span>
                    <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </a>
            </div>
        </div>
    `).join('');
}

// ==========================================
// 4. DIÁRIO DE OBRAS (diario.html)
// ==========================================
async function initDiarioPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let obraId = urlParams.get('obraId');

    if (!obraId) {
        // Fetch first available obra
        try {
            const obras = await apiFetch('/api/obras');
            if (obras && obras.length > 0) {
                obraId = obras[0].id;
            }
        } catch (e) {
            if (isApiUnavailable(e)) {
                // Backend offline: keep the prototype diary content.
                return;
            }
            console.warn('Nenhuma obra carregada');
        }
    }

    if (obraId) {
        await carregarDetalhesObra(obraId);
    }
}

async function carregarDetalhesObra(obraId) {
    try {
        const obra = await apiFetch(`/api/obras/${obraId}`);
        renderDiarioHeader(obra);
        renderEtapasList(obra);
    } catch (err) {
        if (isApiUnavailable(err)) {
            // Backend offline: keep the prototype diary content.
            return;
        }
        showToast('Erro ao carregar diário da obra', false);
    }
}

function renderDiarioHeader(obra) {
    const titleEl = document.querySelector('h1') || document.querySelector('.font-headline-xl');
    if (titleEl) titleEl.innerText = obra.nome;

    const statusEl = document.querySelector('[data-obra-status]');
    if (statusEl) statusEl.innerText = obra.status;

    const progressEl = document.querySelector('[data-obra-progresso]');
    if (progressEl) progressEl.innerText = `${obra.progresso}%`;
}

function renderEtapasList(obra) {
    const container = document.getElementById('lista-etapas') || document.querySelector('.space-y-space-md');
    if (!container) return;

    if (!obra.etapas || obra.etapas.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center text-on-surface-variant bg-surface-card rounded-xl">
                <p>Nenhuma etapa cadastrada nesta obra.</p>
                <button onclick="adicionarEtapaModal(${obra.id})" class="mt-3 px-4 py-2 bg-primary text-white rounded-lg">Adicionar Primeira Etapa</button>
            </div>
        `;
        return;
    }

    container.innerHTML = obra.etapas.map(e => `
        <div class="bg-surface-card p-space-md rounded-xl border border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full ${e.status === 'CONCLUIDO' ? 'bg-emerald-500' : 'bg-secondary-container'} text-white flex items-center justify-center font-bold text-label-sm">
                    ${e.ordem || 1}
                </div>
                <div>
                    <h4 class="font-title-md text-primary">${e.nome}</h4>
                    <p class="font-body-sm text-on-surface-variant">${e.descricao || 'Sem observações adicionais.'}</p>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <div class="w-32">
                    <div class="flex justify-between text-label-sm mb-1 font-semibold">
                        <span>Progresso</span>
                        <span>${e.progresso}%</span>
                    </div>
                    <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500 rounded-full" style="width: ${e.progresso}%"></div>
                    </div>
                </div>

                <button onclick="atualizarEtapaPrompt(${e.id}, ${e.obraId}, ${e.progresso})" class="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high text-primary font-label-sm transition-colors flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                    <span>Atualizar</span>
                </button>
            </div>
        </div>
    `).join('');
}

async function atualizarEtapaPrompt(etapaId, obraId, progressoAtual) {
    const novoProgressoStr = prompt(`Informe o novo progresso da etapa (0 a 100):`, progressoAtual);
    if (novoProgressoStr === null) return;

    const novoProgresso = parseInt(novoProgressoStr, 10);
    if (isNaN(novoProgresso) || novoProgresso < 0 || novoProgresso > 100) {
        alert('Por favor, informe um número válido entre 0 e 100.');
        return;
    }

    try {
        const etapaAtual = await apiFetch(`/api/etapas/${etapaId}`);
        etapaAtual.progresso = novoProgresso;
        etapaAtual.status = novoProgresso >= 100 ? 'CONCLUIDO' : (novoProgresso > 0 ? 'EM_ANDAMENTO' : 'PENDENTE');

        await apiFetch(`/api/etapas/${etapaId}`, {
            method: 'PUT',
            body: JSON.stringify(etapaAtual)
        });

        showToast('Etapa atualizada com sucesso!');
        carregarDetalhesObra(obraId);
    } catch (err) {
        if (isApiUnavailable(err)) {
            showToast('Backend não disponível — não é possível atualizar etapas agora.', false);
            return;
        }
        showToast('Erro ao atualizar etapa', false);
    }
}

// ==========================================
// 5. CADASTRO / LOGIN (cadastro.html)
// ==========================================
function initCadastroPage() {
    window.switchAuthMode = function(mode) {
        const registerForm = document.getElementById('registerForm');
        const loginView = document.getElementById('loginView');
        const tabRegister = document.getElementById('tabRegister');
        const tabLogin = document.getElementById('tabLogin');

        if (mode === 'register') {
            if (registerForm) registerForm.style.display = 'block';
            if (loginView) loginView.style.display = 'none';
            if (tabRegister) {
                tabRegister.classList.add('bg-surface-white', 'text-primary', 'shadow-sm');
                tabRegister.classList.remove('text-on-surface-variant');
            }
            if (tabLogin) {
                tabLogin.classList.remove('bg-surface-white', 'text-primary', 'shadow-sm');
                tabLogin.classList.add('text-on-surface-variant');
            }
        } else {
            if (registerForm) registerForm.style.display = 'none';
            if (loginView) {
                loginView.style.display = 'flex';
                loginView.classList.remove('hidden');
            }
            if (tabLogin) {
                tabLogin.classList.add('bg-surface-white', 'text-primary', 'shadow-sm');
                tabLogin.classList.remove('text-on-surface-variant');
            }
            if (tabRegister) {
                tabRegister.classList.remove('bg-surface-white', 'text-primary', 'shadow-sm');
                tabRegister.classList.add('text-on-surface-variant');
            }
        }
    };

    window.handleRegisterSubmit = async function(event) {
        event.preventDefault();

        const form = event.target;
        const nomeInput = form.querySelector('input[name="full_name"]') || form.querySelector('input[placeholder*="Carlos"]');
        const emailInput = form.querySelector('input[name="email"]') || form.querySelector('input[type="email"]');
        const senhaInput = document.getElementById('regPassword') || form.querySelector('input[type="password"]');
        const profissaoSelect = form.querySelector('select');
        const cidadeInput = form.querySelector('input[placeholder*="São Paulo"]') || form.querySelector('input[placeholder*="Cidade"]');

        const tipoRadio = form.querySelector('input[name="user_type"]:checked');
        const tipo = tipoRadio ? (tipoRadio.value.includes('pro') ? 'PROFISSIONAL' : 'CLIENTE') : 'CLIENTE';

        const payload = {
            nome: nomeInput ? nomeInput.value.trim() : 'Novo Usuário',
            email: emailInput ? emailInput.value.trim() : 'usuario@exemplo.com',
            senha: senhaInput ? senhaInput.value : 'Senha@123',
            tipo: tipo
        };

        try {
            const usuarioCriado = await apiFetch('/api/usuarios', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (tipo === 'PROFISSIONAL' || (profissaoSelect && profissaoSelect.value)) {
                await apiFetch('/api/profissionais', {
                    method: 'POST',
                    body: JSON.stringify({
                        usuarioId: usuarioCriado.id,
                        profissao: profissaoSelect ? profissaoSelect.value : 'Engenheiro Civil',
                        cidade: cidadeInput ? cidadeInput.value : 'São Paulo',
                        descricao: 'Profissional registrado na plataforma Civil Conection',
                        avaliacao: 5.0,
                        contato: payload.email
                    })
                });
            }

            showToast('Cadastro realizado com sucesso!');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (err) {
            if (isApiUnavailable(err)) {
                showToast('Backend não disponível — execute o Spring Boot para cadastrar (veja js/config.js).', false);
                return;
            }
            showToast(err.message || 'Erro ao realizar cadastro', false);
        }
    };

    window.handleLoginSubmit = async function(event) {
        event.preventDefault();
        showToast('Acesso realizado com sucesso!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    };
}

// Helper debounce function for live search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
