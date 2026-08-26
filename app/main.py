from fastapi import FastAPI, UploadFile, File, HTTPException
from app.models.result import ResultadoAnalise
from app.services.classifier_service import analisar_fachada
from app.services.result_service import salvar_resultado

app = FastAPI(
    title="API de Análise de Estabelecimentos",
    description="Classificação de fachadas comerciais",
    version="0.1.0"
)


@app.get("/")
def home():
    return {
        "status": "online",
        "projeto": "Classificador de Fachadas"
    }


@app.post(
    "/analisar-fachada",
    response_model=ResultadoAnalise
)
async def analisar(
    imagem: UploadFile = File(...)
):
    tipos_permitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]

    if imagem.content_type not in tipos_permitidos:
        raise HTTPException(
            status_code=400,
            detail="Formato de imagem não permitido."
        )

    imagem_bytes = await imagem.read()

    resultado = analisar_fachada(imagem_bytes)
    salvar_resultado(
        nome_arquivo=imagem.filename,
        status=resultado.status,
        confianca=resultado.confianca,
        motivo_principal=resultado.motivo_principal,
        evidencias=resultado.evidencias,
        requer_revisao=resultado.requer_revisao
    )

    return resultado