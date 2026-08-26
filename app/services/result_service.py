import csv
import os
from datetime import datetime


CAMINHO_RESULTADOS = "data/resultados/resultados.csv"


def salvar_resultado(
    nome_arquivo: str,
    status: str,
    confianca: float,
    motivo_principal:str,
    evidencias: list[str],
    requer_revisao: bool
):
    os.makedirs("data/resultados", exist_ok=True)

    arquivo_existe = os.path.exists(CAMINHO_RESULTADOS)

    with open(
        CAMINHO_RESULTADOS,
        mode="a",
        newline="",
        encoding="utf-8-sig"
    ) as arquivo:

        writer = csv.writer(arquivo)

        if not arquivo_existe:
            writer.writerow([
                "data_hora",
                "arquivo",
                "status_modelo",
                "confianca",
                "motivo_principal",
                "evidencias",
                "requer_revisao"
            ])

        writer.writerow([
            datetime.now().isoformat(),
            nome_arquivo,
            status,
            confianca,
            motivo_principal,
            " | ".join(evidencias),
            requer_revisao
        ])

def carregar_arquivos_processados() -> set[str]:
    if not os.path.exists(CAMINHO_RESULTADOS):
        return set()

    arquivos_processados = set()

    with open(
        CAMINHO_RESULTADOS,
        mode="r",
        encoding="utf-8-sig"
    ) as arquivo:

        reader = csv.DictReader(arquivo)

        for linha in reader:
            nome_arquivo = linha.get("arquivo")

            if nome_arquivo:
                arquivos_processados.add(nome_arquivo)

    return arquivos_processados