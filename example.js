import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import fs from 'fs';

var RequestJSON = './build/contracts/Venly_NFT_Request.json';
var ResponseJSON = './build/contracts/Venly_NFT_Response.json';

const RequestContract = JSON.parse(fs.readFileSync(RequestJSON));
const ResponseContract = JSON.parse(fs.readFileSync(ResponseJSON));

//Add wallet mnenomnic to environment - uncomment to use
//const mnemonic = fs.readFileSync(".secret").toString().trim();

//Add wallet mnenomnic as environment variable ($env:process.env.WALLET_MNEMONIC) - comment to use .secret
const mnemonic = process.env.WALLET_MNEMONIC.toString().trim();
const walletProvider = new HDWalletProvider(mnemonic, "https://rpc-mainnet.matic.network");


const init = async () => {
	try {

		let web3_wallet = new Web3(walletProvider);
		let web3 = new Web3(new Web3.providers.WebsocketProvider('wss://rpc-mainnet.matic.network'));
		const addresses = await web3_wallet.eth.getAccounts();

		const requestContract = new web3_wallet.eth.Contract(RequestContract.abi, '0x6aa79f111D554a81148Fab327D80cc602C247285');
		const responseContract = new web3.eth.Contract(ResponseContract.abi, '0x7D8Fdd7Cc45Ead93D22cabf214D4E040Dba963aa');

		//Send non-animated NFT to Oracle for IPFs pinning		
		await requestContract.methods.pinNFT("0x7227e371540cf7b8e512544ba6871472031f3335","158456347053941662146248116501",false).send({
			from: addresses[0],
			gasPrice: 35000000000,
			value: "1500000000000000000"
		});
		
		//Send animated NFT to Oracle for IPFs pinning
		await requestContract.methods.pinNFT("0x7227e371540cf7b8e512544ba6871472031f3335","158456347053941662146248116501",true).send({
			from: addresses[0],
			gasPrice: 35000000000,
			value: "300000000000000000"
		});

		//Await for response from Oracle then prints result
		responseContract.events.nftAssetData({})
			.on('data', function (event) {
				console.log(event);
			}).on('error', console.error)


	} catch (error) {
		console.error(error);

	}
}

init();