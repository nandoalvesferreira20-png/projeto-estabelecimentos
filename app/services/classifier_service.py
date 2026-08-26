import json
import ollama
import time

from app.models.result import ResultadoAnalise
from io import BytesIO
from PIL import Image


PROMPT_ANALISE = """
Você é um sistema de visão computacional especializado em analisar
fachadas de estabelecimentos comerciais.

Analise APENAS o que é visualmente observável na imagem.

Classifique o estabelecimento em uma destas categorias:

ATIVO
POSSIVELMENTE_INATIVO
INCONCLUSIVO

Sinais que podem indicar ATIVO:
- identificação comercial visível;
- fachada aparentemente ocupada;
- produtos ou serviços visíveis;
- pessoas relacionadas à operação;
- mesas, vitrines ou equipamentos comerciais;
- outros sinais claros de funcionamento.

Sinais que podem indicar POSSIVELMENTE_INATIVO:
- placa de "aluga-se" ou "vende-se";
- imóvel aparentemente vazio;
- fachada abandonada;
- remoção da identidade visual;
- outra empresa ocupando o endereço;
- sinais claros de desocupação.

IMPORTANTE:

Uma porta ou portão fechado NÃO é evidência suficiente de inatividade.

Não invente informações que não estejam visíveis.

Se não houver evidências suficientes, classifique como INCONCLUSIVO.

Retorne SOMENTE JSON válido:

{
    "status": "ATIVO",
    "confianca": 0.85,
    "motivo_principal": "A fachada apresenta identificação comercial e sinais claros de operação.",
    "evidencias": [
        "identificação comercial visível",
        "vitrine aparentemente em uso"
    ]
}

O motivo_principal deve ser uma frase curta e objetiva explicando
qual foi a principal evidência que levou à classificação.

A confiança deve ser um número entre 0 e 1.
"""

def preparar_imagem(imagem_bytes: bytes) -> bytes:
    imagem = Image.open(BytesIO(imagem_bytes))

    # Garante um formato compatível
    imagem = imagem.convert("RGB")

    print(f"Imagem original: {imagem.width}x{imagem.height}")

    # Mantém proporção e limita o maior lado a 1024px
    imagem.thumbnail((896, 896))

    print(f"Imagem processada: {imagem.width}x{imagem.height}")

    buffer = BytesIO()

    imagem.save(
        buffer,
        format="JPEG",
        quality=75,
        optimize=True
    )

    return buffer.getvalue()


def analisar_fachada(imagem_bytes: bytes) -> ResultadoAnalise:
    imagem_bytes = preparar_imagem(imagem_bytes)
    inicio = time.perf_counter()

    response = ollama.chat(
        model="gemma3:4b-it-qat",
        messages=[
            {
                "role": "user",
                "content": PROMPT_ANALISE,
                "images": [imagem_bytes]
            }
        ],
        format="json",
        keep_alive="10m"
    )
    tempo = time.perf_counter() - inicio

    print(f"Tempo de análise: {tempo:.2f} segundos")

    resposta = response["message"]["content"]

    dados = json.loads(resposta)

    status = dados["status"]
    confianca = dados["confianca"]
    motivo_principal = dados["motivo_principal"]
    evidencias = dados["evidencias"]

    requer_revisao = (
        status == "INCONCLUSIVO"
        or confianca < 0.75
    )

    return ResultadoAnalise(
        status=status,
        confianca=confianca,
        motivo_principal=motivo_principal,
        evidencias=evidencias,
        requer_revisao=requer_revisao
)
    