let arquivoSelecionado = null;


// ==========================================
// ELEMENTOS
// ==========================================

const inputArquivo = document.getElementById(
    "arquivo"
);

const uploadArea = document.getElementById(
    "upload-area"
);

const arquivoSelecionadoArea = document.getElementById(
    "arquivo-selecionado"
);

const nomeArquivo = document.getElementById(
    "nome-arquivo"
);

const tamanhoArquivo = document.getElementById(
    "tamanho-arquivo"
);

const btnRemover = document.getElementById(
    "btn-remover"
);

const btnIniciar = document.getElementById(
    "btn-iniciar"
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

const baixadasElemento = document.getElementById(
    "baixadas"
);

const ignoradasElemento = document.getElementById(
    "ignoradas"
);

const naoEncontradasElemento = document.getElementById(
    "nao-encontradas"
);

const errosElemento = document.getElementById(
    "erros"
);

const logElemento = document.getElementById(
    "log"
);

const resultadoFinal = document.getElementById(
    "resultado-final"
);

const resultadoMensagem = document.getElementById(
    "resultado-mensagem"
);

const indicadorExecucao = document.getElementById(
    "indicador-execucao"
);


// ==========================================
// FORMATAR TAMANHO
// ==========================================

function formatarTamanho(bytes) {

    if (bytes === 0) {
        return "0 KB";
    }

    const kb = bytes / 1024;

    if (kb < 1024) {

        return (
            `${kb.toFixed(1)} KB`
        );
    }

    const mb = kb / 1024;

    return (
        `${mb.toFixed(2)} MB`
    );
}


// ==========================================
// ARQUIVO SELECIONADO
// ==========================================

function selecionarArquivo(
    arquivo
) {

    if (!arquivo) {
        return;
    }

    const extensao = arquivo.name
        .split(".")
        .pop()
        .toLowerCase();


    if (extensao !== "xlsx") {

        alert(
            "Selecione uma planilha " +
            "Excel no formato .xlsx."
        );

        inputArquivo.value = "";

        return;
    }


    arquivoSelecionado = arquivo;


    nomeArquivo.textContent =
        arquivo.name;


    tamanhoArquivo.textContent =
        formatarTamanho(
            arquivo.size
        );


    arquivoSelecionadoArea.hidden =
        false;


    uploadArea.classList.add(
        "arquivo-carregado"
    );


    btnIniciar.disabled =
        false;


    adicionarLog(
        `Planilha selecionada: ${arquivo.name}`,
        "info"
    );
}


// ==========================================
// INPUT DE ARQUIVO
// ==========================================

inputArquivo.addEventListener(
    "change",
    () => {

        const arquivo =
            inputArquivo.files[0];

        selecionarArquivo(
            arquivo
        );
    }
);


// ==========================================
// REMOVER ARQUIVO
// ==========================================

btnRemover.addEventListener(
    "click",
    () => {

        arquivoSelecionado =
            null;

        inputArquivo.value =
            "";

        arquivoSelecionadoArea.hidden =
            true;

        uploadArea.classList.remove(
            "arquivo-carregado"
        );

        btnIniciar.disabled =
            true;

        resetarInterface();

        adicionarLog(
            "Planilha removida.",
            "info"
        );
    }
);


// ==========================================
// LOG
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


    const agora =
        new Date();


    const horario =
        agora.toLocaleTimeString(
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
// STATUS
// ==========================================

function atualizarStatus(
    texto,
    classe
) {

    statusBadge.textContent =
        texto;

    statusBadge.className =
        `status-badge ${classe}`;
}


// ==========================================
// PROGRESSO
// ==========================================

function atualizarProgresso(
    percentual,
    texto
) {

    percentual = Math.max(
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


    if (texto) {

        progressoTexto.textContent =
            texto;
    }
}


// ==========================================
// MÉTRICAS
// ==========================================

function atualizarMetricas(
    dados
) {

    totalElemento.textContent =
        dados.total ?? 0;

    baixadasElemento.textContent =
        dados.baixadas ?? 0;

    ignoradasElemento.textContent =
        dados.ignoradas ?? 0;

    naoEncontradasElemento.textContent =
        dados.nao_encontradas ?? 0;

    errosElemento.textContent =
        dados.erros ?? 0;
}


// ==========================================
// RESET
// ==========================================

function resetarInterface() {

    atualizarStatus(
        "AGUARDANDO",
        "aguardando"
    );


    atualizarProgresso(
        0,
        "Nenhuma coleta iniciada"
    );


    atualizarMetricas({
        total: 0,
        baixadas: 0,
        ignoradas: 0,
        nao_encontradas: 0,
        erros: 0
    });


    resultadoFinal.hidden =
        true;


    indicadorExecucao.classList.remove(
        "ativo"
    );
}


// ==========================================
// ESTADO PROCESSANDO
// ==========================================

function iniciarEstadoProcessamento() {

    atualizarStatus(
        "PROCESSANDO",
        "processando"
    );


    atualizarProgresso(
        10,
        "Preparando coleta..."
    );


    btnIniciar.disabled =
        true;

    inputArquivo.disabled =
        true;

    btnRemover.disabled =
        true;


    resultadoFinal.hidden =
        true;


    indicadorExecucao.classList.add(
        "ativo"
    );


    adicionarLog(
        "Iniciando coleta de imagens...",
        "info"
    );

    adicionarLog(
        "Carregando instalações da planilha...",
        "info"
    );
}


// ==========================================
// LIBERAR INTERFACE
// ==========================================

function liberarInterface() {

    inputArquivo.disabled =
        false;

    btnRemover.disabled =
        false;

    btnIniciar.disabled =
        arquivoSelecionado === null;


    indicadorExecucao.classList.remove(
        "ativo"
    );
}


// ==========================================
// ERRO DA API
// ==========================================

async function extrairErro(
    resposta
) {

    try {

        const dados =
            await resposta.json();

        return (
            dados.detail ||
            "Erro desconhecido."
        );

    } catch {

        return (
            `Erro HTTP ${resposta.status}`
        );
    }
}


// ==========================================
// INICIAR COLETA
// ==========================================

async function iniciarColeta() {

    if (!arquivoSelecionado) {

        alert(
            "Selecione uma planilha primeiro."
        );

        return;
    }


    iniciarEstadoProcessamento();


    const formData =
        new FormData();


    formData.append(
        "arquivo",
        arquivoSelecionado
    );


    try {

        atualizarProgresso(
            20,
            "Enviando planilha..."
        );


        adicionarLog(
            "Planilha enviada para processamento.",
            "info"
        );


        const resposta =
            await fetch(
                "/coletar/imagens",
                {
                    method: "POST",
                    body: formData
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


        atualizarProgresso(
            90,
            "Finalizando coleta..."
        );


        const dados =
            await resposta.json();


        // ==================================
        // MÉTRICAS FINAIS
        // ==================================

        atualizarMetricas(
            dados
        );


        // ==================================
        // PROGRESSO FINAL
        // ==================================

        atualizarProgresso(
            100,
            "Coleta concluída"
        );


        atualizarStatus(
            "CONCLUÍDO",
            "concluido"
        );


        // ==================================
        // LOG FINAL
        // ==================================

        adicionarLog(
            (
                `Coleta finalizada. ` +
                `${dados.baixadas ?? 0} ` +
                `imagem(ns) coletada(s).`
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
                    `possuíam imagem.`
                ),
                "info"
            );
        }


        if (
            (
                dados.nao_encontradas ??
                0
            ) > 0
        ) {

            adicionarLog(
                (
                    `${dados.nao_encontradas} ` +
                    `instalação(ões) sem ` +
                    `imagem no Street View.`
                ),
                "alerta"
            );
        }


        if (
            (dados.erros ?? 0) > 0
        ) {

            adicionarLog(
                (
                    `${dados.erros} erro(s) ` +
                    `durante a coleta.`
                ),
                "erro"
            );
        }


        // ==================================
        // RESULTADO FINAL
        // ==================================

        resultadoMensagem.textContent =
            (
                `${dados.baixadas ?? 0} ` +
                `imagem(ns) coletada(s), ` +
                `${dados.ignoradas ?? 0} ` +
                `já existente(s) e ` +
                `${dados.nao_encontradas ?? 0} ` +
                `não encontrada(s).`
            );


        resultadoFinal.hidden =
            false;


    } catch (erro) {

        console.error(
            "Erro na coleta:",
            erro
        );


        atualizarStatus(
            "ERRO",
            "erro"
        );


        atualizarProgresso(
            0,
            "Falha durante a coleta"
        );


        adicionarLog(
            erro.message,
            "erro"
        );


        resultadoFinal.hidden =
            true;


    } finally {

        liberarInterface();
    }
}


// ==========================================
// BOTÃO INICIAR
// ==========================================

btnIniciar.addEventListener(
    "click",
    iniciarColeta
);


// ==========================================
// DRAG & DROP
// ==========================================

uploadArea.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

        uploadArea.classList.add(
            "dragover"
        );
    }
);


uploadArea.addEventListener(
    "dragleave",
    () => {

        uploadArea.classList.remove(
            "dragover"
        );
    }
);


uploadArea.addEventListener(
    "drop",
    event => {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragover"
        );


        const arquivo =
            event.dataTransfer.files[0];


        selecionarArquivo(
            arquivo
        );
    }
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

resetarInterface();