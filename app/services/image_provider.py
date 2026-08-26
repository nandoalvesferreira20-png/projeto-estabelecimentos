from pathlib import Path
import requests


class KartaViewProvider:

    BASE_URL = "https://api.openstreetcam.org/2.0/photo/"

    def buscar_fotos(
        self,
        latitude: float,
        longitude: float,
        radius: int = 100
    ) -> list[dict]:

        params = {
            "lat": latitude,
            "lng": longitude,
            "radius": radius,
            "orderBy": "id",
            "orderDirection": "desc"
        }

        response = requests.get(
            self.BASE_URL,
            params=params,
            timeout=30
        )

        response.raise_for_status()

        dados = response.json()

        return dados.get(
            "result",
            {}
        ).get(
            "data",
            []
        )

    def baixar_imagem(
        self,
        url: str,
        destino: Path
    ):
        response = requests.get(
            url,
            timeout=60
        )

        response.raise_for_status()

        destino.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        destino.write_bytes(response.content)