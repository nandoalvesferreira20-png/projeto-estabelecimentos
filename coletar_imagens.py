import csv
from pathlib import Path

from app.services.image_provider import KartaViewProvider


PASTA_IMAGENS = Path("data/imagens")
ARQUIVO_COLETA = Path("data/resultados/coleta.csv")


ESTABELECIMENTOS = [
    {
        "id": "002",
        "latitude": -23.667554898372,
        "longitude": -46.654544323349
    }
]


def salvar_coleta(
    estabelecimento: dict,
    foto: dict,
    caminho_imagem: Path
):
    ARQUIVO_COLETA.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    arquivo_existe = ARQUIVO_COLETA.exists()

    with open(
        ARQUIVO_COLETA,
        mode="a",
        newline="",
        encoding="utf-8-sig"
    ) as arquivo:

        writer = csv.writer(arquivo)

        if not arquivo_existe:
            writer.writerow([
                "id_estabelecimento",
                "latitude_base",
                "longitude_base",
                "latitude_foto",
                "longitude_foto",
                "data_foto",
                "heading",
                "arquivo"
            ])

        writer.writerow([
            estabelecimento["id"],
            estabelecimento["latitude"],
            estabelecimento["longitude"],
            foto.get("lat"),
            foto.get("lng"),
            foto.get("shotDate"),
            foto.get("heading"),
            caminho_imagem.name
        ])


def coletar():

    provider = KartaViewProvider()

    for estabelecimento in ESTABELECIMENTOS:

        identificador = estabelecimento["id"]

        caminho_imagem = (
            PASTA_IMAGENS /
            f"{identificador}.jpg"
        )

        if caminho_imagem.exists():
            print(
                f"⏭ {identificador} já possui imagem."
            )
            continue

        print(
            f"Buscando fachada do estabelecimento "
            f"{identificador}..."
        )

        try:
            fotos = provider.buscar_fotos(
                estabelecimento["latitude"],
                estabelecimento["longitude"]
            )

            if not fotos:
                print("✗ Nenhuma imagem próxima encontrada.")
                continue

            foto = fotos[0]

            url = (
                foto.get("fileurlProc")
                or foto.get("fileurl")
                or foto.get("fileurlTh")
            )

            if not url:
                print("✗ Foto sem URL disponível.")
                continue

            provider.baixar_imagem(
                url=url,
                destino=caminho_imagem
            )

            salvar_coleta(
                estabelecimento,
                foto,
                caminho_imagem
            )

            print(
                f"✓ Imagem salva: {caminho_imagem}"
            )

        except Exception as erro:
            print(
                f"✗ Erro em {identificador}: {erro}"
            )


if __name__ == "__main__":
    coletar()