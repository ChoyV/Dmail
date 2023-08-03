const ethers = require('ethers');
const fs = require('fs');
const { SocksProxyAgent } = require('socks-proxy-agent');
require('dotenv').config();

const privateKeysFile = 'private_keys.txt';
const proxiesFile = 'proxy.txt';

const sendMailFragment = {
    type: "function",
    name: "send_mail",
    constant: false,
    inputs: [
        {
            name: "to",
            type: "string"
        },
        {
            name: "subject",
            type: "string"
        }
    ],
    outputs: [],
    stateMutability: "nonpayable"
};

async function interactWithContract(privateKey, proxyConfig) {
    const providerOptions = {
        chainId: 324
    };

    if (proxyConfig) {
        const proxy = new SocksProxyAgent(proxyConfig);
        providerOptions.agent = proxy;
    }

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC, providerOptions);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(process.env.C_ADR, [sendMailFragment], wallet);

    function generateRandomEmail() {
        const randomString = Math.random().toString(36).substring(2, 10);
        const email = `${randomString}@gmail.com`;
        return email;
    }

    const to = generateRandomEmail();
    const subj = 'test';
    const gasLimit = 500000;

    try {
        const tx = await contract.send_mail(to, subj, { gasLimit });
        const receipt = await tx.wait();
        console.log('Success!\nHash:', receipt.transactionHash);
    } catch (error) {
        console.log('Error:', error);
        return;
    }
}

async function main() {
    const privateKeys = fs.readFileSync(privateKeysFile, 'utf8').trim().split('\n');
    const proxies = fs.readFileSync(proxiesFile, 'utf8').trim().split('\n');


    for (let i = 0; i < privateKeys.length; i++) {
        const privateKey = privateKeys[i].trim();
        const proxyConfig = proxies[i] ? proxies[i].trim() : null;
        await interactWithContract(privateKey, proxyConfig);

        
            // Generate a random time delay between 30 to 120 seconds
            const randomDelay = Math.floor(Math.random() * (120 - 30 + 1) + 30);
            await new Promise(resolve => setTimeout(resolve, randomDelay * 1000));
        
    }
    console.log('==DONE==');
}

main();

