from pathlib import Path
from typing import Callable

from app.services.classifier_service import (
    analisar_fachada,
)
from app.services.result_service import (
    salvar_resultado,
    carregar_arquivos_processados,
)


EXTENSOES_PERMITIDAS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}


# ==========================================
# EXTRAIR DADOS DO ARQUIVO
# ==========================================

def extrair_dados_arquivo(
    caminho_imagem: Path,
) -> tuple[str, str]:
    """
    Extrai instalação e data do nome.

    Exemplo:

    0056421541_2025-11.jpg

    retorna:

    ("0056421541", "2025-11")
    """

    nome = caminho_imagem.stem

    partes = nome.split(
        "_",
        maxsplit=1,
    )

    id_instalacao = (
        partes[0].strip()
    )

    if (
        len(partes) > 1
        and partes[1].strip()
    ):

        data_imagem = (
            partes[1].strip()
        )

    else:

        data_imagem = "N/D"

    return (
        id_instalacao,
        data_imagem,
    )


# ==========================================
# EXECUTAR ANÁLISE EM LOTE
# ==========================================

def executar_analise_lote(
    pasta_imagens: str | Path,
    limite: int | None = None,
    on_progress: Callable[
        [dict],
        None,
    ] | None = None,
) -> dict:

    pasta_imagens = Path(
        pasta_imagens
    )

    # ======================================
    # VERIFICA PASTA
    # ======================================

    if not pasta_imagens.exists():

        raise FileNotFoundError(
            "Pasta de imagens "
            "não encontrada: "
            f"{pasta_imagens}"
        )

    if not pasta_imagens.is_dir():

        raise ValueError(
            "O caminho informado "
            "não é uma pasta."
        )

    # ======================================
    # LISTA IMAGENS
    # ======================================

    imagens = sorted(
        [
            caminho
            for caminho
            in pasta_imagens.iterdir()
            if (
                caminho.is_file()
                and caminho.suffix.lower()
                in EXTENSOES_PERMITIDAS
            )
        ]
    )

    total = len(
        imagens
    )

    if total == 0:

        raise ValueError(
            "Nenhuma imagem válida "
            "foi encontrada na pasta."
        )

    # ======================================
    # CARREGA PROCESSADOS
    # ======================================

    ids_processados = (
        carregar_arquivos_processados()
    )

    # ======================================
    # CONTADORES
    # ======================================

    tentativas = 0
    analisadas = 0
    ignoradas = 0
    erros = 0

    ativos = 0
    possivelmente_inativos = 0
    inconclusivos = 0

    revisoes = 0

    # ======================================
    # CALLBACK
    # ======================================

    def progresso(
        instalacao: str | None = None,
        mensagem: str = "",
        status: str | None = None,
        confianca: float | None = None,
    ):

        if on_progress is None:
            return

        on_progress(
            {
                "total": total,

                "tentativas":
                    tentativas,

                "analisadas":
                    analisadas,

                "ignoradas":
                    ignoradas,

                "erros":
                    erros,

                "ativos":
                    ativos,

                "possivelmente_inativos":
                    possivelmente_inativos,

                "inconclusivos":
                    inconclusivos,

                "revisoes":
                    revisoes,

                "instalacao":
                    instalacao,

                "status":
                    status,

                "confianca":
                    confianca,

                "mensagem":
                    mensagem,
            }
        )

    # ======================================
    # INÍCIO
    # ======================================

    progresso(
        mensagem=(
            f"{total} imagens "
            "encontradas."
        )
    )

    # ======================================
    # PROCESSAMENTO
    # ======================================

    for indice, caminho_imagem in enumerate(
        imagens,
        start=1,
    ):

        id_instalacao, data_imagem = (
            extrair_dados_arquivo(
                caminho_imagem
            )
        )

        # ==================================
        # JÁ PROCESSADO
        # ==================================

        if (
            id_instalacao
            in ids_processados
        ):

            ignoradas += 1

            progresso(
                instalacao=(
                    id_instalacao
                ),
                mensagem=(
                    f"Instalação "
                    f"{id_instalacao} "
                    "já processada."
                ),
            )

            continue

        # ==================================
        # LIMITE
        # ==================================

        if (
            limite is not None
            and tentativas >= limite
        ):

            break

        tentativas += 1

        progresso(
            instalacao=id_instalacao,
            mensagem=(
                f"Analisando "
                f"{id_instalacao}..."
            ),
        )

        try:

            # ==============================
            # LÊ IMAGEM
            # ==============================

            imagem_bytes = (
                caminho_imagem.read_bytes()
            )

            # ==============================
            # IA
            # ==============================

            resultado = (
                analisar_fachada(
                    imagem_bytes
                )
            )

            # ==============================
            # SALVA RESULTADO
            # ==============================

            salvar_resultado(
                id_instalacao=(
                    id_instalacao
                ),
                data_imagem=(
                    data_imagem
                ),
                status=(
                    resultado.status
                ),
                confianca=(
                    resultado.confianca
                ),
                motivo_principal=(
                    resultado
                    .motivo_principal
                ),
                evidencias=(
                    resultado.evidencias
                ),
                requer_revisao=(
                    resultado
                    .requer_revisao
                ),
            )

            # ==============================
            # MARCA PROCESSADO
            # ==============================

            ids_processados.add(
                id_instalacao
            )

            analisadas += 1

            # ==============================
            # CONTADORES DE STATUS
            # ==============================

            status_normalizado = (
                str(
                    resultado.status
                )
                .strip()
                .upper()
            )

            if (
                status_normalizado
                == "ATIVO"
            ):

                ativos += 1

            elif (
                status_normalizado
                == "POSSIVELMENTE_INATIVO"
            ):

                possivelmente_inativos += 1

            else:

                inconclusivos += 1

            # ==============================
            # REVISÃO
            # ==============================

            if (
                resultado
                .requer_revisao
            ):

                revisoes += 1

            # ==============================
            # PROGRESSO
            # ==============================

            progresso(
                instalacao=(
                    id_instalacao
                ),
                status=(
                    resultado.status
                ),
                confianca=(
                    resultado.confianca
                ),
                mensagem=(
                    f"{id_instalacao} "
                    f"classificada como "
                    f"{resultado.status} "
                    f"com confiança de "
                    f"{resultado.confianca:.0%}."
                ),
            )

        except Exception as erro:

            erros += 1

            progresso(
                instalacao=(
                    id_instalacao
                ),
                mensagem=(
                    f"Erro ao processar "
                    f"{caminho_imagem.name}: "
                    f"{erro}"
                ),
            )

    # ======================================
    # RESULTADO FINAL
    # ======================================

    resultado_final = {

        "status": "concluido",

        "total":
            total,

        "tentativas":
            tentativas,

        "analisadas":
            analisadas,

        "ignoradas":
            ignoradas,

        "erros":
            erros,

        "ativos":
            ativos,

        "possivelmente_inativos":
            possivelmente_inativos,

        "inconclusivos":
            inconclusivos,

        "revisoes":
            revisoes,

        "pasta_imagens":
            str(
                pasta_imagens
            ),

        "arquivo_resultados":
            (
                "data/resultados/"
                "resultados.xlsx"
            ),
    }

    progresso(
        mensagem=(
            "Processamento "
            "finalizado."
        )
    )

    return resultado_final