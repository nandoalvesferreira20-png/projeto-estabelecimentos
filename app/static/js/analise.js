// ==========================================
// ESTADO
// ==========================================

let imagemIndividualSelecionada = null;
let previewUrl = null;
let intervaloProgresso = null;


// ==========================================
// ELEMENTOS - LOTE
// ==========================================

const btnIniciar = document.getElementById(
    "btn-iniciar"
);

const statusImagens = document.getElementById(
    "status-imagens"
);

const statusBadge = document.getElementById(
    "status-badge"
);

const progressoPercentual = document.getElementById(
    "progresso-percentual"
);

const barraPreenchimento = document.getElementById(
    "barra-preenchimento"
);

const progressoTexto = document.getElementById(
    "progresso-texto"
);

const totalElemento = document.getElementById(
    "total"
);

const analisadasElemento = document.getElementById(
    "analisadas"
);

const ignoradasElemento = document.getElementById(
    "ignoradas"
);

const errosElemento = document.getElementById(
    "erros"
);

const ativosElemento = document.getElementById(
    "ativos"
);

const possivelmenteInativosElemento =
    document.getElementById(
        "possivelmente-inativos"
    );

const inconclusivosElemento =
    document.getElementById(
        "inconclusivos"
    );

const revisoesElemento = document.getElementById(
    "revisoes"
);

const ultimaAnalise = document.getElementById(
    "ultima-analise"
);

const ultimaInstalacao = document.getElementById(
    "ultima-instalacao"
);

const ultimoStatus = document.getElementById(
    "ultimo-status"
);

const ultimaConfianca = document.getElementById(
    "ultima-confianca"
);

const logElemento = document.getElementById(
    "log"
);

const indicadorExecucao = document.getElementById(
    "indicador-execucao"
);

const resultadoFinal = document.getElementById(
    "resultado-final"
);

const resultadoMensagem = document.getElementById(
    "resultado-mensagem"
);


// ==========================================
// ELEMENTOS - INDIVIDUAL
// ==========================================

const inputImagemIndividual =
    document.getElementById(
        "input-imagem-individual"
    );

const btnSelecionarImagem =
    document.getElementById(
        "btn-selecionar-imagem"
    );

const painelIndividual =
    document.getElementById(
        "painel-individual"
    );

const btnRemoverImagem =
    document.getElementById(
        "btn-remover-imagem"
    );

const previewImagem =
    document.getElementById(
        "preview-imagem"
    );

const nomeArquivo =
    document.getElementById(
        "nome-arquivo"
    );

const tipoArquivo =
    document.getElementById(
        "tipo-arquivo"
    );

const tamanhoArquivo =
    document.getElementById(
        "tamanho-arquivo"
    );

const btnAnalisarIndividual =
    document.getElementById(
        "btn-analisar-individual"
    );

const processamentoIndividual =
    document.getElementById(
        "processamento-individual"
    );

const resultadoIndividual =
    document.getElementById(
        "resultado-individual"
    );

const statusIndividual =
    document.getElementById(
        "status-individual"
    );

const confiancaIndividual =
    document.getElementById(
        "confianca-individual"
    );

const barraConfiancaIndividual =
    document.getElementById(
        "barra-confianca-individual"
    );

const revisaoIndividual =
    document.getElementById(
        "revisao-individual"
    );

const motivoIndividual =
    document.getElementById(
        "motivo-individual"
    );

const evidenciasIndividual =
    document.getElementById(
        "evidencias-individual"
    );

const btnNovaAnalise =
    document.getElementById(
        "btn-nova-analise"
    );


// ==========================================
// FUNÇÕES GERAIS
// ==========================================

function formatarStatus(status) {

    if (!status) {
        return "-";
    }

    return String(status)
        .replaceAll("_", " ");
}


function atualizarStatus(
    elemento,
    texto,
    classe
) {

    if (!elemento) {
        return;
    }

    elemento.textContent = texto;

    elemento.className =
        `status-badge ${classe}`;
}


// ==========================================
// ANÁLISE INDIVIDUAL
// ==========================================

// ------------------------------------------
// ABRIR SELETOR
// ------------------------------------------

btnSelecionarImagem.addEventListener(
    "click",
    () => {

        inputImagemIndividual.click();
    }
);


// ------------------------------------------
// IMAGEM SELECIONADA
// ------------------------------------------

inputImagemIndividual.addEventListener(
    "change",
    () => {

        const arquivo =
            inputImagemIndividual.files[0];

        if (!arquivo) {
            return;
        }

        const tiposPermitidos = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (
            !tiposPermitidos.includes(
                arquivo.type
            )
        ) {

            alert(
                "Selecione uma imagem JPG, JPEG, PNG ou WEBP."
            );

            inputImagemIndividual.value =
                "";

            return;
        }

        imagemIndividualSelecionada =
            arquivo;

        mostrarImagemSelecionada(
            arquivo
        );
    }
);


// ------------------------------------------
// MOSTRAR PREVIEW
// ------------------------------------------

function mostrarImagemSelecionada(
    arquivo
) {

    if (previewUrl) {

        URL.revokeObjectURL(
            previewUrl
        );
    }

    previewUrl =
        URL.createObjectURL(
            arquivo
        );

    previewImagem.src =
        previewUrl;

    nomeArquivo.textContent =
        arquivo.name;

    tipoArquivo.textContent =
        formatarTipoArquivo(
            arquivo
        );

    tamanhoArquivo.textContent =
        formatarTamanhoArquivo(
            arquivo.size
        );

    painelIndividual.hidden =
        false;

    processamentoIndividual.hidden =
        true;

    resultadoIndividual.hidden =
        true;

    painelIndividual.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ------------------------------------------
// TIPO DO ARQUIVO
// ------------------------------------------

function formatarTipoArquivo(
    arquivo
) {

    const extensao =
        arquivo.name
            .split(".")
            .pop()
            .toUpperCase();

    return extensao || arquivo.type;
}


// ------------------------------------------
// TAMANHO
// ------------------------------------------

function formatarTamanhoArquivo(
    bytes
) {

    if (bytes < 1024) {

        return `${bytes} B`;
    }

    if (
        bytes <
        1024 * 1024
    ) {

        return (
            `${(
                bytes / 1024
            ).toFixed(1)} KB`
        );
    }

    return (
        `${(
            bytes /
            (1024 * 1024)
        ).toFixed(2)} MB`
    );
}


// ------------------------------------------
// REMOVER IMAGEM
// ------------------------------------------

btnRemoverImagem.addEventListener(
    "click",
    limparAnaliseIndividual
);


// ------------------------------------------
// NOVA ANÁLISE
// ------------------------------------------

btnNovaAnalise.addEventListener(
    "click",
    () => {

        limparAnaliseIndividual();

        inputImagemIndividual.click();
    }
);


// ------------------------------------------
// LIMPAR INDIVIDUAL
// ------------------------------------------

function limparAnaliseIndividual() {

    imagemIndividualSelecionada =
        null;

    inputImagemIndividual.value =
        "";

    painelIndividual.hidden =
        true;

    processamentoIndividual.hidden =
        true;

    resultadoIndividual.hidden =
        true;

    previewImagem.removeAttribute(
        "src"
    );

    nomeArquivo.textContent =
        "-";

    tipoArquivo.textContent =
        "-";

    tamanhoArquivo.textContent =
        "-";

    if (previewUrl) {

        URL.revokeObjectURL(
            previewUrl
        );

        previewUrl = null;
    }

    limparResultadoIndividual();
}


// ------------------------------------------
// LIMPAR RESULTADO
// ------------------------------------------

function limparResultadoIndividual() {

    statusIndividual.textContent =
        "-";

    statusIndividual.className =
        "status inconclusivo";

    confiancaIndividual.textContent =
        "0%";

    barraConfiancaIndividual.style.width =
        "0%";

    revisaoIndividual.textContent =
        "-";

    revisaoIndividual.className =
        "revisao-individual-status";

    motivoIndividual.textContent =
        "-";

    evidenciasIndividual.innerHTML =
        "";
}


// ------------------------------------------
// ANALISAR
// ------------------------------------------

btnAnalisarIndividual.addEventListener(
    "click",
    analisarImagemIndividual
);


async function analisarImagemIndividual() {

    if (
        !imagemIndividualSelecionada
    ) {

        alert(
            "Selecione uma imagem primeiro."
        );

        return;
    }


    // ======================================
    // INTERFACE
    // ======================================

    btnAnalisarIndividual.disabled =
        true;

    btnRemoverImagem.disabled =
        true;

    btnSelecionarImagem.disabled =
        true;

    processamentoIndividual.hidden =
        false;

    resultadoIndividual.hidden =
        true;

    limparResultadoIndividual();


    processamentoIndividual.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    // ======================================
    // FORM DATA
    // ======================================

    const formulario =
        new FormData();

    /*
     * IMPORTANTE:
     *
     * "imagem" precisa ter exatamente
     * o mesmo nome do parâmetro FastAPI:
     *
     * async def analisar(
     *     imagem: UploadFile = File(...)
     * )
     */

    formulario.append(
        "imagem",
        imagemIndividualSelecionada
    );


    // ======================================
    // REQUISIÇÃO
    // ======================================

    try {

        const resposta = await fetch(
            "/analisar-fachada",
            {
                method: "POST",
                body: formulario
            }
        );


        if (!resposta.ok) {

            const mensagem =
                await extrairErro(
                    resposta
                );

            throw new Error(
                mensagem
            );
        }


        const resultado =
            await resposta.json();


        mostrarResultadoIndividual(
            resultado
        );


    } catch (erro) {

        console.error(
            "Erro na análise individual:",
            erro
        );

        alert(
            (
                "Não foi possível analisar " +
                "a imagem.\n\n" +
                erro.message
            )
        );


    } finally {

        processamentoIndividual.hidden =
            true;

        btnAnalisarIndividual.disabled =
            false;

        btnRemoverImagem.disabled =
            false;

        btnSelecionarImagem.disabled =
            false;
    }
}


// ------------------------------------------
// MOSTRAR RESULTADO INDIVIDUAL
// ------------------------------------------

function mostrarResultadoIndividual(
    resultado
) {

    resultadoIndividual.hidden =
        false;


    // ======================================
    // STATUS
    // ======================================

    const status =
        String(
            resultado.status || ""
        ).toUpperCase();


    statusIndividual.textContent =
        formatarStatus(
            status
        );


    statusIndividual.className =
        "status";


    if (
        status === "ATIVO"
    ) {

        statusIndividual.classList.add(
            "ativo"
        );

    } else if (
        status ===
        "POSSIVELMENTE_INATIVO"
    ) {

        statusIndividual.classList.add(
            "inativo"
        );

    } else {

        statusIndividual.classList.add(
            "inconclusivo"
        );
    }


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
     * Atualmente esperamos algo como:
     *
     * 0.92
     *
     * Mas isso também suporta 92.
     */

    if (confianca > 1) {

        confianca =
            confianca / 100;
    }


    confianca =
        Math.max(
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


    confiancaIndividual.textContent =
        `${percentual}%`;


    /*
     * Pequeno timeout para permitir
     * a animação CSS da barra.
     */

    requestAnimationFrame(
        () => {

            barraConfiancaIndividual
                .style.width =
                `${percentual}%`;
        }
    );


    // ======================================
    // MOTIVO
    // ======================================

    motivoIndividual.textContent =
        resultado.motivo_principal
        || "Não informado";


    // ======================================
    // EVIDÊNCIAS
    // ======================================

    preencherEvidenciasIndividual(
        resultado.evidencias
    );


    // ======================================
    // REVISÃO
    // ======================================

    if (
        resultado.requer_revisao
    ) {

        revisaoIndividual.textContent =
            "SIM";

        revisaoIndividual.classList.add(
            "necessaria"
        );

    } else {

        revisaoIndividual.textContent =
            "NÃO";

        revisaoIndividual.classList.add(
            "dispensada"
        );
    }


    // ======================================
    // MOSTRAR
    // ======================================

    resultadoIndividual.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ------------------------------------------
// EVIDÊNCIAS INDIVIDUAIS
// ------------------------------------------

function preencherEvidenciasIndividual(
    evidencias
) {

    evidenciasIndividual.innerHTML =
        "";


    let lista = [];


    if (
        Array.isArray(
            evidencias
        )
    ) {

        lista =
            evidencias;

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

        evidenciasIndividual.appendChild(
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

            evidenciasIndividual.appendChild(
                item
            );
        }
    );
}


// ==========================================
// EXTRAIR ERRO DA API
// ==========================================

async function extrairErro(
    resposta
) {

    try {

        const dados =
            await resposta.json();


        if (
            typeof dados.detail ===
            "string"
        ) {

            return dados.detail;
        }


        return (
            JSON.stringify(
                dados.detail
            )
            ||
            `Erro HTTP ${resposta.status}`
        );


    } catch {

        return (
            `Erro HTTP ${resposta.status}`
        );
    }
}


// ==========================================
// LOG DO LOTE
// ==========================================

function adicionarLog(
    mensagem,
    tipo = "info"
) {

    const vazio =
        logElemento.querySelector(
            ".log-vazio"
        );


    if (vazio) {

        vazio.remove();
    }


    const linha =
        document.createElement(
            "div"
        );


    linha.className =
        `log-item ${tipo}`;


    const horario =
        new Date()
            .toLocaleTimeString(
                "pt-BR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );


    const hora =
        document.createElement(
            "span"
        );


    hora.className =
        "log-hora";

    hora.textContent =
        horario;


    const texto =
        document.createElement(
            "span"
        );


    texto.className =
        "log-mensagem";

    texto.textContent =
        mensagem;


    linha.appendChild(
        hora
    );

    linha.appendChild(
        texto
    );


    logElemento.appendChild(
        linha
    );


    logElemento.scrollTop =
        logElemento.scrollHeight;
}


// ==========================================
// PROGRESSO DO LOTE
// ==========================================

function atualizarProgresso(
    percentual,
    mensagem
) {

    percentual =
        Math.max(
            0,
            Math.min(
                100,
                percentual
            )
        );


    progressoPercentual.textContent =
        `${Math.round(percentual)}%`;


    barraPreenchimento.style.width =
        `${percentual}%`;


    if (mensagem) {

        progressoTexto.textContent =
            mensagem;
    }
}


// ==========================================
// MÉTRICAS DO LOTE
// ==========================================

function atualizarMetricas(
    dados
) {

    totalElemento.textContent =
        dados.total ?? 0;

    analisadasElemento.textContent =
        dados.analisadas ?? 0;

    ignoradasElemento.textContent =
        dados.ignoradas ?? 0;

    errosElemento.textContent =
        dados.erros ?? 0;

    ativosElemento.textContent =
        dados.ativos ?? 0;

    possivelmenteInativosElemento.textContent =
        dados.possivelmente_inativos ?? 0;

    inconclusivosElemento.textContent =
        dados.inconclusivos ?? 0;

    revisoesElemento.textContent =
        dados.revisoes ?? 0;
}


// ==========================================
// RESET DO LOTE
// ==========================================

function resetarInterfaceLote() {

    atualizarStatus(
        statusImagens,
        "PRONTO",
        "concluido"
    );


    atualizarStatus(
        statusBadge,
        "AGUARDANDO",
        "aguardando"
    );


    atualizarProgresso(
        0,
        "Nenhuma análise iniciada"
    );


    atualizarMetricas({
        total: 0,
        analisadas: 0,
        ignoradas: 0,
        erros: 0,
        ativos: 0,
        possivelmente_inativos: 0,
        inconclusivos: 0,
        revisoes: 0
    });


    ultimaAnalise.hidden =
        true;

    resultadoFinal.hidden =
        true;

    indicadorExecucao.classList.remove(
        "ativo"
    );
}


// ==========================================
// ESTADO PROCESSANDO LOTE
// ==========================================

function iniciarEstadoProcessamento() {

    btnIniciar.disabled =
        true;


    atualizarStatus(
        statusImagens,
        "CARREGADO",
        "concluido"
    );


    atualizarStatus(
        statusBadge,
        "PROCESSANDO",
        "processando"
    );


    atualizarProgresso(
        10,
        "Preparando imagens..."
    );


    indicadorExecucao.classList.add(
        "ativo"
    );


    resultadoFinal.hidden =
        true;


    ultimaAnalise.hidden =
        true;


    adicionarLog(
        "Iniciando análise das fachadas...",
        "info"
    );


    adicionarLog(
        "Carregando imagens de data/imagens...",
        "info"
    );


    adicionarLog(
        "Verificando instalações já processadas...",
        "info"
    );
}


// ==========================================
// PROGRESSO VISUAL DO LOTE
// ==========================================

function iniciarProgressoVisual() {

    let percentual = 15;


    atualizarProgresso(
        percentual,
        "Modelo de IA processando fachadas..."
    );


    intervaloProgresso =
        setInterval(
            () => {

                if (
                    percentual < 85
                ) {

                    percentual +=
                        Math.random() * 3;


                    atualizarProgresso(
                        percentual,
                        "Analisando fachadas com IA..."
                    );
                }

            },
            2500
        );
}


function pararProgressoVisual() {

    if (
        intervaloProgresso
    ) {

        clearInterval(
            intervaloProgresso
        );

        intervaloProgresso =
            null;
    }
}


// ==========================================
// ANALISAR LOTE
// ==========================================

async function iniciarAnalise() {

    iniciarEstadoProcessamento();

    iniciarProgressoVisual();


    try {

        const resposta =
            await fetch(
                "/analisar/lote",
                {
                    method: "POST"
                }
            );


        if (!resposta.ok) {

            const mensagem =
                await extrairErro(
                    resposta
                );


            throw new Error(
                mensagem
            );
        }


        const dados =
            await resposta.json();


        pararProgressoVisual();


        // ==================================
        // MÉTRICAS
        // ==================================

        atualizarMetricas(
            dados
        );


        // ==================================
        // PROGRESSO
        // ==================================

        atualizarProgresso(
            100,
            "Processamento concluído"
        );


        // ==================================
        // STATUS
        // ==================================

        atualizarStatus(
            statusBadge,
            "CONCLUÍDO",
            "concluido"
        );


        indicadorExecucao.classList.remove(
            "ativo"
        );


        // ==================================
        // LOG
        // ==================================

        adicionarLog(
            (
                `${dados.total ?? 0} ` +
                `imagem(ns) encontrada(s).`
            ),
            "info"
        );


        adicionarLog(
            (
                `${dados.analisadas ?? 0} ` +
                `nova(s) fachada(s) analisada(s).`
            ),
            "sucesso"
        );


        if (
            (dados.ignoradas ?? 0) > 0
        ) {

            adicionarLog(
                (
                    `${dados.ignoradas} ` +
                    `instalação(ões) já ` +
                    `processada(s) foram ignoradas.`
                ),
                "info"
            );
        }


        if (
            (dados.erros ?? 0) > 0
        ) {

            adicionarLog(
                (
                    `${dados.erros} erro(s) ` +
                    `durante o processamento.`
                ),
                "erro"
            );
        }


        adicionarLog(
            (
                `Ativos: ` +
                `${dados.ativos ?? 0}`
            ),
            "sucesso"
        );


        adicionarLog(
            (
                `Possivelmente inativos: ` +
                `${dados.possivelmente_inativos ?? 0}`
            ),
            "alerta"
        );


        adicionarLog(
            (
                `Inconclusivos: ` +
                `${dados.inconclusivos ?? 0}`
            ),
            "info"
        );


        adicionarLog(
            (
                `Revisões recomendadas: ` +
                `${dados.revisoes ?? 0}`
            ),
            "alerta"
        );


        // ==================================
        // RESULTADO FINAL
        // ==================================

        resultadoMensagem.textContent =
            (
                `${dados.analisadas ?? 0} ` +
                `nova(s) fachada(s) analisada(s), ` +
                `${dados.ignoradas ?? 0} ` +
                `já processada(s) e ` +
                `${dados.erros ?? 0} erro(s).`
            );


        resultadoFinal.hidden =
            false;


        if (
            dados.arquivo_resultados
        ) {

            adicionarLog(
                (
                    `Resultados salvos em: ` +
                    `${dados.arquivo_resultados}`
                ),
                "sucesso"
            );
        }


    } catch (erro) {

        pararProgressoVisual();


        console.error(
            "Erro durante a análise:",
            erro
        );


        atualizarStatus(
            statusBadge,
            "ERRO",
            "erro"
        );


        atualizarProgresso(
            0,
            "Falha durante o processamento"
        );


        indicadorExecucao.classList.remove(
            "ativo"
        );


        adicionarLog(
            erro.message,
            "erro"
        );


        resultadoFinal.hidden =
            true;


    } finally {

        btnIniciar.disabled =
            false;
    }
}


// ==========================================
// BOTÃO LOTE
// ==========================================

btnIniciar.addEventListener(
    "click",
    iniciarAnalise
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

resetarInterfaceLote();