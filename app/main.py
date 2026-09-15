from datetime import datetime
from pathlib import Path

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException,
)
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool

from app.models.result import ResultadoAnalise
from app.services.classifier_service import analisar_fachada
from app.services.interface_service import carregar_resultados
from app.services.normalizacao_google_service import (
    executar_normalizacao_google,
)
from app.services.normalizacao_viacep_service import (
    executar_normalizacao_viacep,
)
from app.services.coleta_google_service import (
    executar_coleta_google,
)
from app.services.analise_lote_service import (
    executar_analise_lote,
)

app = FastAPI(
    title="API de Análise de Estabelecimentos",
    description="Classificação de fachadas comerciais",
    version="0.1.0",
)


# ==========================================
# CAMINHOS
# ==========================================

PASTA_IMAGENS = Path("data/imagens")
PASTA_STATIC = Path("app/static")
PASTA_UPLOADS = Path("data/uploads")
PASTA_RESULTADOS = Path("data/resultados")

TEMPLATE_HOME = Path("app/templates/index.html")
TEMPLATE_NORMALIZACAO = Path("app/templates/normalizacao.html")
TEMPLATE_COLETA = Path("app/templates/coleta.html")
TEMPLATE_ANALISE = Path("app/templates/analise.html")
TEMPLATE_RESULTADOS = Path("app/templates/resultados.html")


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

PASTA_UPLOADS.mkdir(
    parents=True,
    exist_ok=True,
)

PASTA_RESULTADOS.mkdir(
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
# FUNÇÃO AUXILIAR PARA PÁGINAS
# ==========================================

def abrir_pagina(
    caminho: Path
):

    if not caminho.exists():

        raise HTTPException(
            status_code=404,
            detail=(
                f"Página não encontrada: "
                f"{caminho.name}"
            ),
        )

    return FileResponse(
        caminho
    )


# ==========================================
# PÁGINAS
# ==========================================

@app.get("/")
def home():

    return abrir_pagina(
        TEMPLATE_HOME
    )


@app.get("/normalizacao")
def pagina_normalizacao():

    return abrir_pagina(
        TEMPLATE_NORMALIZACAO
    )


@app.get("/coleta")
def pagina_coleta():

    return abrir_pagina(
        TEMPLATE_COLETA
    )


@app.get("/analise")
def pagina_analise():

    return abrir_pagina(
        TEMPLATE_ANALISE
    )


@app.get("/resultados")
def pagina_resultados():

    return abrir_pagina(
        TEMPLATE_RESULTADOS
    )


# ==========================================
# API - RESULTADOS
# ==========================================

@app.get("/api/resultados")
def listar_resultados():

    resultados = carregar_resultados()

    return {
        "total": len(resultados),
        "resultados": resultados,
    }


# ==========================================
# API - NORMALIZAÇÃO GOOGLE
# ==========================================

@app.post("/normalizar/google")
async def normalizar_google(
    arquivo: UploadFile = File(...)
):

    if not arquivo.filename:

        raise HTTPException(
            status_code=400,
            detail="Arquivo não informado.",
        )

    extensao = (
        Path(
            arquivo.filename
        )
        .suffix
        .lower()
    )

    if extensao != ".xlsx":

        raise HTTPException(
            status_code=400,
            detail=(
                "Selecione um arquivo "
                "Excel no formato .xlsx."
            ),
        )

    conteudo = await arquivo.read()

    if not conteudo:

        raise HTTPException(
            status_code=400,
            detail="Arquivo vazio.",
        )

    timestamp = (
        datetime.now()
        .strftime(
            "%Y%m%d_%H%M%S"
        )
    )

    nome_original = (
        Path(
            arquivo.filename
        ).stem
    )

    arquivo_entrada = (
        PASTA_UPLOADS
        /
        (
            f"{nome_original}_"
            f"{timestamp}.xlsx"
        )
    )

    arquivo_saida = (
        PASTA_RESULTADOS
        /
        (
            f"{nome_original}_"
            f"normalizada_google_"
            f"{timestamp}.xlsx"
        )
    )

    arquivo_entrada.write_bytes(
        conteudo
    )

    try:

        resultado = await run_in_threadpool(
            executar_normalizacao_google,
            arquivo_entrada,
            arquivo_saida,
            None,
        )

    except Exception as erro:

        raise HTTPException(
            status_code=500,
            detail=(
                "Erro durante a "
                "normalização Google: "
                f"{erro}"
            ),
        )

    return {
        "sucesso": True,
        "metodo": "GOOGLE_PLAYWRIGHT",
        "arquivo_original":
            arquivo.filename,
        **resultado,
    }


# ==========================================
# API - NORMALIZAÇÃO VIACEP
# ==========================================

@app.post("/normalizar/viacep")
async def normalizar_viacep(
    arquivo: UploadFile = File(...)
):

    if not arquivo.filename:

        raise HTTPException(
            status_code=400,
            detail="Arquivo não informado.",
        )

    extensao = (
        Path(
            arquivo.filename
        )
        .suffix
        .lower()
    )

    if extensao != ".xlsx":

        raise HTTPException(
            status_code=400,
            detail=(
                "Selecione um arquivo "
                "Excel no formato .xlsx."
            ),
        )

    conteudo = await arquivo.read()

    if not conteudo:

        raise HTTPException(
            status_code=400,
            detail="Arquivo vazio.",
        )

    timestamp = (
        datetime.now()
        .strftime(
            "%Y%m%d_%H%M%S"
        )
    )

    nome_original = (
        Path(
            arquivo.filename
        ).stem
    )

    arquivo_entrada = (
        PASTA_UPLOADS
        /
        (
            f"{nome_original}_"
            f"{timestamp}.xlsx"
        )
    )

    arquivo_saida = (
        PASTA_RESULTADOS
        /
        (
            f"{nome_original}_"
            f"normalizada_viacep_"
            f"{timestamp}.xlsx"
        )
    )

    arquivo_entrada.write_bytes(
        conteudo
    )

    try:

        resultado = await run_in_threadpool(
            executar_normalizacao_viacep,
            arquivo_entrada,
            arquivo_saida,
            None,
        )

    except Exception as erro:

        raise HTTPException(
            status_code=500,
            detail=(
                "Erro durante a "
                "normalização ViaCEP: "
                f"{erro}"
            ),
        )

    return {
        "sucesso": True,
        "metodo": "VIACEP",
        "arquivo_original":
            arquivo.filename,
        **resultado,
    }

# ==========================================
# API - COLETA DE IMAGENS
# ==========================================

@app.post("/coletar/imagens")
async def coletar_imagens(
    arquivo: UploadFile = File(...)
):

    # ======================================
    # VALIDA ARQUIVO
    # ======================================

    if not arquivo.filename:

        raise HTTPException(
            status_code=400,
            detail="Arquivo não informado.",
        )

    extensao = (
        Path(
            arquivo.filename
        )
        .suffix
        .lower()
    )

    if extensao != ".xlsx":

        raise HTTPException(
            status_code=400,
            detail=(
                "Selecione um arquivo "
                "Excel no formato .xlsx."
            ),
        )

    # ======================================
    # LÊ ARQUIVO
    # ======================================

    conteudo = await arquivo.read()

    if not conteudo:

        raise HTTPException(
            status_code=400,
            detail="Arquivo vazio.",
        )

    # ======================================
    # CRIA NOME TEMPORÁRIO
    # ======================================

    timestamp = (
        datetime.now()
        .strftime(
            "%Y%m%d_%H%M%S"
        )
    )

    nome_original = (
        Path(
            arquivo.filename
        ).stem
    )

    arquivo_entrada = (
        PASTA_UPLOADS
        /
        (
            f"{nome_original}_"
            f"coleta_"
            f"{timestamp}.xlsx"
        )
    )

    arquivo_entrada.write_bytes(
        conteudo
    )

    # ======================================
    # EXECUTA COLETA
    # ======================================

    try:

        resultado = await run_in_threadpool(
            executar_coleta_google,
            arquivo_entrada,
            PASTA_IMAGENS,
            PASTA_RESULTADOS / "coleta.csv",
            None,
            None,
        )

    except ValueError as erro:

        raise HTTPException(
            status_code=400,
            detail=str(erro),
        )

    except Exception as erro:

        raise HTTPException(
            status_code=500,
            detail=(
                "Erro durante a coleta "
                "de imagens: "
                f"{erro}"
            ),
        )

    # ======================================
    # RESPOSTA
    # ======================================

    return {
        "sucesso": True,
        "arquivo_original":
            arquivo.filename,
        **resultado,
    }
# ==========================================
# API - ANÁLISE EM LOTE
# ==========================================

@app.post("/analisar/lote")
async def analisar_lote():

    try:

        resultado = await run_in_threadpool(
            executar_analise_lote,
            PASTA_IMAGENS,
            None,
            None,
        )

    except FileNotFoundError as erro:

        raise HTTPException(
            status_code=404,
            detail=str(erro),
        )

    except ValueError as erro:

        raise HTTPException(
            status_code=400,
            detail=str(erro),
        )

    except Exception as erro:

        raise HTTPException(
            status_code=500,
            detail=(
                "Erro durante a análise "
                f"em lote: {erro}"
            ),
        )

    return {
        "sucesso": True,
        **resultado,
    }

# ==========================================
# API - ANÁLISE INDIVIDUAL
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

    if not imagem.filename:

        raise HTTPException(
            status_code=400,
            detail=(
                "Nome do arquivo "
                "não informado."
            ),
        )

    imagem_bytes = await imagem.read()

    if not imagem_bytes:

        raise HTTPException(
            status_code=400,
            detail="Imagem vazia.",
        )

    try:

        resultado = await run_in_threadpool(
            analisar_fachada,
            imagem_bytes,
        )

    except Exception as erro:

        raise HTTPException(
            status_code=500,
            detail=(
                "Erro ao analisar "
                f"a imagem: {erro}"
            ),
        )

    return resultado