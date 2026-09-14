// ==========================================
// NORMALIZAÇÃO DE ENDEREÇOS
// ==========================================


// ==========================================
// ELEMENTOS - VIACEP
// ==========================================

const arquivoViaCep =
    document.getElementById(
        "arquivo-viacep"
    );

const nomeArquivoViaCep =
    document.getElementById(
        "nome-arquivo-viacep"
    );

const btnViaCep =
    document.getElementById(
        "btn-viacep"
    );

const statusViaCep =
    document.getElementById(
        "status-viacep"
    );

const resultadoViaCep =
    document.getElementById(
        "resultado-viacep"
    );


// ==========================================
// ELEMENTOS - GOOGLE
// ==========================================

const arquivoGoogle =
    document.getElementById(
        "arquivo-google"
    );

const nomeArquivoGoogle =
    document.getElementById(
        "nome-arquivo-google"
    );

const btnGoogle =
    document.getElementById(
        "btn-google"
    );

const statusGoogle =
    document.getElementById(
        "status-google"
    );

const resultadoGoogle =
    document.getElementById(
        "resultado-google"
    );


// ==========================================
// SELEÇÃO - VIACEP
// ==========================================

arquivoViaCep.addEventListener(
    "change",
    () => {

        const arquivo =
            arquivoViaCep.files[0];

        if (!arquivo) {

            nomeArquivoViaCep.textContent =
                "Nenhum arquivo selecionado";

            btnViaCep.disabled = true;

            return;
        }


        nomeArquivoViaCep.textContent =
            arquivo.name;

        btnViaCep.disabled = false;

        statusViaCep.textContent = "";

        statusViaCep.className =
            "normalizacao-status";

        resultadoViaCep.innerHTML = "";
    }
);


// ==========================================
// SELEÇÃO - GOOGLE
// ==========================================

arquivoGoogle.addEventListener(
    "change",
    () => {

        const arquivo =
            arquivoGoogle.files[0];

        if (!arquivo) {

            nomeArquivoGoogle.textContent =
                "Nenhum arquivo selecionado";

            btnGoogle.disabled = true;

            return;
        }


        nomeArquivoGoogle.textContent =
            arquivo.name;

        btnGoogle.disabled = false;

        statusGoogle.textContent = "";

        statusGoogle.className =
            "normalizacao-status";

        resultadoGoogle.innerHTML = "";
    }
);


// ==========================================
// EXECUTAR VIACEP
// ==========================================

btnViaCep.addEventListener(
    "click",
    async () => {

        const arquivo =
            arquivoViaCep.files[0];


        if (!arquivo) {

            alert(
                "Selecione um arquivo Excel."
            );

            return;
        }


        const formulario =
            new FormData();


        formulario.append(
            "arquivo",
            arquivo
        );


        // ==================================
        // ESTADO DE PROCESSAMENTO
        // ==================================

        btnViaCep.disabled = true;

        btnViaCep.textContent =
            "Processando...";


        statusViaCep.className =
            "normalizacao-status processando";

        statusViaCep.textContent =
            "Normalizando endereços via ViaCEP...";


        resultadoViaCep.innerHTML = "";


        try {

            const resposta =
                await fetch(
                    "/normalizar/viacep",
                    {
                        method: "POST",
                        body: formulario
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro durante a normalização."
                );
            }


            // ==============================
            // SUCESSO
            // ==============================

            statusViaCep.className =
                "normalizacao-status sucesso";


            statusViaCep.textContent =
                "✓ Normalização concluída";


            resultadoViaCep.innerHTML = `
                <div class="resultado-grid">

                    <div>
                        <span>
                            Total da base
                        </span>

                        <strong>
                            ${dados.total_registros ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Processadas
                        </span>

                        <strong>
                            ${dados.processadas ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Normalizadas
                        </span>

                        <strong>
                            ${dados.normalizadas ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            CEP não encontrado
                        </span>

                        <strong>
                            ${dados.cep_nao_encontrado ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Ignoradas
                        </span>

                        <strong>
                            ${dados.ignoradas ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Erros
                        </span>

                        <strong>
                            ${dados.erros ?? 0}
                        </strong>
                    </div>

                </div>


                <div class="arquivo-gerado">

                    <span>
                        Arquivo gerado
                    </span>

                    <strong>
                        ${extrairNomeArquivo(
                            dados.arquivo_saida
                        )}
                    </strong>

                </div>
            `;


        } catch (erro) {

            console.error(
                "Erro ViaCEP:",
                erro
            );


            statusViaCep.className =
                "normalizacao-status erro";


            statusViaCep.textContent =
                `✗ ${erro.message}`;

        } finally {

            btnViaCep.disabled = false;


            btnViaCep.textContent =
                "Normalizar via ViaCEP";
        }
    }
);


// ==========================================
// EXECUTAR GOOGLE
// ==========================================

btnGoogle.addEventListener(
    "click",
    async () => {

        const arquivo =
            arquivoGoogle.files[0];


        if (!arquivo) {

            alert(
                "Selecione um arquivo Excel."
            );

            return;
        }


        const formulario =
            new FormData();


        formulario.append(
            "arquivo",
            arquivo
        );


        // ==================================
        // ESTADO DE PROCESSAMENTO
        // ==================================

        btnGoogle.disabled = true;


        btnGoogle.textContent =
            "Processando...";


        statusGoogle.className =
            "normalizacao-status processando";


        statusGoogle.textContent =
            "Abrindo Google Maps e normalizando endereços...";


        resultadoGoogle.innerHTML = "";


        try {

            const resposta =
                await fetch(
                    "/normalizar/google",
                    {
                        method: "POST",
                        body: formulario
                    }
                );


            const dados =
                await resposta.json();


            if (!resposta.ok) {

                throw new Error(
                    dados.detail ||
                    "Erro durante a normalização."
                );
            }


            // ==============================
            // SUCESSO
            // ==============================

            statusGoogle.className =
                "normalizacao-status sucesso";


            statusGoogle.textContent =
                "✓ Normalização concluída";


            resultadoGoogle.innerHTML = `
                <div class="resultado-grid">

                    <div>
                        <span>
                            Total da base
                        </span>

                        <strong>
                            ${dados.total_registros ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Processadas
                        </span>

                        <strong>
                            ${dados.processadas ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Normalizadas
                        </span>

                        <strong>
                            ${dados.normalizadas ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Não encontradas
                        </span>

                        <strong>
                            ${dados.nao_encontradas ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Ignoradas
                        </span>

                        <strong>
                            ${dados.ignoradas ?? 0}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Erros
                        </span>

                        <strong>
                            ${dados.erros ?? 0}
                        </strong>
                    </div>

                </div>


                <div class="arquivo-gerado">

                    <span>
                        Arquivo gerado
                    </span>

                    <strong>
                        ${extrairNomeArquivo(
                            dados.arquivo_saida
                        )}
                    </strong>

                </div>
            `;


        } catch (erro) {

            console.error(
                "Erro Google:",
                erro
            );


            statusGoogle.className =
                "normalizacao-status erro";


            statusGoogle.textContent =
                `✗ ${erro.message}`;

        } finally {

            btnGoogle.disabled = false;


            btnGoogle.textContent =
                "Normalizar via Google";
        }
    }
);


// ==========================================
// PEGAR SOMENTE NOME DO ARQUIVO
// ==========================================

function extrairNomeArquivo(
    caminho
) {

    if (!caminho) {

        return "-";
    }


    return String(
        caminho
    )
        .replaceAll(
            "\\",
            "/"
        )
        .split("/")
        .pop();
}