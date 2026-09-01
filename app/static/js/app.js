// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================

let resultadosOriginais = [];
let resultados = [];

let indiceAtual = 0;


// ==========================================
// CARREGAR RESULTADOS
// ==========================================

async function carregarResultados() {

    try {

        const resposta = await fetch(
            "/resultados"
        );

        if (!resposta.ok) {

            throw new Error(
                `Erro HTTP: ${resposta.status}`
            );
        }

        const dados = await resposta.json();

        resultadosOriginais =
            dados.resultados || [];

        resultados = [
            ...resultadosOriginais
        ];

        if (resultados.length === 0) {

            console.log(
                "Nenhum resultado encontrado."
            );

            mostrarSemResultados();

            return;
        }

        indiceAtual = 0;

        mostrarResultado();

    } catch (erro) {

        console.error(
            "Erro ao carregar resultados:",
            erro
        );
    }
}


// ==========================================
// MOSTRAR RESULTADO
// ==========================================

function mostrarResultado() {

    if (resultados.length === 0) {

        mostrarSemResultados();

        return;
    }

    const resultado =
        resultados[indiceAtual];


    // ======================================
    // DADOS BÁSICOS
    // ======================================

    document.getElementById(
        "id-instalacao"
    ).textContent =
        resultado.id_instalacao;


    document.getElementById(
        "data-imagem"
    ).textContent =
        resultado.data_imagem;

// ======================================
// IMAGEM
// ======================================

const imagem =
    document.getElementById(
        "imagem-fachada"
    );

if (resultado.imagem) {

    imagem.removeAttribute(
        "src"
    );

    setTimeout(
        () => {

            imagem.src =
                `${resultado.imagem}?t=${Date.now()}`;

            imagem.style.display =
                "block";
        },
        10
    );

} else {

    imagem.removeAttribute(
        "src"
    );

    imagem.style.display =
        "none";
}


    // ======================================
    // STATUS
    // ======================================

    const statusElemento =
        document.getElementById(
            "status"
        );

    const status =
        String(
            resultado.status ||
            "INCONCLUSIVO"
        )
            .trim()
            .toUpperCase();


    statusElemento.textContent =
        formatarStatus(
            status
        );


    statusElemento.className =
        "status";


    if (status === "ATIVO") {

        statusElemento.classList.add(
            "ativo"
        );

    } else if (
        status ===
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


    // ======================================
    // CONFIANÇA
    // ======================================

    const valorConfianca =
        Number(
            resultado.confianca || 0
        );


    const confianca =
        Math.round(
            valorConfianca * 100
        );


    document.getElementById(
        "confianca"
    ).textContent =
        `${confianca}%`;


    document.getElementById(
        "barra-confianca"
    ).style.width =
        `${confianca}%`;


    // ======================================
    // MOTIVO PRINCIPAL
    // ======================================

    document.getElementById(
        "motivo"
    ).textContent =
        resultado.motivo_principal ||
        "Não informado";


    // ======================================
    // EVIDÊNCIAS
    // ======================================

    const lista =
        document.getElementById(
            "evidencias"
        );


    lista.innerHTML = "";


    const evidencias =
        resultado.evidencias || [];


    if (evidencias.length === 0) {

        const item =
            document.createElement(
                "li"
            );

        item.textContent =
            "Nenhuma evidência informada.";

        lista.appendChild(
            item
        );

    } else {

        evidencias.forEach(
            evidencia => {

                const item =
                    document.createElement(
                        "li"
                    );

                item.textContent =
                    evidencia;

                lista.appendChild(
                    item
                );
            }
        );
    }


    // ======================================
    // REVISÃO
    // ======================================

    const revisao =
        document.getElementById(
            "revisao"
        );


    if (
        resultado.requer_revisao
    ) {

        revisao.textContent =
            "⚠ A IA recomenda revisão deste caso.";

        revisao.className =
            "revisao necessaria";

    } else {

        revisao.textContent = "";

        revisao.className =
            "revisao";
    }


    // ======================================
    // NAVEGAÇÃO
    // ======================================

    atualizarNavegacao();
}


// ==========================================
// SEM RESULTADOS
// ==========================================

function mostrarSemResultados() {

    document.getElementById(
        "id-instalacao"
    ).textContent = "-";


    document.getElementById(
        "data-imagem"
    ).textContent = "-";


    document.getElementById(
        "status"
    ).textContent =
        "Nenhum resultado";


    document.getElementById(
        "confianca"
    ).textContent =
        "0%";


    document.getElementById(
        "barra-confianca"
    ).style.width =
        "0%";


    document.getElementById(
        "motivo"
    ).textContent =
        "Nenhum estabelecimento encontrado.";


    document.getElementById(
        "evidencias"
    ).innerHTML = "";


    document.getElementById(
        "revisao"
    ).className =
        "revisao";


    const imagem =
        document.getElementById(
            "imagem-fachada"
        );

    imagem.removeAttribute(
        "src"
    );

    imagem.style.display =
        "none";


    document.getElementById(
        "posicao"
    ).textContent =
        "0 / 0";


    document.getElementById(
        "contador-inferior"
    ).textContent =
        "0 de 0";


    document.getElementById(
        "btn-anterior"
    ).disabled =
        true;


    document.getElementById(
        "btn-proximo"
    ).disabled =
        true;
}


// ==========================================
// FORMATAR STATUS
// ==========================================

function formatarStatus(status) {

    return String(status)
        .replaceAll(
            "_",
            " "
        );
}


// ==========================================
// NAVEGAÇÃO
// ==========================================

function atualizarNavegacao() {

    const total =
        resultados.length;


    const atual =
        indiceAtual + 1;


    document.getElementById(
        "posicao"
    ).textContent =
        `${atual} / ${total}`;


    document.getElementById(
        "contador-inferior"
    ).textContent =
        `${atual} de ${total}`;


    document.getElementById(
        "btn-anterior"
    ).disabled =
        indiceAtual === 0;


    document.getElementById(
        "btn-proximo"
    ).disabled =
        indiceAtual ===
        total - 1;
}


// ==========================================
// BOTÃO ANTERIOR
// ==========================================

document.getElementById(
    "btn-anterior"
).addEventListener(
    "click",
    () => {

        if (indiceAtual > 0) {

            indiceAtual--;

            mostrarResultado();
        }
    }
);


// ==========================================
// BOTÃO PRÓXIMO
// ==========================================

document.getElementById(
    "btn-proximo"
).addEventListener(
    "click",
    () => {

        if (
            indiceAtual <
            resultados.length - 1
        ) {

            indiceAtual++;

            mostrarResultado();
        }
    }
);


// ==========================================
// PESQUISA POR INSTALAÇÃO
// ==========================================

function buscarInstalacao() {

    const campo =
        document.getElementById(
            "campo-busca"
        );


    const valor =
        campo.value
            .trim()
            .toLowerCase();


    // Se apagar a pesquisa,
    // volta para todos
    if (!valor) {

        resultados = [
            ...resultadosOriginais
        ];

        indiceAtual = 0;

        limparFiltroVisual();

        ativarFiltroVisual(
            "TODOS"
        );

        mostrarResultado();

        return;
    }


    const encontrados =
        resultadosOriginais.filter(
            resultado => {

                const id =
                    String(
                        resultado.id_instalacao
                    )
                        .trim()
                        .toLowerCase();

                return id.includes(
                    valor
                );
            }
        );


    if (
        encontrados.length === 0
    ) {

        alert(
            "Instalação não encontrada."
        );

        return;
    }


    resultados =
        encontrados;


    indiceAtual = 0;


    limparFiltroVisual();


    mostrarResultado();
}


// ==========================================
// BOTÃO BUSCAR
// ==========================================

document.getElementById(
    "btn-buscar"
).addEventListener(
    "click",
    buscarInstalacao
);


// ==========================================
// ENTER NA PESQUISA
// ==========================================

document.getElementById(
    "campo-busca"
).addEventListener(
    "keydown",
    evento => {

        if (
            evento.key === "Enter"
        ) {

            buscarInstalacao();
        }
    }
);


// ==========================================
// FILTROS
// ==========================================

const botoesFiltro =
    document.querySelectorAll(
        ".filtro-btn"
    );


botoesFiltro.forEach(
    botao => {

        botao.addEventListener(
            "click",
            () => {

                const filtro =
                    botao.dataset.filtro;


                aplicarFiltro(
                    filtro
                );


                limparFiltroVisual();


                botao.classList.add(
                    "ativo-filtro"
                );
            }
        );
    }
);


// ==========================================
// APLICAR FILTRO
// ==========================================

function aplicarFiltro(
    filtro
) {

    // Limpa pesquisa
    document.getElementById(
        "campo-busca"
    ).value = "";


    if (
        filtro === "TODOS"
    ) {

        resultados = [
            ...resultadosOriginais
        ];

    } else if (
        filtro === "REVISAO"
    ) {

        resultados =
            resultadosOriginais.filter(
                resultado =>
                    resultado
                        .requer_revisao
                    === true
            );

    } else {

        resultados =
            resultadosOriginais.filter(
                resultado => {

                    const status =
                        String(
                            resultado.status
                        )
                            .trim()
                            .toUpperCase();

                    return status ===
                        filtro;
                }
            );
    }


    indiceAtual = 0;


    if (
        resultados.length === 0
    ) {

        mostrarSemResultados();

        return;
    }


    mostrarResultado();
}


// ==========================================
// LIMPAR VISUAL DOS FILTROS
// ==========================================

function limparFiltroVisual() {

    botoesFiltro.forEach(
        botao => {

            botao.classList.remove(
                "ativo-filtro"
            );
        }
    );
}


// ==========================================
// ATIVAR FILTRO VISUAL
// ==========================================

function ativarFiltroVisual(
    filtro
) {

    const botao =
        document.querySelector(
            `[data-filtro="${filtro}"]`
        );


    if (botao) {

        botao.classList.add(
            "ativo-filtro"
        );
    }
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================
// ==========================================
// ANÁLISE INDIVIDUAL
// ==========================================

const inputImagem =
    document.getElementById(
        "input-imagem"
    );

const botaoAnalisarImagem =
    document.getElementById(
        "btn-analisar-imagem"
    );

const previewImagem =
    document.getElementById(
        "preview-imagem-individual"
    );


// ==========================================
// PREVIEW
// ==========================================

inputImagem.addEventListener(
    "change",
    () => {

        const arquivo =
            inputImagem.files[0];

        if (!arquivo) {
            return;
        }

        const url =
            URL.createObjectURL(
                arquivo
            );

        previewImagem.src = url;

        document.getElementById(
            "resultado-individual"
        ).classList.add(
            "visivel"
        );
    }
);


// ==========================================
// ANALISAR IMAGEM
// ==========================================

botaoAnalisarImagem.addEventListener(
    "click",
    async () => {

        const arquivo =
            inputImagem.files[0];

        if (!arquivo) {

            alert(
                "Selecione uma imagem primeiro."
            );

            return;
        }


        const statusAnalise =
            document.getElementById(
                "status-analise-individual"
            );


        botaoAnalisarImagem.disabled =
            true;


        statusAnalise.textContent =
            "Analisando imagem com IA...";


        try {

            const formulario =
                new FormData();


            formulario.append(
                "imagem",
                arquivo
            );


            const resposta =
                await fetch(
                    "/analisar-fachada",
                    {
                        method: "POST",
                        body: formulario
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro ao analisar imagem."
                );
            }


            mostrarResultadoIndividual(
                dados
            );


            statusAnalise.textContent =
                "Análise concluída.";

        } catch (erro) {

            console.error(
                erro
            );


            statusAnalise.textContent =
                `Erro: ${erro.message}`;

        } finally {

            botaoAnalisarImagem.disabled =
                false;
        }
    }
);


// ==========================================
// MOSTRAR RESULTADO INDIVIDUAL
// ==========================================

function mostrarResultadoIndividual(
    resultado
) {

    const status =
        String(
            resultado.status ||
            "INCONCLUSIVO"
        )
            .trim()
            .toUpperCase();


    const statusElemento =
        document.getElementById(
            "status-individual"
        );


    statusElemento.textContent =
        formatarStatus(
            status
        );


    statusElemento.className =
        "status";


    if (status === "ATIVO") {

        statusElemento.classList.add(
            "ativo"
        );

    } else if (
        status ===
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


    const confianca =
        Math.round(
            Number(
                resultado.confianca || 0
            ) * 100
        );


    document.getElementById(
        "confianca-individual"
    ).textContent =
        `${confianca}%`;


    document.getElementById(
        "barra-confianca-individual"
    ).style.width =
        `${confianca}%`;


    document.getElementById(
        "motivo-individual"
    ).textContent =
        resultado.motivo_principal ||
        "Não informado";


    const lista =
        document.getElementById(
            "evidencias-individual"
        );


    lista.innerHTML = "";


    const evidencias =
        resultado.evidencias || [];


    evidencias.forEach(
        evidencia => {

            const item =
                document.createElement(
                    "li"
                );

            item.textContent =
                evidencia;

            lista.appendChild(
                item
            );
        }
    );


    const revisao =
        document.getElementById(
            "revisao-individual"
        );


    if (
        resultado.requer_revisao
    ) {

        revisao.textContent =
            "⚠ A IA recomenda revisão deste caso.";

        revisao.className =
            "revisao necessaria";

    } else {

        revisao.textContent = "";

        revisao.className =
            "revisao";
    }


    document.getElementById(
        "resultado-individual"
    ).classList.add(
        "visivel"
    );
}

carregarResultados();