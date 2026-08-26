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
    ".webp"
}


def processar_lote():
    imagens = [
        caminho
        for caminho in PASTA_IMAGENS.iterdir()
        if caminho.suffix.lower() in EXTENSOES_PERMITIDAS
    ]

    total = len(imagens)

    print(f"{total} imagens encontradas.\n")

    arquivos_processados = carregar_arquivos_processados()

    for indice, caminho_imagem in enumerate(imagens, start=1):

        if caminho_imagem.name in arquivos_processados:
            print(
                f"[{indice}/{total}] "
                f"⏭ {caminho_imagem.name} já foi processada."
            )
            continue

        print(
            f"[{indice}/{total}] "
            f"Analisando {caminho_imagem.name}..."
        )

        try:
            with open(caminho_imagem, "rb") as arquivo:
                imagem_bytes = arquivo.read()

            resultado = analisar_fachada(imagem_bytes)

            salvar_resultado(
                nome_arquivo=caminho_imagem.name,
                status=resultado.status,
                confianca=resultado.confianca,
                motivo_principal=resultado.motivo_principal,
                evidencias=resultado.evidencias,
                requer_revisao=resultado.requer_revisao
            )

            print(
                f"✓ {resultado.status} "
                f"| confiança: {resultado.confianca:.0%}"
            )

            print(
                f"Motivo: {resultado.motivo_principal}"
            )

        except Exception as erro:
            print(
                f"✗ Erro ao processar "
                f"{caminho_imagem.name}: {erro}"
            )

        print()

    print("Processamento finalizado.")


if __name__ == "__main__":
    processar_lote()