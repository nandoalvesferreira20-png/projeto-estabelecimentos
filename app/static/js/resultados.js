// ==========================================
// ESTADO
// ==========================================

let resultados = [];
let resultadosFiltrados = [];

let indiceAtual = 0;
let filtroAtual = "TODOS";


// ==========================================
// ELEMENTOS
// ==========================================

const statusCarregamento =
    document.getElementById(
        "status-carregamento"
    );

const totalResultados =
    document.getElementById(
        "total-resultados"
    );

const totalAtivos =
    document.getElementById(
        "total-ativos"
    );

const totalInativos =
    document.getElementById(
        "total-inativos"
    );

const totalInconclusivos =
    document.getElementById(
        "total-inconclusivos"
    );

const totalRevisoes =
    document.getElementById(
        "total-revisoes"
    );

const campoBusca =
    document.getElementById(
        "campo-busca"
    );

const btnLimparBusca =
    document.getElementById(
        "btn-limpar-busca"
    );

const totalFiltrado =
    document.getElementById(
        "total-filtrado"
    );
const dataInicial =
    document.getElementById(
        "data-inicial"
    );

const dataFinal =
    document.getElementById(
        "data-final"
    );
const horaInicial =
    document.getElementById(
        "hora-inicial"
    );

const horaFinal =
    document.getElementById(
        "hora-final"
    );

const btnHoje =
    document.getElementById(
        "btn-hoje"
    );

const btnLimparPeriodo =
    document.getElementById(
        "btn-limpar-periodo"
    );

const botoesFiltro =
    document.querySelectorAll(
        ".filtro"
    );

const semResultados =
    document.getElementById(
        "sem-resultados"
    );

const visualizador =
    document.getElementById(
        "visualizador"
    );

const navegacaoResultados =
    document.getElementById(
        "navegacao-resultados"
    );

const imagemFachada =
    document.getElementById(
        "imagem-fachada"
    );

const imagemIndisponivel =
    document.getElementById(
        "imagem-indisponivel"
    );

const dataImagemBadge =
    document.getElementById(
        "data-imagem-badge"
    );

const idInstalacao =
    document.getElementById(
        "id-instalacao"
    );

const statusElemento =
    document.getElementById(
        "status"
    );

const dataImagem =
    document.getElementById(
        "data-imagem"
    );

const dataAnalise =
    document.getElementById(
        "data-analise"
    );

const confiancaElemento =
    document.getElementById(
        "confianca"
    );

const barraConfianca =
    document.getElementById(
        "barra-confianca"
    );

const motivoElemento =
    document.getElementById(
        "motivo"
    );

const evidenciasElemento =
    document.getElementById(
        "evidencias"
    );

const revisaoElemento =
    document.getElementById(
        "revisao"
    );

const blocoObservacao =
    document.getElementById(
        "bloco-observacao"
    );

const observacaoAnalista =
    document.getElementById(
        "observacao-analista"
    );

const btnAnterior =
    document.getElementById(
        "btn-anterior"
    );

const btnProximo =
    document.getElementById(
        "btn-proximo"
    );

const posicaoAtual =
    document.getElementById(
        "posicao-atual"
    );

const totalNavegacao =
    document.getElementById(
        "total-navegacao"
    );


// ==========================================
// CARREGAR RESULTADOS
// ==========================================

async function carregarResultados() {

    atualizarStatusCarregamento(
        "CARREGANDO",
        "carregando"
    );

    try {

        const resposta = await fetch(
            "/api/resultados"
        );

        if (!resposta.ok) {

            throw new Error(
                `Erro HTTP ${resposta.status}`
            );
        }

        const dados =
            await resposta.json();

        resultados =
            Array.isArray(dados.resultados)
                ? dados.resultados
                : [];

        resultadosFiltrados = [
            ...resultados
        ];

        atualizarResumo();

        aplicarFiltros();

        atualizarStatusCarregamento(
            "ATUALIZADO",
            "concluido"
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar resultados:",
            erro
        );

        resultados = [];
        resultadosFiltrados = [];

        atualizarResumo();
        atualizarVisualizacao();

        atualizarStatusCarregamento(
            "ERRO",
            "erro"
        );
    }
}


// ==========================================
// STATUS DO CARREGAMENTO
// ==========================================

function atualizarStatusCarregamento(
    texto,
    classe
) {

    statusCarregamento.textContent =
        texto;

    statusCarregamento.className =
        `status-badge ${classe}`;
}


// ==========================================
// NORMALIZAR STATUS
// ==========================================

function normalizarStatus(
    status
) {

    return String(
        status || ""
    )
        .trim()
        .toUpperCase();
}


// ==========================================
// FORMATAR STATUS
// ==========================================

function formatarStatus(
    status
) {

    const valor =
        normalizarStatus(status);

    if (
        valor ===
        "POSSIVELMENTE_INATIVO"
    ) {

        return "POSSIVELMENTE INATIVO";
    }

    if (
        valor ===
        "INCONCLUSIVO"
    ) {

        return "INCONCLUSIVO";
    }

    if (
        valor ===
        "ATIVO"
    ) {

        return "ATIVO";
    }

    return (
        valor.replaceAll(
            "_",
            " "
        ) || "-"
    );
}


// ==========================================
// RESUMO
// ==========================================

function atualizarResumo(
    lista = resultados
) {

    let ativos = 0;
    let inativos = 0;
    let inconclusivos = 0;
    let revisoes = 0;


    lista.forEach(
        resultado => {

            const status =
                normalizarStatus(
                    resultado.status
                );


            if (
                status === "ATIVO"
            ) {

                ativos++;

            } else if (
                status ===
                "POSSIVELMENTE_INATIVO"
            ) {

                inativos++;

            } else {

                inconclusivos++;
            }


            if (
                resultado.requer_revisao
            ) {

                revisoes++;
            }
        }
    );


    totalResultados.textContent =
        lista.length;

    totalAtivos.textContent =
        ativos;

    totalInativos.textContent =
        inativos;

    totalInconclusivos.textContent =
        inconclusivos;

    totalRevisoes.textContent =
        revisoes;
}


// ==========================================
// FILTRAGEM
// ==========================================
function obterDataAnalise(
    resultado
) {

    if (!resultado.data_analise) {
        return null;
    }

    const texto =
        String(
            resultado.data_analise
        ).trim();

    /*
     * Backend:
     * 2026-09-15T14:25:32
     *
     * Queremos:
     * 2026-09-15
     */

    const data =
        texto.slice(
            0,
            10
        );

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            data
        )
    ) {
        return null;
    }

    return data;
}
function obterDataHoraAnalise(
    resultado
) {

    if (!resultado.data_analise) {
        return null;
    }

    const texto =
        String(
            resultado.data_analise
        ).trim();

    /*
     * Exemplo recebido:
     *
     * 2026-09-15T18:10:32
     */

    if (
        !texto.includes("T")
    ) {
        return null;
    }

    return texto;
}
function correspondePeriodo(
    resultado
) {

    const inicioData =
        dataInicial.value;

    const inicioHora =
        horaInicial.value;

    const fimData =
        dataFinal.value;

    const fimHora =
        horaFinal.value;


    // Nenhum filtro selecionado

    if (
        !inicioData &&
        !inicioHora &&
        !fimData &&
        !fimHora
    ) {
        return true;
    }


    const dataHoraResultado =
        obterDataHoraAnalise(
            resultado
        );


    if (!dataHoraResultado) {
        return false;
    }


    // ======================================
    // LIMITE INICIAL
    // ======================================

    if (inicioData) {

        const hora =
            inicioHora || "00:00";

        const limiteInicial =
            `${inicioData}T${hora}:00`;


        if (
            dataHoraResultado <
            limiteInicial
        ) {
            return false;
        }
    }


    // ======================================
    // LIMITE FINAL
    // ======================================

    if (fimData) {

        const hora =
            fimHora || "23:59";

        const limiteFinal =
            `${fimData}T${hora}:59`;


        if (
            dataHoraResultado >
            limiteFinal
        ) {
            return false;
        }
    }


    return true;
}

function aplicarFiltros() {

    const busca =
        campoBusca.value
            .trim()
            .toLowerCase();


    /*
     * PRIMEIRO:
     * filtra somente pelo período.
     *
     * Essa lista alimentará também
     * os cards de métricas.
     */

    const resultadosPeriodo =
        resultados.filter(
            resultado =>
                correspondePeriodo(
                    resultado
                )
        );


    /*
     * Cards representam o período
     * selecionado.
     */

    atualizarResumo(
        resultadosPeriodo
    );


    /*
     * DEPOIS:
     * aplica busca + status.
     */

    resultadosFiltrados =
        resultadosPeriodo.filter(
            resultado => {

                // ==========================
                // BUSCA
                // ==========================

                const instalacao =
                    String(
                        resultado.id_instalacao
                        || ""
                    )
                        .toLowerCase();


                const correspondeBusca =
                    !busca
                    ||
                    instalacao.includes(
                        busca
                    );


                if (!correspondeBusca) {
                    return false;
                }


                // ==========================
                // STATUS
                // ==========================

                if (
                    filtroAtual ===
                    "TODOS"
                ) {

                    return true;
                }


                if (
                    filtroAtual ===
                    "REVISAO"
                ) {

                    return (
                        resultado.requer_revisao
                        === true
                    );
                }


                return (
                    normalizarStatus(
                        resultado.status
                    )
                    === filtroAtual
                );
            }
        );


    indiceAtual = 0;

    atualizarVisualizacao();
}

// ==========================================
// VISUALIZAÇÃO
// ==========================================

function atualizarVisualizacao() {

    const total =
        resultadosFiltrados.length;

    totalFiltrado.textContent =
        total;

    // ======================================
    // SEM RESULTADOS
    // ======================================

    if (total === 0) {

        semResultados.hidden =
            false;

        visualizador.hidden =
            true;

        navegacaoResultados.hidden =
            true;

        return;
    }

    semResultados.hidden =
        true;

    visualizador.hidden =
        false;

    navegacaoResultados.hidden =
        false;

    // ======================================
    // GARANTE ÍNDICE VÁLIDO
    // ======================================

    if (
        indiceAtual >= total
    ) {

        indiceAtual =
            total - 1;
    }

    if (
        indiceAtual < 0
    ) {

        indiceAtual = 0;
    }

    const resultado =
        resultadosFiltrados[
            indiceAtual
        ];

    mostrarResultado(
        resultado
    );

    atualizarNavegacao();
}


// ==========================================
// MOSTRAR RESULTADO
// ==========================================

function mostrarResultado(
    resultado
) {

    // ======================================
    // INSTALAÇÃO
    // ======================================

    idInstalacao.textContent =
        resultado.id_instalacao
        || "-";


    // ======================================
    // DATA DA IMAGEM
    // ======================================

    const dataImagemValor =
        resultado.data_imagem
        || "N/D";

    dataImagem.textContent =
        dataImagemValor;

    dataImagemBadge.textContent =
        dataImagemValor;


    // ======================================
    // DATA DA ANÁLISE
    // ======================================

    dataAnalise.textContent =
        formatarData(
            resultado.data_analise
        );


    // ======================================
    // STATUS
    // ======================================

    atualizarStatusResultado(
        resultado.status
    );


    // ======================================
    // CONFIANÇA
    // ======================================

    let confianca =
        Number(
            resultado.confianca
        );

    if (
        !Number.isFinite(
            confianca
        )
    ) {

        confianca = 0;
    }

    /*
     * Backend normalmente retorna:
     *
     * 0.94
     *
     * Mas isso também protege caso
     * futuramente venha 94.
     */

    if (confianca > 1) {

        confianca =
            confianca / 100;
    }

    confianca = Math.max(
        0,
        Math.min(
            1,
            confianca
        )
    );

    const percentual =
        Math.round(
            confianca * 100
        );

    confiancaElemento.textContent =
        `${percentual}%`;

    barraConfianca.style.width =
        `${percentual}%`;


    // ======================================
    // MOTIVO
    // ======================================

    motivoElemento.textContent =
        resultado.motivo_principal
        || "Não informado";


    // ======================================
    // EVIDÊNCIAS
    // ======================================

    preencherEvidencias(
        resultado.evidencias
    );


    // ======================================
    // REVISÃO
    // ======================================

    revisaoElemento.hidden =
        !resultado.requer_revisao;


    // ======================================
    // OBSERVAÇÃO
    // ======================================

    const observacao =
        String(
            resultado.observacao_analista
            || ""
        ).trim();

    if (observacao) {

        blocoObservacao.hidden =
            false;

        observacaoAnalista.textContent =
            observacao;

    } else {

        blocoObservacao.hidden =
            true;

        observacaoAnalista.textContent =
            "-";
    }


    // ======================================
    // IMAGEM
    // ======================================

    carregarImagem(
        resultado.imagem
    );
}


// ==========================================
// STATUS DO RESULTADO
// ==========================================

function atualizarStatusResultado(
    status
) {

    const valor =
        normalizarStatus(
            status
        );

    statusElemento.textContent =
        formatarStatus(
            valor
        );

    statusElemento.className =
        "status";

    if (
        valor === "ATIVO"
    ) {

        statusElemento.classList.add(
            "ativo"
        );

    } else if (
        valor ===
        "POSSIVELMENTE_INATIVO"
    ) {

        statusElemento.classList.add(
            "inativo"
        );

    } else {

        statusElemento.classList.add(
            "inconclusivo"
        );
    }
}


// ==========================================
// EVIDÊNCIAS
// ==========================================

function preencherEvidencias(
    evidencias
) {

    evidenciasElemento.innerHTML =
        "";

    let lista = [];

    if (
        Array.isArray(
            evidencias
        )
    ) {

        lista =
            evidencias.filter(
                item =>
                    String(item)
                        .trim()
            );

    } else if (evidencias) {

        lista =
            String(evidencias)
                .split("|")
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean);
    }

    if (
        lista.length === 0
    ) {

        const item =
            document.createElement(
                "li"
            );

        item.textContent =
            "Nenhuma evidência informada.";

        item.classList.add(
            "evidencia-vazia"
        );

        evidenciasElemento.appendChild(
            item
        );

        return;
    }

    lista.forEach(
        evidencia => {

            const item =
                document.createElement(
                    "li"
                );

            item.textContent =
                evidencia;

            evidenciasElemento.appendChild(
                item
            );
        }
    );
}


// ==========================================
// IMAGEM
// ==========================================

function carregarImagem(
    caminho
) {

    /*
     * Limpa handlers anteriores para
     * evitar comportamento estranho ao
     * navegar rapidamente.
     */

    imagemFachada.onload = null;
    imagemFachada.onerror = null;

    if (!caminho) {

        mostrarImagemIndisponivel();

        return;
    }

    imagemFachada.style.display =
        "block";

    imagemIndisponivel.hidden =
        true;

    imagemFachada.onload =
        () => {

            imagemFachada.style.display =
                "block";

            imagemIndisponivel.hidden =
                true;
        };

    imagemFachada.onerror =
        () => {

            mostrarImagemIndisponivel();
        };

    /*
     * Query string evita cache antigo
     * quando trocamos rapidamente de
     * instalação.
     */

    const separador =
        caminho.includes("?")
            ? "&"
            : "?";

    imagemFachada.src =
        (
            `${caminho}` +
            `${separador}` +
            `v=${Date.now()}`
        );
}


function mostrarImagemIndisponivel() {

    imagemFachada.removeAttribute(
        "src"
    );

    imagemFachada.style.display =
        "none";

    imagemIndisponivel.hidden =
        false;
}


// ==========================================
// FORMATAR DATA
// ==========================================

function formatarData(
    valor
) {

    if (!valor) {
        return "N/D";
    }

    const texto =
        String(valor).trim();

    /*
     * Se vier:
     *
     * 2026-09-15T13:22:10
     */

    const data =
        new Date(texto);

    if (
        !Number.isNaN(
            data.getTime()
        )
    ) {

        return data.toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }

    return texto;
}


// ==========================================
// NAVEGAÇÃO
// ==========================================

function atualizarNavegacao() {

    const total =
        resultadosFiltrados.length;

    posicaoAtual.textContent =
        indiceAtual + 1;

    totalNavegacao.textContent =
        total;

    btnAnterior.disabled =
        indiceAtual === 0;

    btnProximo.disabled =
        indiceAtual >=
        total - 1;
}


function resultadoAnterior() {

    if (
        indiceAtual <= 0
    ) {

        return;
    }

    indiceAtual--;

    atualizarVisualizacao();

    rolarParaResultado();
}


function proximoResultado() {

    if (
        indiceAtual >=
        resultadosFiltrados.length - 1
    ) {

        return;
    }

    indiceAtual++;

    atualizarVisualizacao();

    rolarParaResultado();
}


// ==========================================
// ROLAR PARA RESULTADO
// ==========================================

function rolarParaResultado() {

    /*
     * Em telas pequenas evita que
     * Anterior/Próximo deixe o usuário
     * perdido muito abaixo da página.
     */

    if (
        window.innerWidth <= 900
    ) {

        visualizador.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


// ==========================================
// EVENTOS DE NAVEGAÇÃO
// ==========================================

btnAnterior.addEventListener(
    "click",
    resultadoAnterior
);

btnProximo.addEventListener(
    "click",
    proximoResultado
);


// ==========================================
// BUSCA
// ==========================================

campoBusca.addEventListener(
    "input",
    () => {

        btnLimparBusca.hidden =
            campoBusca.value.length === 0;

        aplicarFiltros();
    }
);


btnLimparBusca.addEventListener(
    "click",
    () => {

        campoBusca.value =
            "";

        btnLimparBusca.hidden =
            true;

        campoBusca.focus();

        aplicarFiltros();
    }
);


// ==========================================
// FILTROS
// ==========================================

botoesFiltro.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                filtroAtual =
                    botao.dataset.filtro;

                botoesFiltro.forEach(
                    item => {

                        item.classList.remove(
                            "ativo"
                        );
                    }
                );

                botao.classList.add(
                    "ativo"
                );

                aplicarFiltros();
            }
        );
    }
);


// ==========================================
// ATALHOS DE TECLADO
// ==========================================

document.addEventListener(
    "keydown",
    evento => {

        /*
         * Não navega enquanto o usuário
         * estiver digitando na busca.
         */

        if (
            document.activeElement
            === campoBusca
        ) {

            return;
        }

        if (
            evento.key ===
            "ArrowLeft"
        ) {

            resultadoAnterior();
        }

        if (
            evento.key ===
            "ArrowRight"
        ) {

            proximoResultado();
        }
    }
);

// ==========================================
// FILTRO POR PERÍODO
// ==========================================

dataInicial.addEventListener(
    "change",
    aplicarFiltros
);


dataFinal.addEventListener(
    "change",
    aplicarFiltros
);
horaInicial.addEventListener(
    "change",
    aplicarFiltros
);

horaFinal.addEventListener(
    "change",
    aplicarFiltros
);


btnLimparPeriodo.addEventListener(
    "click",
    () => {

        dataInicial.value = "";
        dataFinal.value = "";
        horaInicial.value = "";
        horaFinal.value = "";

        aplicarFiltros();
    }
);


btnHoje.addEventListener(
    "click",
    () => {

        const agora =
            new Date();

        const ano =
            agora.getFullYear();

        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const dia =
            String(
                agora.getDate()
            ).padStart(
                2,
                "0"
            );

        const hoje =
            `${ano}-${mes}-${dia}`;

        dataInicial.value =
            hoje;

        dataFinal.value =
            hoje;

        aplicarFiltros();
    }
);

// ==========================================
// INICIALIZAÇÃO
// ==========================================

carregarResultados();