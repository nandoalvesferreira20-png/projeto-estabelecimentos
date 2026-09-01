from pathlib import Path

from app.services.classifier_service import analisar_fachada
from app.services.result_service import (
    salvar_resultado,
    carregar_arquivos_processados,
)


PASTA_IMAGENS = Path("data/imagens")

EXTENSOES_PERMITIDAS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

# ==========================================
# LIMITE DE TESTE
# ==========================================

# Desenvolvimento:
LIMITE_TESTE = None

# Produção:
# LIMITE_TESTE = None


def extrair_dados_arquivo(
    caminho_imagem: Path
) -> tuple[str, str]:
    """
    Extrai ID e data do nome da imagem.

    Exemplo:
    0056421541_2025-11.jpg

    retorna:
    ("0056421541", "2025-11")
    """

    nome = caminho_imagem.stem

    partes = nome.split(
        "_",
        maxsplit=1
    )

    id_instalacao = partes[0].strip()

    if len(partes) > 1 and partes[1].strip():
        data_imagem = partes[1].strip()
    else:
        data_imagem = "N/D"

    return (
        id_instalacao,
        data_imagem
    )


def processar_lote():

    # ======================================
    # VERIFICA PASTA
    # ======================================

    if not PASTA_IMAGENS.exists():

        print(
            f"✗ Pasta não encontrada: "
            f"{PASTA_IMAGENS}"
        )

        return

    # ======================================
    # LISTA IMAGENS
    # ======================================

    imagens = sorted([
        caminho
        for caminho in PASTA_IMAGENS.iterdir()
        if (
            caminho.is_file()
            and caminho.suffix.lower()
            in EXTENSOES_PERMITIDAS
        )
    ])

    total = len(imagens)

    print(
        f"\n{total} imagens encontradas."
    )

    if LIMITE_TESTE is None:

        print(
            "Modo: PROCESSAMENTO COMPLETO\n"
        )

    else:

        print(
            f"Modo: TESTE "
            f"({LIMITE_TESTE} novas análises)\n"
        )

    if total == 0:

        print(
            "Nenhuma imagem disponível "
            "para processamento."
        )

        return

    # ======================================
    # CARREGA IDS JÁ PROCESSADOS
    # ======================================

    ids_processados = (
        carregar_arquivos_processados()
    )

    novas_analisadas = 0
    ignoradas = 0
    erros = 0

    # Quantas imagens NOVAS foram tentadas
    tentativas = 0

    # ======================================
    # PROCESSAMENTO
    # ======================================

    for indice, caminho_imagem in enumerate(
        imagens,
        start=1
    ):

        id_instalacao, data_imagem = (
            extrair_dados_arquivo(
                caminho_imagem
            )
        )

        # ==================================
        # JÁ PROCESSADO
        # NÃO CONTA NO LIMITE
        # ==================================

        if id_instalacao in ids_processados:

            ignoradas += 1

            print(
                f"[{indice}/{total}] "
                f"⏭ Instalação "
                f"{id_instalacao} "
                f"já foi processada."
            )

            continue

        # ==================================
        # LIMITE DE TESTE
        # ==================================

        if (
            LIMITE_TESTE is not None
            and tentativas >= LIMITE_TESTE
        ):
            break

        # Essa é uma imagem nova.
        tentativas += 1

        print(
            f"\n[{tentativas}"
            f"/"
            f"{LIMITE_TESTE if LIMITE_TESTE is not None else total}]"
        )

        print(
            f"Analisando instalação: "
            f"{id_instalacao}"
        )

        print(
            f"Data da imagem: "
            f"{data_imagem}"
        )

        print(
            f"Arquivo: "
            f"{caminho_imagem.name}"
        )

        try:

            # ==================================
            # LÊ IMAGEM
            # ==================================

            with open(
                caminho_imagem,
                "rb"
            ) as arquivo:

                imagem_bytes = (
                    arquivo.read()
                )

            # ==================================
            # IA
            # ==================================

            resultado = analisar_fachada(
                imagem_bytes
            )

            # ==================================
            # SALVA NO EXCEL
            # ==================================

            salvar_resultado(
                id_instalacao=id_instalacao,
                data_imagem=data_imagem,
                status=resultado.status,
                confianca=resultado.confianca,
                motivo_principal=resultado.motivo_principal,
                evidencias=resultado.evidencias,
                requer_revisao=resultado.requer_revisao
            )

            # Marca como processado imediatamente
            ids_processados.add(
                id_instalacao
            )

            novas_analisadas += 1

            print(
                f"✓ Status: "
                f"{resultado.status}"
            )

            print(
                f"✓ Confiança: "
                f"{resultado.confianca:.0%}"
            )

            print(
                f"✓ Motivo: "
                f"{resultado.motivo_principal}"
            )

            print(
                f"✓ Revisão necessária: "
                f"{'SIM' if resultado.requer_revisao else 'NÃO'}"
            )

        except Exception as erro:

            erros += 1

            print(
                f"✗ Erro ao processar "
                f"{caminho_imagem.name}: "
                f"{erro}"
            )

    # ======================================
    # RESUMO
    # ======================================

    print(
        "\n=============================="
    )

    print(
        "PROCESSAMENTO FINALIZADO"
    )

    print(
        "=============================="
    )

    print(
        f"Imagens encontradas: "
        f"{total}"
    )

    print(
        f"Novas tentativas: "
        f"{tentativas}"
    )

    print(
        f"Análises concluídas: "
        f"{novas_analisadas}"
    )

    print(
        f"Já processadas: "
        f"{ignoradas}"
    )

    print(
        f"Erros: "
        f"{erros}"
    )

    print(
        "\nResultado salvo em:"
    )

    print(
        "data/resultados/resultados.xlsx"
    )


if __name__ == "__main__":
    processar_lote()