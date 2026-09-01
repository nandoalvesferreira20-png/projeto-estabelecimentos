import os
from pathlib import Path

import requests
from dotenv import load_dotenv


load_dotenv()


class GoogleStreetViewProvider:

    IMAGE_URL = "https://maps.googleapis.com/maps/api/streetview"
    METADATA_URL = "https://maps.googleapis.com/maps/api/streetview/metadata"

    def __init__(self):
        self.api_key = os.getenv("GOOGLE_MAPS_API_KEY")

        if not self.api_key:
            raise RuntimeError(
                "GOOGLE_MAPS_API_KEY não encontrada no .env"
            )

    def buscar_metadata(
        self,
        location: str,
        radius: int = 50
    ) -> dict:

        params = {
            "location": location,
            "radius": radius,
            "key": self.api_key
        }

        response = requests.get(
            self.METADATA_URL,
            params=params,
            timeout=30
        )

        response.raise_for_status()

        return response.json()

    def baixar_imagem(
        self,
        location: str,
        destino: Path,
        fov: int = 90,
        pitch: int = 0
    ):
        params = {
            "size": "640x640",
            "location": location,
            "fov": fov,
            "pitch": pitch,
            "return_error_code": "true",
            "key": self.api_key
        }

        response = requests.get(
            self.IMAGE_URL,
            params=params,
            timeout=60
        )

        response.raise_for_status()

        destino.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        destino.write_bytes(response.content)