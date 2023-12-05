<script>
    import { onMount } from "svelte";
    import { ethers } from "ethers";
    import dsrAbi from '$lib/images/dsrAbi.json';

    const dsrAddr = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"

    const stringToByteArray = (input) => {
        const result = new Uint8Array(input.length / 2);

        for (let i = 0; i < input.length; i += 2) {
            result[i / 2] = parseInt(input.substr(i, 2), 16);
        }

        return result;
    }

    const dsrCreateRecord = async () => {
        // A Web3Provider wraps a standard Web3 provider, which is
        // what MetaMask injects as window.ethereum into each page
        const provider = new ethers.BrowserProvider(window.ethereum)

        // MetaMask requires requesting permission to connect users accounts
        await provider.send("eth_requestAccounts", []);

        // The MetaMask plugin also allows signing transactions to
        // send ether and pay to change state within the blockchain.
        // For this, you need the account signer...
        const signer2 = await provider.getSigner()
        console.log(`signer: ${JSON.stringify(signer2)}`)

        // The Contract object
        const dsrContract = new ethers.Contract(dsrAddr, dsrAbi.abi, provider);
        console.log('--------------');
        const dsrContractWithSigner = dsrContract.connect(signer2);
        console.log(await dsrContractWithSigner.createRecord(stringToByteArray(formData.field1), formData.field2, formData.field3, formData.field4));
        console.log('--------------');
    }

    let formData = {
        field1: "a5f4f02d5f3995b9c4a8895c96a22e48f2ef69600e72a6a8f596a8d09c6ab003",
        field2: "QmRmkky7qQBjCAU2gFUqfy3NXD7BPq8YVLPM7GHXBz7b5P",
        field3: "Doe",
        field4: "doe@mail.com",
    };

    let errors = {
        field1: "",
        field2: "",
        field3: "",
        field4: "",
    };

    // Regular expressions for validation
    const regexField1 = /^[a-fA-F0-9]{64}$/;
    const regexField2 = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    const regexField3 = /^(?!\s*$).+/;
    const regexField4 = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Function to handle form submission
    const handleSubmit = async () => {
        // Validate each field
        validateField("field1", regexField1);
        validateField("field2", regexField2);
        validateField("field3", regexField3);
        validateField("field4", regexField4);

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
        <label for="field1">SHA256 hash:</label>
        <input
            type="text"
            id="field1"
            bind:value={formData.field1}
            on:input={() => handleInputChange("field1")}
        />
        <div>{errors.field1}</div>

        <label for="field2">IPFS Cid:</label>
        <input
            type="text"
            id="field2"
            bind:value={formData.field2}
            on:input={() => handleInputChange("field2")}
        />
        <div>{errors.field2}</div>

        <label for="field3">Author name:</label>
        <input
            type="text"
            id="field3"
            bind:value={formData.field3}
            on:input={() => handleInputChange("field3")}
        />
        <div>{errors.field3}</div>

        <label for="field4">Author e-mail:</label>
        <input
            type="email"
            id="field4"
            bind:value={formData.field4}
            on:input={() => handleInputChange("field4")}
        />
        <div>{errors.field4}</div>

        <button type="submit">Submit</button>
    </form>
</main>
