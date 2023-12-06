<script>
    import { onMount } from "svelte";
    import { ethers } from "ethers";
    import dsrAbi from '$lib/images/dsrAbi.json';

    const dsrAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    
    let showTable = false;
    
    function showTableData() {
      showTable = true;
    }

    const stringToByteArray = (input) => {
        const result = new Uint8Array(input.length / 2);

        for (let i = 0; i < input.length; i += 2) {
            result[i / 2] = parseInt(input.substr(i, 2), 16);
        }

        return result;
    }

    const data = [
      {
        sha256Hash: "a5f4f02d5f3995b9c4a8895c96a22e48f2ef69600e72a6a8f596a8d09c6ab003",
        ipfsCid: "QmRmkky7qQBjCAU2gFUqfy3NXD7BPq8YVLPM7GHXBz7b5P",
        authorName: "Doe",
        authorEmail: "doe@mail.com",
        timestamp: "",
      },
    ];

    const dsrGetRecordsByOwner = async (ownerAddress) => {
    const provider = new ethers.BrowserProvider(window.ethereum);

    // Solicitar permissão ao usuário para conectar suas contas
    await provider.send("eth_requestAccounts", []);

    // Obter o objeto de Signer
    const signer = await provider.getSigner();

    // Criar uma instância do contrato
    const dsrContract = new ethers.Contract(dsrAddr, dsrAbi.abi, provider);

    // Conectar a instância do contrato ao Signer
    const dsrContractWithSigner = dsrContract.connect(signer);

    try {
        // Chamar a função getRecordsByOwner do contrato
        const recordArray = await dsrContractWithSigner.getRecordsByOwner(ownerAddress);

        // Exibir os resultados
        console.log("Records for owner", ownerAddress, ":", recordArray);

        // Retornar os resultados (ou use os resultados como desejar)
        return recordArray;
    } catch (error) {
        console.error("Error calling getRecordsByOwner:", error.message);
        return []; // Retornar uma array vazia ou tratar o erro conforme necessário
    }
};

// Função para lidar com a pesquisa e exibição dos resultados
    const handleSearchByOwner = async () => {
      const ownerAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
      const records = await dsrGetRecordsByOwner(ownerAddress);

      // Exibir os resultados na interface do usuário
      console.log("Results:", records);
    };

    let formData = {
        field1: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    };

    let errors = {
        field1: "",
    };

    // Regular expressions for validation
    const regexField1 = /^0x[0-9a-fA-F]{40}$/;

    // Function to handle form submission
    const handleSubmit = async () => {
        // Validate each field
        validateField("field1", regexField1);

        // Check if there are no errors before submitting
        if (!Object.values(errors).some((error) => error !== "")) {
            // Form data is valid, you can submit it here
            console.log("Form data to submit:", formData);
            await dsrCreateRecord()
        }
    };

    // Function to validate a field based on regex
    const validateField = (fieldName, regex) => {
        if (!formData[fieldName].match(regex)) {
            errors[fieldName] = `Invalid ${fieldName}`;
        } else {
            errors[fieldName] = "";
        }
    };

    // Function to reset errors on input change
    const handleInputChange = (fieldName) => {
        errors[fieldName] = "";
    };

    // Function to reset errors on component mount
    onMount(() => {
        Object.keys(errors).forEach((fieldName) => {
            errors[fieldName] = "";
        });
    });
</script>

<main>
    <form on:submit|preventDefault={handleSubmit}>
        <label for="field1">Owner Address:</label>
        <input
            type="text"
            id="field1"
            bind:value={formData.field1}
            on:input={() => handleInputChange("field1")}
        />
        <div>{errors.field1}</div>
        <button on:click={showTableData}>Search</button>

        {#if showTable}
        {#each data as value (value.sha256Hash)}
          <table>
            <thead>
              <tr>
                <th>Owner address</th>
                <th>Registries found</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{dsrAddr}</td>
                <td>
                  SHA256 Hash: {value.sha256Hash}<br>
                  IPFS Cid: {value.ipfsCid}<br>
                  Author Name: {value.authorName}<br>
                  Author E-mail: {value.authorEmail}<br>
                  Timestamp: {value.timestamp}
                </td>
              </tr>
            </tbody>
          </table>
        {/each}
        {/if}
    </form>
</main>
