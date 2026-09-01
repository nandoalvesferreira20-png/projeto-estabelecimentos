from pathlib import Path

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.models.result import ResultadoAnalise
from app.services.classifier_service import analisar_fachada
from app.services.interface_service import carregar_resultados


app = FastAPI(
    title="API de Análise de Estabelecimentos",
    description="Classificação de fachadas comerciais",
    version="0.1.0",
)


# ==========================================
# CAMINHOS
# ==========================================

PASTA_IMAGENS = Path(
    "data/imagens"
)

PASTA_STATIC = Path(
    "app/static"
)

ARQUIVO_INTERFACE = Path(
    "app/templates/index.html"
)


# ==========================================
# GARANTE DIRETÓRIOS
# ==========================================

PASTA_IMAGENS.mkdir(
    parents=True,
    exist_ok=True,
)

PASTA_STATIC.mkdir(
    parents=True,
    exist_ok=True,
)


# ==========================================
# ARQUIVOS ESTÁTICOS
# ==========================================

app.mount(
    "/imagens",
    StaticFiles(
        directory=str(PASTA_IMAGENS)
    ),
    name="imagens",
)


app.mount(
    "/static",
    StaticFiles(
        directory=str(PASTA_STATIC)
    ),
    name="static",
)


# ==========================================
# INTERFACE
# ==========================================

@app.get("/")
def home():

    if not ARQUIVO_INTERFACE.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                "Arquivo da interface "
                "não encontrado."
            ),
        )

    return FileResponse(
        ARQUIVO_INTERFACE
    )


# ==========================================
# RESULTADOS PARA A INTERFACE
# ==========================================

@app.get("/resultados")
def listar_resultados():

    resultados = carregar_resultados()

    return {
        "total": len(resultados),
        "resultados": resultados,
    }


# ==========================================
# ANÁLISE INDIVIDUAL DE FACHADA
#
# Esta rota:
#
# - recebe uma imagem
# - envia para a IA
# - devolve o resultado
#
# NÃO salva no Excel
# NÃO altera o processamento em lote
# ==========================================

@app.post(
    "/analisar-fachada",
    response_model=ResultadoAnalise,
)
async def analisar(
    imagem: UploadFile = File(...)
):

    tipos_permitidos = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ]

    # ======================================
    # VALIDA TIPO DO ARQUIVO
    # ======================================

    if (
        imagem.content_type
        not in tipos_permitidos
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Formato de imagem "
                "não permitido."
            ),
        )


    # ======================================
    # VALIDA NOME DO ARQUIVO
    # ======================================

    if not imagem.filename:

        raise HTTPException(
            status_code=400,
            detail=(
                "Nome do arquivo "
                "não informado."
            ),
        )


    # ======================================
    # LÊ IMAGEM
    # ======================================

    imagem_bytes = await imagem.read()


    if not imagem_bytes:

        raise HTTPException(
            status_code=400,
            detail="Imagem vazia.",
        )


    # ======================================
    # EXECUTA IA
    # ======================================

    try:

        resultado = analisar_fachada(
            imagem_bytes
        )

    except Exception as erro:

        raise HTTPException(
            status_code=500,
            detail=(
                "Erro ao analisar "
                f"a imagem: {erro}"
            ),
        )


    # ======================================
    # DEVOLVE RESULTADO
    #
    # Não salva em resultados.xlsx
    # ======================================

    return resultado