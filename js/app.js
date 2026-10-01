// ============================================================
// CIVIL CONNECTION — Integração REST, navegação e interatividade
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeaderSearch();
    initScrollReveal();

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'index.html' || currentPage === '') {
        initHomePage();
    } else if (currentPage === 'profissionais.html') {
        initProfissionaisPage();
    } else if (currentPage === 'obras.html') {
        initObrasPage();
    } else if (currentPage === 'diario.html') {
        initDiarioPage();
    }
    // cadastro.html é autossuficiente (scripts inline na própria página).
});

// ============================================================
// Utilitários
// ============================================================

// Resolve o endpoint conforme a configuração disponível:
// - window.CIVIL_API_CONFIG.baseUrl quando configurado (js/config.js);
// - http://localhost:8080 para páginas abertas via file:// (URL relativa não funciona);
// - URL relativa (mesma origem) nos demais casos.
function resolveApiUrl(endpoint) {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(endpoint)) return endpoint;

    const configured = (window.CIVIL_API_CONFIG && window.CIVIL_API_CONFIG.baseUrl) || '';
    const base = configured
        ? configured
        : (window.location.protocol === 'file:' ? 'http://localhost:8080' : '');

    if (!base) return endpoint;
    return `${base.replace(/\/+$/, '')}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
}

// Escapa valores vindos da API antes de interpolá-los em HTML.
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
    if (value == null) return '';
    return String(value).replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);
}

// Detecta falhas de rede/ausência de backend para evitar logs ruidosos no console
// enquanto o site opera em modo de demonstração (offline/fallback).
function isOfflineFetchError(error) {
    if (!error) return false;
    if (error.name === 'TypeError') return true; // Failed to fetch
    const msg = (error.message || '').toLowerCase();
    return msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load failed');
}

async function apiFetch(endpoint, options = {}) {
    try {
        const response = await fetch(resolveApiUrl(endpoint), {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            // Resposta HTTP recebida mas com erro (ex.: 4xx/5xx) — loga apenas
            // quando o backend realmente respondeu.
            const errorData = await response.json().catch(() => ({ message: 'Erro ao processar requisição' }));
            const err = new Error(errorData.message || 'Erro na requisição');
            err.status = response.status;
            console.warn(`API ${response.status} em ${endpoint}:`, err.message);
            throw err;
        }

        if (response.status === 204) return null;
        return await response.json();
    } catch (error) {
        // Falha de conexão (sem backend) — usa fallback silenciosamente.
        if (isOfflineFetchError(error) && !error.status) {
            const err = new Error('Backend indisponível — usando dados de demonstração.');
            err.code = 'NETWORK_OFFLINE';
            throw err;
        }
        throw error;
    }
}

let toastTimer = null;

function showToast(message, isSuccess = true) {
    document.querySelectorAll('.app-toast').forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.className = `app-toast fixed bottom-5 right-5 z-[80] max-w-sm px-5 py-3 rounded-xl shadow-[0_12px_32px_-8px_rgba(2,14,38,0.4)] flex items-center gap-3 transition-all duration-300 translate-y-4 opacity-0 ${
        isSuccess ? 'bg-primary text-on-primary' : 'bg-error text-on-error'
    }`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-[20px] ${isSuccess ? 'text-status-success' : 'text-error-container'}" aria-hidden="true">${isSuccess ? 'check_circle' : 'error'}</span>
        <span class="font-label-md text-label-md">${escapeHtml(message)}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
    });

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

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

// ============================================================
// Navegação global
// ============================================================

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    const icon = btn.querySelector('.material-symbols-outlined');

    const close = () => {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Abrir menu de navegação');
        if (icon) icon.textContent = 'menu';
    };

    btn.addEventListener('click', () => {
        const isOpen = !menu.classList.contains('hidden');
        if (isOpen) {
            close();
        } else {
            menu.classList.remove('hidden');
            btn.setAttribute('aria-expanded', 'true');
            btn.setAttribute('aria-label', 'Fechar menu de navegação');
            if (icon) icon.textContent = 'close';
        }
    });

    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
}

function initHeaderSearch() {
    const input = document.getElementById('header-search');
    if (!input) return;

    const go = () => {
        const query = input.value.trim();
        window.location.href = query
            ? `profissionais.html?termo=${encodeURIComponent(query)}`
            : 'profissionais.html';
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            go();
        }
    });
}

// ============================================================
// Animações de entrada (respeita prefers-reduced-motion)
// ============================================================

function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('revealed'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

// ============================================================
// 1. HOMEPAGE (index.html)
// ============================================================

async function initHomePage() {
    // Console de busca do herói — vinculado antes da busca de estatísticas,
    // para que a busca funcione mesmo se /api/stats falhar, demorar ou travar.
    const form = document.getElementById('hero-search-form');
    const input = document.getElementById('service-search-input');
    if (form && input) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = input.value.trim();
            window.location.href = query
                ? `profissionais.html?termo=${encodeURIComponent(query)}`
                : 'profissionais.html';
        });
    }

    try {
        const stats = await apiFetch('/api/stats');
        updateHomeStats(stats);
    } catch (err) {
        console.warn('Usando estatísticas padrão:', err.message);
    }
}

function updateHomeStats(stats) {
    if (!stats) return;

    const fmt = new Intl.NumberFormat('pt-BR');
    document.querySelectorAll('[data-stat]').forEach(el => {
        const type = el.getAttribute('data-stat');
        if (type === 'obrasConcluidas' && stats.obrasConcluidas != null) el.innerText = fmt.format(stats.obrasConcluidas);
        if (type === 'profissionaisCadastrados' && stats.profissionaisCadastrados != null) el.innerText = fmt.format(stats.profissionaisCadastrados);
        if (type === 'totalObras' && stats.totalObras != null) el.innerText = fmt.format(stats.totalObras);
        if (type === 'satisfacaoMedia' && stats.satisfacaoMedia != null) {
            el.innerText = `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(stats.satisfacaoMedia)}%`;
        }
    });
}

// ============================================================
// 2. PROFISSIONAIS (profissionais.html)
// ============================================================

let apiFailureToastShown = false;

async function initProfissionaisPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialTerm = urlParams.get('termo') || '';

    const searchInput = document.getElementById('filter-search-term');
    if (searchInput && initialTerm) {
        searchInput.value = initialTerm;
    }

    // Busca ao vivo contra a API (com filtro local imediato na falha)
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            if (typeof window.applyLocalProfFilters === 'function') {
                window.applyLocalProfFilters();
            }
            carregarProfissionais({ termo: searchInput.value.trim() });
        }, 450));
    }

    await carregarProfissionais({ termo: initialTerm });
}

// Guarda da última requisição: respostas atrasadas de buscas antigas
// não podem sobrescrever o resultado da busca mais recente.
let profissionaisRequestId = 0;

async function carregarProfissionais(filtros = {}) {
    const container = document.getElementById('lista-profissionais');
    if (!container) return;

    const requestId = ++profissionaisRequestId;

    try {
        const queryParams = new URLSearchParams();
        if (filtros.termo) queryParams.append('termo', filtros.termo);

        const profissionais = await apiFetch(`/api/profissionais?${queryParams.toString()}`);
        if (requestId !== profissionaisRequestId) return;
        renderProfissionais(profissionais, container);
    } catch (err) {
        if (requestId !== profissionaisRequestId) return;
        if (!apiFailureToastShown) {
            apiFailureToastShown = true;
            showToast('API indisponível — exibindo vitrine de demonstração.', false);
        }
    }
}

function renderProfissionais(profissionais, container) {
    if (!profissionais || profissionais.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-12 text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-[40px] mb-2 text-outline" aria-hidden="true">search_off</span>
                <p class="font-title-md text-title-md">Nenhum profissional encontrado com os filtros selecionados.</p>
            </div>`;
        return;
    }

    container.innerHTML = profissionais.map(p => {
        const nomeBase = p.nome || 'P';
        const iniciais = escapeHtml(
            nomeBase
                .split(' ')
                .filter(w => w.length > 2)
                .slice(0, 2)
                .map(w => w.charAt(0).toUpperCase())
                .join('') || nomeBase.charAt(0).toUpperCase()
        );
        const nota = typeof p.avaliacao === 'number' ? p.avaliacao.toFixed(2) : '5.00';
        const especialidades = typeof p.especialidades === 'string'
            ? p.especialidades.split(',').slice(0, 4).map(esp =>
                `<span class="px-space-sm py-1 bg-surface-container text-on-surface font-label-sm text-label-sm rounded-md">${escapeHtml(esp.trim())}</span>`).join('')
            : '';
        const nomeContato = p.nome || 'Profissional';
        const contato = p.contato || p.email || '';

        return `
        <article class="prof-card bg-surface-card rounded-xl shadow-[0_2px_12px_-4px_rgba(2,14,38,0.08)] hover:shadow-[0_12px_32px_-8px_rgba(2,14,38,0.18)] transition-all overflow-hidden flex flex-col p-space-lg gap-space-md" data-type="autonomous" data-rating="${nota}">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md">
                <div class="flex items-center gap-space-md min-w-0">
                    <div class="relative shrink-0">
                        <div class="w-16 h-16 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md">${iniciais}</div>
                        <span class="absolute -bottom-1 -right-1 bg-status-success text-on-primary w-5 h-5 rounded-full flex items-center justify-center shadow" title="Profissional verificado">
                            <span class="material-symbols-outlined text-[13px]" aria-hidden="true">verified</span>
                        </span>
                    </div>
                    <div class="min-w-0">
                        <h3 class="font-headline-sm text-headline-sm text-primary">${escapeHtml(p.nome || 'Profissional')}</h3>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">${escapeHtml(p.profissao || 'Especialista')}</p>
                        <div class="flex items-center gap-space-xs mt-1 text-on-surface-variant" style="font-variant-numeric: tabular-nums;">
                            <span class="material-symbols-outlined text-status-warning text-[18px]" aria-hidden="true" style="font-variation-settings: 'FILL' 1;">star</span>
                            <span class="font-title-md text-title-md text-primary font-bold">${nota}</span>
                        </div>
                    </div>
                </div>
            </div>
            ${p.descricao ? `<p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 max-w-prose">${escapeHtml(p.descricao)}</p>` : ''}
            ${especialidades ? `<div class="flex flex-wrap items-center gap-space-xs">${especialidades}</div>` : ''}
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-canvas p-space-md rounded-lg">
                <div class="flex items-center gap-space-md font-body-sm text-body-sm text-on-surface-variant">
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[18px] text-secondary" aria-hidden="true">near_me</span>
                        ${escapeHtml(p.cidade || 'São Paulo, SP')}
                    </span>
                </div>
                <div class="flex items-center gap-space-sm self-end sm:self-auto">
                    <button class="px-space-md py-2 bg-surface-card hover:bg-surface-variant active:scale-[0.98] text-primary font-label-md text-label-md rounded-lg transition-all shadow-sm" data-action="contatar-profissional" data-nome="${escapeHtml(nomeContato)}" data-contato="${escapeHtml(contato)}" type="button">Ver perfil</button>
                    <button class="px-space-lg py-2 bg-secondary-container hover:bg-accent-hover active:scale-[0.98] text-on-secondary font-label-md text-label-md rounded-lg flex items-center gap-1 shadow-sm transition-all" data-action="contatar-profissional" data-nome="${escapeHtml(nomeContato)}" data-contato="${escapeHtml(contato)}" type="button">
                        <span class="material-symbols-outlined text-[18px]" aria-hidden="true">send</span>
                        <span>Solicitar proposta</span>
                    </button>
                </div>
            </div>
        </article>`;
    }).join('');

    bindProfissionaisActions(container);

    if (typeof window.applyLocalProfFilters === 'function') {
        window.applyLocalProfFilters();
    }
}

// Listener delegado (registrado uma única vez por container) no lugar de onclick inline.
function bindProfissionaisActions(container) {
    if (container.dataset.actionsBound === 'true') return;
    container.dataset.actionsBound = 'true';

    container.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-action="contatar-profissional"]');
        if (!btn || !container.contains(btn)) return;
        contatarProfissional(btn.dataset.nome || 'Profissional', btn.dataset.contato || '');
    });
}

function contatarProfissional(nome, contato) {
    showToast(contato
        ? `Solicitação enviada para ${nome}. Contato: ${contato}`
        : `Solicitação enviada para ${nome}. O contato acontece pelo portal.`);
}

// ============================================================
// 3. OBRAS E PROJETOS (obras.html)
// ============================================================

async function initObrasPage() {
    await carregarObras();
}

async function carregarObras() {
    const container = document.getElementById('projectsGrid');
    if (!container) return;

    try {
        const obras = await apiFetch('/api/obras');
        if (obras && obras.length > 0) {
            renderObras(obras, container);
        }
    } catch (err) {
        // API indisponível: mantém os cartões de demonstração estáticos.
        console.warn('Obras da API indisponíveis:', err.message);
    }
}

const OBRA_IMAGES = [
    'assets/images/obra-residencial.jpg',
    'assets/images/obra-comercial.jpg',
    'assets/images/obra-galpao.jpg',
    'assets/images/obra-infraestrutura.jpg',
    'assets/images/obra-restauro.jpg',
    'assets/images/obra-paisagismo.jpg',
];

function renderObras(obras, container) {
    const fmt = new Intl.NumberFormat('pt-BR');

    container.innerHTML = obras.map((o, i) => {
        const progresso = Number(o.progresso) || 0;
        const concluida = o.status === 'CONCLUIDA';
        const categoria = escapeHtml(o.categoria || 'Residencial');
        const img = OBRA_IMAGES[i % OBRA_IMAGES.length];
        const orcamento = Number(o.orcamentoEstimado) || progresso * 1000;
        const nome = escapeHtml(o.nome || 'Obra sem nome');
        const codigo = escapeHtml(o.id);
        const idUrl = encodeURIComponent(o.id == null ? '' : o.id);

        return `
        <article class="project-card bg-surface-card rounded-xl overflow-hidden shadow-[0_2px_12px_-4px_rgba(2,14,38,0.08)] hover:shadow-[0_12px_32px_-8px_rgba(2,14,38,0.18)] flex flex-col justify-between transition-all duration-200 group"
                 data-budget="${orcamento}" data-category="${categoria}" data-modality="empreiteiras" data-urgency="Normal">
            <div class="flex flex-col">
                <div class="relative w-full h-48 overflow-hidden bg-surface-container">
                    <img alt="Foto ilustrativa da obra ${nome}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" src="${img}" />
                    <div class="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                    <div class="absolute top-space-sm left-space-sm flex items-center gap-space-xs">
                        <span class="${concluida ? 'bg-status-success' : 'bg-status-info/90'} text-on-primary px-space-sm py-space-xs rounded font-label-sm text-label-sm font-semibold">${concluida ? 'Concluída' : 'Em andamento'}</span>
                    </div>
                    <div class="absolute bottom-space-sm left-space-sm right-space-sm text-on-primary flex items-center justify-between">
                        <span class="font-label-sm text-label-sm bg-primary/60 backdrop-blur-sm px-2 py-0.5 rounded">${categoria}</span>
                        <span class="font-label-sm text-label-sm opacity-90" style="font-variant-numeric: tabular-nums;">Cód: CC-${codigo}</span>
                    </div>
                </div>
                <div class="p-space-lg flex flex-col gap-space-md">
                    <div class="flex flex-col gap-space-xs">
                        <div class="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                            <span class="material-symbols-outlined text-[16px] text-secondary" aria-hidden="true">location_on</span>
                            <span>${escapeHtml(o.cidade || 'São Paulo, SP')}</span>
                        </div>
                        <h2 class="font-headline-sm text-headline-sm text-primary line-clamp-1 group-hover:text-secondary transition-colors">${nome}</h2>
                        <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">${escapeHtml(o.descricao || 'Sem descrição informada.')}</p>
                    </div>
                    <div class="flex flex-col gap-1">
                        <div class="flex justify-between font-label-sm text-label-sm font-semibold">
                            <span>Progresso geral</span>
                            <span style="font-variant-numeric: tabular-nums;">${progresso}%</span>
                        </div>
                        <div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                            <div class="${concluida ? 'bg-status-success' : 'bg-secondary-container'} h-full rounded-full transition-all duration-500" style="width: ${progresso}%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-space-lg pt-0">
                <a class="btn-open-modal w-full bg-secondary-container hover:bg-accent-hover active:scale-[0.98] text-on-secondary font-label-md text-label-md py-space-sm rounded-lg transition-all flex items-center justify-center gap-space-xs shadow-sm"
                   data-budget="Consulte o edital" data-code="CC-${codigo}" data-title="${nome}" href="diario.html?obraId=${idUrl}">
                    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">arrow_forward</span>
                    <span>Acompanhar diário</span>
                </a>
            </div>
        </article>`;
    }).join('');

    // Reexecuta filtros e bindings da página após a substituição do conteúdo.
    if (typeof window.afterObrasRender === 'function') {
        window.afterObrasRender();
    }
}

// ============================================================
// 4. DIÁRIO DE OBRAS (diario.html)
// ============================================================

async function initDiarioPage() {
    const urlParams = new URLSearchParams(window.location.search);
    let obraId = urlParams.get('obraId');

    if (!obraId) {
        try {
            const obras = await apiFetch('/api/obras');
            if (obras && obras.length > 0) {
                obraId = obras[0].id;
            }
        } catch (e) {
            console.warn('Nenhuma obra carregada da API — mantendo obra de demonstração.');
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
    } catch (err) {
        console.warn('Diário da obra indisponível — mantendo dados de demonstração.');
    }
}

function renderDiarioHeader(obra) {
    if (!obra) return;

    const titleEl = document.querySelector('main h1');
    if (titleEl && obra.nome) {
        // Preserva o sufixo "(Reforma & Ampliação)" quando existir no nome original.
        titleEl.childNodes[0].textContent = obra.nome + ' ';
    }

    const statusEl = document.querySelector('[data-obra-status]');
    if (statusEl && obra.status) {
        const statusMap = {
            'EM_ANDAMENTO': 'Em andamento',
            'CONCLUIDA': 'Concluída',
            'PLANEJAMENTO': 'Em planejamento',
            'PAUSADA': 'Pausada',
        };
        statusEl.textContent = statusMap[obra.status] || obra.status;
    }

    const progressEl = document.querySelector('[data-obra-progresso]');
    if (progressEl && obra.progresso != null) {
        progressEl.textContent = `${obra.progresso}%`;
    }
}
