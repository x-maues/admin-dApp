export const INR_TOKEN_ABI = [
        {
            "inputs": [],
            "name": "pause",
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "unpause",
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "paused",
            "outputs": [{ "type": "bool" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "type": "address" }, { "type": "bool" }],
            "name": "setBlacklisted",
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{ "type": "address" }],
            "name": "isBlacklisted",
            "outputs": [{ "type": "bool" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "PAUSER_ROLE",
            "outputs": [{ "type": "bytes32" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "BLACKLIST_ADMIN_ROLE",
            "outputs": [{ "type": "bytes32" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "type": "bytes32" }, { "type": "address" }],
            "name": "hasRole",
            "outputs": [{ "type": "bool" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "address[]", "name": "accounts", "type": "address[]" },
                { "internalType": "bool", "name": "status", "type": "bool" }
            ],
            "name": "setBlacklistedBatch",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
    ] as const
