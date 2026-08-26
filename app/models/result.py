from pydantic import BaseModel
from typing import List


class ResultadoAnalise(BaseModel):
    status: str
    confianca: float
    motivo_principal: str
    evidencias: List[str]
    requer_revisao: bool