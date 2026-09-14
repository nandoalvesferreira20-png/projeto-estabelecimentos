import os

import requests
from dotenv import load_dotenv


load_dotenv()


GOOGLE_MAPS_API_KEY = os.getenv(
    "GOOGLE_MAPS_API_KEY"
)


URL_TEXT_SEARCH = (
    "https://places.googleapis.com/"
    "v1/places:searchText"
)


def buscar_estabelecimento(
    nome_comercial: str,
    endereco: str
) -> dict | None:

    if not GOOGLE_MAPS_API_KEY:
        raise RuntimeError(
            "GOOGLE_MAPS_API_KEY não configurada."
        )

    if not nome_comercial and not endereco:
        return None

    consulta = " ".join(
        parte
        for parte in [
            str(nome_comercial).strip()
            if nome_comercial
            else "",

            str(endereco).strip()
            if endereco
            else "",
        ]
        if parte
    )

    headers = {
        "Content-Type": "application/json",

        "X-Goog-Api-Key":
            GOOGLE_MAPS_API_KEY,

        "X-Goog-FieldMask": (
            "places.id,"
            "places.displayName,"
            "places.formattedAddress,"
            "places.businessStatus,"
            "places.types,"
            "places.primaryType"
        ),
    }

    payload = {
        "textQuery": consulta,
        "languageCode": "pt-BR",
    }

    resposta = requests.post(
        URL_TEXT_SEARCH,
        headers=headers,
        json=payload,
        timeout=30,
    )

    resposta.raise_for_status()

    dados = resposta.json()

    lugares = dados.get(
        "places",
        []
    )

    if not lugares:
        return None

    place = lugares[0]

    return {
        "place_id":
            place.get("id"),

        "nome":
            place
            .get(
                "displayName",
                {}
            )
            .get("text"),

        "endereco_google":
            place.get(
                "formattedAddress"
            ),

        "business_status":
            place.get(
                "businessStatus"
            ),

        "primary_type":
            place.get(
                "primaryType"
            ),

        "types":
            place.get(
                "types",
                []
            ),
    }