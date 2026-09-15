import csv
from pathlib import Path

import openpyxl

from app.services.google_streetview_provider import (
    GoogleStreetViewProvider
)


ARQUIVO_BASE = Path("base_normalizada.xlsx")
PASTA_IMAGENS = Path("data/imagens")

ARQUIVO_COLETA = Path(
    "data/resultados/coleta.csv"
)

# Durante os testes:
LIMITE_TESTE = None

# Quando quisermos rodar tudo:
# LIMITE_TESTE = None


def carregar_estabelecimentos():

    workbook = openpyxl.load_workbook(
        ARQUIVO_BASE,
        read_only=True,
        data_only=True
    )

    planilha = workbook.active

    cabecalho = [
        str(celula.value).strip()
        if celula.value is not None
        else ""
        for celula in planilha[1]
    ]

    indices = {
        nome: indice
        for indice, nome in enumerate(cabecalho)
    }

    obrigatorias = [
        "INSTALACAO",
        "LATITUDE",
        "LONGITUDE",
        "ENDERECO_NORMALIZADO"
    ]

    for coluna in obrigatorias:
        if coluna not in indices:
            workbook.close()

            raise ValueError(
                f"Coluna obrigatória não encontrada: "
                f"{coluna}"
            )

    estabelecimentos = []

    for linha in planilha.iter_rows(
        min_row=2,
        values_only=True
    ):

        instalacao = linha[
            indices["INSTALACAO"]
        ]

        if instalacao is None:
            continue

        endereco_normalizado = linha[
            indices["ENDERECO_NORMALIZADO"]
        ]

        latitude = linha[
            indices["LATITUDE"]
        ]

        longitude = linha[
            indices["LONGITUDE"]
        ]

        estabelecimentos.append({
            "instalacao": str(instalacao).strip(),
            "endereco": endereco_normalizado,
            "latitude": latitude,
            "longitude": longitude
        })

    workbook.close()

    return estabelecimentos


def instalacao_ja_possui_imagem(
    instalacao: str
) -> bool:

    imagens = list(
        PASTA_IMAGENS.glob(
            f"{instalacao}_*.jpg"
        )
    )

    return len(imagens) > 0


def salvar_coleta(
    instalacao: str,
    endereco: str,
    data_imagem: str | None,
    status: str,
    metodo: str | None,
    arquivo: str | None
):

    ARQUIVO_COLETA.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    arquivo_existe = (
        ARQUIVO_COLETA.exists()
    )

    with open(
        ARQUIVO_COLETA,
        mode="a",
        newline="",
        encoding="utf-8-sig"
    ) as arquivo_csv:

        writer = csv.writer(
            arquivo_csv
        )

        if not arquivo_existe:

            writer.writerow([
                "instalacao",
                "endereco",
                "data_imagem",
                "status_coleta",
                "metodo",
                "arquivo"
            ])

        writer.writerow([
            instalacao,
            endereco,
            data_imagem,
            status,
            metodo,
            arquivo
        ])


def coletar():

    provider = GoogleStreetViewProvider()

    PASTA_IMAGENS.mkdir(
        parents=True,
        exist_ok=True
    )

    estabelecimentos = (
        carregar_estabelecimentos()
    )

    print(
        f"\n{len(estabelecimentos)} "
        f"instalações encontradas."
    )

    processadas = 0
    baixadas = 0
    nao_encontradas = 0
    erros = 0

    for estabelecimento in estabelecimentos:

        instalacao = (
            estabelecimento["instalacao"]
        )

        endereco = (
            estabelecimento["endereco"]
        )

        latitude = (
            estabelecimento["latitude"]
        )

        longitude = (
            estabelecimento["longitude"]
        )

        # --------------------------------
        # Já existe imagem
        # --------------------------------

        if instalacao_ja_possui_imagem(
            instalacao
        ):

            print(
                f"⏭ {instalacao} já possui imagem."
            )

            continue

        # --------------------------------
        # Limite de teste
        # --------------------------------

        if (
            LIMITE_TESTE is not None
            and processadas >= LIMITE_TESTE
        ):
            break

        processadas += 1

        print(
            f"\n[{processadas}] "
            f"Instalação {instalacao}"
        )

        try:

            metadata = None
            location_escolhida = None
            metodo = None

            # ==================================
            # 1. ENDEREÇO NORMALIZADO
            # ==================================

            if endereco:

                print(
                    f"Buscando: {endereco}"
                )

                metadata = (
                    provider.buscar_metadata(
                        location=str(endereco)
                    )
                )

                if metadata.get(
                    "status"
                ) == "OK":

                    location_escolhida = str(
                        endereco
                    )

                    metodo = "ENDERECO"

            # ==================================
            # 2. FALLBACK LAT/LON
            # ==================================

            if (
                metadata is None
                or metadata.get("status") != "OK"
            ):

                print(
                    "⚠ Endereço não retornou "
                    "Street View."
                )

                if (
                    latitude is not None
                    and longitude is not None
                ):

                    coordenadas = (
                        f"{latitude},{longitude}"
                    )

                    print(
                        "Tentando coordenadas: "
                        f"{coordenadas}"
                    )

                    metadata = (
                        provider.buscar_metadata(
                            location=coordenadas
                        )
                    )

                    if metadata.get(
                        "status"
                    ) == "OK":

                        location_escolhida = (
                            coordenadas
                        )

                        metodo = "COORDENADAS"

            # ==================================
            # 3. NÃO ENCONTROU
            # ==================================

            if (
                metadata is None
                or metadata.get("status") != "OK"
                or location_escolhida is None
            ):

                nao_encontradas += 1

                print(
                    "✗ Street View não encontrado."
                )

                salvar_coleta(
                    instalacao=instalacao,
                    endereco=str(
                        endereco or ""
                    ),
                    data_imagem=None,
                    status="NAO_ENCONTRADO",
                    metodo=None,
                    arquivo=None
                )

                continue

            # ==================================
            # 4. DATA
            # ==================================

            data_imagem = metadata.get(
                "date"
            )

            if not data_imagem:
                data_imagem = "sem_data"

            data_imagem = str(
                data_imagem
            ).replace(
                "/",
                "-"
            ).replace(
                "\\",
                "-"
            )

            print(
                "✓ Street View encontrado."
            )

            print(
                f"Data: {data_imagem}"
            )

            print(
                f"Método: {metodo}"
            )

            # ==================================
            # 5. NOME DA IMAGEM
            # ==================================

            caminho_imagem = (
                PASTA_IMAGENS
                / f"{instalacao}_{data_imagem}.jpg"
            )

            # ==================================
            # 6. DOWNLOAD
            # ==================================

            provider.baixar_imagem(
                location=location_escolhida,
                destino=caminho_imagem
            )

            baixadas += 1

            print(
                f"✓ Salva: "
                f"{caminho_imagem.name}"
            )

            # ==================================
            # 7. REGISTRA COLETA
            # ==================================

            salvar_coleta(
                instalacao=instalacao,
                endereco=str(
                    endereco or ""
                ),
                data_imagem=data_imagem,
                status="OK",
                metodo=metodo,
                arquivo=caminho_imagem.name
            )

        except Exception as erro:

            erros += 1

            print(
                f"✗ Erro em {instalacao}: "
                f"{erro}"
            )

            salvar_coleta(
                instalacao=instalacao,
                endereco=str(
                    endereco or ""
                ),
                data_imagem=None,
                status="ERRO",
                metodo=None,
                arquivo=None
            )

    print("\n==============================")
    print("COLETA FINALIZADA")
    print("==============================")

    print(
        f"Tentadas: {processadas}"
    )

    print(
        f"Imagens baixadas: {baixadas}"
    )

    print(
        f"Não encontradas: {nao_encontradas}"
    )

    print(
        f"Erros: {erros}"
    )


if __name__ == "__main__":
    coletar()