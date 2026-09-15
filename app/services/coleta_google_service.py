import csv
from pathlib import Path
from typing import Callable

import openpyxl

from app.services.google_streetview_provider import (
    GoogleStreetViewProvider,
)


def carregar_estabelecimentos(
    arquivo_base: Path,
) -> list[dict]:

    workbook = openpyxl.load_workbook(
        arquivo_base,
        read_only=True,
        data_only=True,
    )

    planilha = workbook.active

    cabecalho = [
        (
            str(celula.value).strip()
            if celula.value is not None
            else ""
        )
        for celula in planilha[1]
    ]

    indices = {
        nome: indice
        for indice, nome in enumerate(
            cabecalho
        )
    }

    obrigatorias = [
        "INSTALACAO",
        "LATITUDE",
        "LONGITUDE",
        "ENDERECO_NORMALIZADO",
    ]

    for coluna in obrigatorias:

        if coluna not in indices:

            workbook.close()

            raise ValueError(
                "Coluna obrigatória "
                f"não encontrada: {coluna}"
            )

    estabelecimentos = []

    for linha in planilha.iter_rows(
        min_row=2,
        values_only=True,
    ):

        instalacao = linha[
            indices["INSTALACAO"]
        ]

        if instalacao is None:
            continue

        endereco = linha[
            indices["ENDERECO_NORMALIZADO"]
        ]

        latitude = linha[
            indices["LATITUDE"]
        ]

        longitude = linha[
            indices["LONGITUDE"]
        ]

        estabelecimentos.append(
            {
                "instalacao": str(
                    instalacao
                ).strip(),
                "endereco": endereco,
                "latitude": latitude,
                "longitude": longitude,
            }
        )

    workbook.close()

    return estabelecimentos


def instalacao_ja_possui_imagem(
    instalacao: str,
    pasta_imagens: Path,
) -> bool:

    imagens = list(
        pasta_imagens.glob(
            f"{instalacao}_*.jpg"
        )
    )

    return len(imagens) > 0


def salvar_coleta(
    arquivo_coleta: Path,
    instalacao: str,
    endereco: str,
    data_imagem: str | None,
    status: str,
    metodo: str | None,
    arquivo: str | None,
):

    arquivo_coleta.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    arquivo_existe = (
        arquivo_coleta.exists()
    )

    with open(
        arquivo_coleta,
        mode="a",
        newline="",
        encoding="utf-8-sig",
    ) as arquivo_csv:

        writer = csv.writer(
            arquivo_csv
        )

        if not arquivo_existe:

            writer.writerow(
                [
                    "instalacao",
                    "endereco",
                    "data_imagem",
                    "status_coleta",
                    "metodo",
                    "arquivo",
                ]
            )

        writer.writerow(
            [
                instalacao,
                endereco,
                data_imagem,
                status,
                metodo,
                arquivo,
            ]
        )


def executar_coleta_google(
    arquivo_base: str | Path,
    pasta_imagens: str | Path = (
        "data/imagens"
    ),
    arquivo_coleta: str | Path = (
        "data/resultados/coleta.csv"
    ),
    limite: int | None = None,
    on_progress: Callable[
        [dict],
        None,
    ] | None = None,
) -> dict:
    """
    Executa a coleta de imagens do
    Google Street View.

    arquivo_base:
        Planilha escolhida pelo usuário.

    pasta_imagens:
        Pasta onde as imagens serão salvas.

    arquivo_coleta:
        CSV de auditoria da coleta.

    limite:
        Limite opcional de novas tentativas.

    on_progress:
        Callback usado pela interface.
    """

    arquivo_base = Path(
        arquivo_base
    )

    pasta_imagens = Path(
        pasta_imagens
    )

    arquivo_coleta = Path(
        arquivo_coleta
    )

    if not arquivo_base.exists():

        raise FileNotFoundError(
            "Planilha não encontrada: "
            f"{arquivo_base}"
        )

    pasta_imagens.mkdir(
        parents=True,
        exist_ok=True,
    )

    provider = (
        GoogleStreetViewProvider()
    )

    estabelecimentos = (
        carregar_estabelecimentos(
            arquivo_base
        )
    )

    total = len(
        estabelecimentos
    )

    processadas = 0
    baixadas = 0
    ignoradas = 0
    nao_encontradas = 0
    erros = 0

    def progresso(
        instalacao: str | None = None,
        mensagem: str = "",
    ):

        if on_progress is None:
            return

        on_progress(
            {
                "total": total,
                "processadas": processadas,
                "baixadas": baixadas,
                "ignoradas": ignoradas,
                "nao_encontradas":
                    nao_encontradas,
                "erros": erros,
                "instalacao": instalacao,
                "mensagem": mensagem,
            }
        )

    progresso(
        mensagem=(
            f"{total} instalações "
            "encontradas."
        )
    )

    for estabelecimento in (
        estabelecimentos
    ):

        instalacao = (
            estabelecimento[
                "instalacao"
            ]
        )

        endereco = (
            estabelecimento[
                "endereco"
            ]
        )

        latitude = (
            estabelecimento[
                "latitude"
            ]
        )

        longitude = (
            estabelecimento[
                "longitude"
            ]
        )

        # ==================================
        # JÁ POSSUI IMAGEM
        # ==================================

        if instalacao_ja_possui_imagem(
            instalacao,
            pasta_imagens,
        ):

            ignoradas += 1

            progresso(
                instalacao,
                (
                    f"{instalacao} já "
                    "possui imagem."
                ),
            )

            continue

        # ==================================
        # LIMITE
        # ==================================

        if (
            limite is not None
            and processadas >= limite
        ):
            break

        processadas += 1

        progresso(
            instalacao,
            (
                f"Buscando instalação "
                f"{instalacao}..."
            ),
        )

        try:

            metadata = None
            location_escolhida = None
            metodo = None

            # ==============================
            # 1. ENDEREÇO NORMALIZADO
            # ==============================

            if endereco:

                progresso(
                    instalacao,
                    (
                        "Buscando pelo "
                        "endereço normalizado..."
                    ),
                )

                metadata = (
                    provider.buscar_metadata(
                        location=str(
                            endereco
                        )
                    )
                )

                if (
                    metadata.get(
                        "status"
                    )
                    == "OK"
                ):

                    location_escolhida = (
                        str(endereco)
                    )

                    metodo = "ENDERECO"

            # ==============================
            # 2. FALLBACK COORDENADAS
            # ==============================

            if (
                metadata is None
                or metadata.get(
                    "status"
                )
                != "OK"
            ):

                if (
                    latitude is not None
                    and longitude is not None
                ):

                    coordenadas = (
                        f"{latitude},"
                        f"{longitude}"
                    )

                    progresso(
                        instalacao,
                        (
                            "Tentando pelas "
                            "coordenadas..."
                        ),
                    )

                    metadata = (
                        provider
                        .buscar_metadata(
                            location=(
                                coordenadas
                            )
                        )
                    )

                    if (
                        metadata.get(
                            "status"
                        )
                        == "OK"
                    ):

                        location_escolhida = (
                            coordenadas
                        )

                        metodo = (
                            "COORDENADAS"
                        )

            # ==============================
            # 3. NÃO ENCONTRADO
            # ==============================

            if (
                metadata is None
                or metadata.get(
                    "status"
                )
                != "OK"
                or location_escolhida
                is None
            ):

                nao_encontradas += 1

                salvar_coleta(
                    arquivo_coleta=(
                        arquivo_coleta
                    ),
                    instalacao=instalacao,
                    endereco=str(
                        endereco or ""
                    ),
                    data_imagem=None,
                    status=(
                        "NAO_ENCONTRADO"
                    ),
                    metodo=None,
                    arquivo=None,
                )

                progresso(
                    instalacao,
                    (
                        "Street View "
                        "não encontrado."
                    ),
                )

                continue

            # ==============================
            # 4. DATA DA IMAGEM
            # ==============================

            data_imagem = (
                metadata.get("date")
            )

            if not data_imagem:
                data_imagem = "sem_data"

            data_imagem = (
                str(data_imagem)
                .replace("/", "-")
                .replace("\\", "-")
            )

            # ==============================
            # 5. CAMINHO DA IMAGEM
            # ==============================

            caminho_imagem = (
                pasta_imagens
                / (
                    f"{instalacao}_"
                    f"{data_imagem}.jpg"
                )
            )

            # ==============================
            # 6. DOWNLOAD
            # ==============================

            provider.baixar_imagem(
                location=(
                    location_escolhida
                ),
                destino=caminho_imagem,
            )

            baixadas += 1

            # ==============================
            # 7. REGISTRA COLETA
            # ==============================

            salvar_coleta(
                arquivo_coleta=(
                    arquivo_coleta
                ),
                instalacao=instalacao,
                endereco=str(
                    endereco or ""
                ),
                data_imagem=(
                    data_imagem
                ),
                status="OK",
                metodo=metodo,
                arquivo=(
                    caminho_imagem.name
                ),
            )

            progresso(
                instalacao,
                (
                    "Imagem coletada: "
                    f"{caminho_imagem.name}"
                ),
            )

        except Exception as erro:

            erros += 1

            salvar_coleta(
                arquivo_coleta=(
                    arquivo_coleta
                ),
                instalacao=instalacao,
                endereco=str(
                    endereco or ""
                ),
                data_imagem=None,
                status="ERRO",
                metodo=None,
                arquivo=None,
            )

            progresso(
                instalacao,
                f"Erro: {erro}",
            )

    resultado = {
        "status": "concluido",
        "total": total,
        "processadas": processadas,
        "baixadas": baixadas,
        "ignoradas": ignoradas,
        "nao_encontradas":
            nao_encontradas,
        "erros": erros,
        "pasta_imagens": str(
            pasta_imagens
        ),
        "arquivo_coleta": str(
            arquivo_coleta
        ),
    }

    progresso(
        mensagem="Coleta finalizada."
    )

    return resultado