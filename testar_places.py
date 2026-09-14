from app.services.google_places_services import (
    buscar_estabelecimento,
)


# ==========================================
# DADOS PARA TESTE
# ==========================================

NOME_COMERCIAL = (
    "Farma conde"
)

ENDERECO = (
    "Avenida Mateo Bei , "
    "3490 - Sao Mateus, São Paulo - SP"
)


# ==========================================
# TESTE
# ==========================================

def testar():

    print(
        "\n=============================="
    )

    print(
        "TESTE GOOGLE PLACES"
    )

    print(
        "==============================\n"
    )

    print(
        f"Nome comercial: "
        f"{NOME_COMERCIAL}"
    )

    print(
        f"Endereço: "
        f"{ENDERECO}"
    )

    print(
        "\nBuscando estabelecimento...\n"
    )


    try:

        resultado = buscar_estabelecimento(
            nome_comercial=NOME_COMERCIAL,
            endereco=ENDERECO,
        )


        if not resultado:

            print(
                "✗ Nenhum estabelecimento encontrado."
            )

            return


        print(
            "✓ Estabelecimento encontrado\n"
        )


        print(
            "------------------------------"
        )

        print(
            "RESULTADO"
        )

        print(
            "------------------------------"
        )


        print(
            f"Nome Google: "
            f"{resultado.get('nome')}"
        )

        print(
            f"Place ID: "
            f"{resultado.get('place_id')}"
        )

        print(
            f"Endereço Google: "
            f"{resultado.get('endereco_google')}"
        )

        print(
            f"Business Status: "
            f"{resultado.get('business_status')}"
        )

        print(
            f"Tipo principal: "
            f"{resultado.get('primary_type')}"
        )

        print(
            f"Tipos: "
            f"{resultado.get('types')}"
        )


        # ==================================
        # INTERPRETAÇÃO DO STATUS
        # ==================================

        status = resultado.get(
            "business_status"
        )


        print(
            "\n------------------------------"
        )

        print(
            "INTERPRETAÇÃO"
        )

        print(
            "------------------------------"
        )


        if status == "OPERATIONAL":

            print(
                "✓ Estabelecimento operacional."
            )

        elif status == "CLOSED_TEMPORARILY":

            print(
                "⚠ Estabelecimento "
                "temporariamente fechado."
            )

        elif status == "CLOSED_PERMANENTLY":

            print(
                "✗ Estabelecimento "
                "permanentemente fechado."
            )

        elif status == "FUTURE_OPENING":

            print(
                "ℹ Estabelecimento ainda "
                "não inaugurado."
            )

        else:

            print(
                "⚠ Business Status "
                "não informado pelo Google."
            )


    except Exception as erro:

        print(
            f"✗ Erro durante a consulta: "
            f"{erro}"
        )


if __name__ == "__main__":
    testar()