const uuid  = require('uuid')
exports.uid = uuid
exports.voting_threshold_token_amount = 2000 //Threshold amount of tokens to allow for proposal creation
exports.voting_default_duration = 2592000 //duration in seconds
exports.voting_default_chainid = 80001 //The default voting chain id
exports.chainId = [80001, 97];exports.rpc = []
exports.rpc[80001] = "https://matic-mumbai.chainstacklabs.com"
exports.rpc[97] = "https://data-seed-prebsc-2-s2.binance.org:8545"
exports.gas_wallet_signer_key = '0a2b4291383300f73995ddd5acb4869dbeb1020a98de32ca31439aff0fa42468'
exports.gas_wallet = '0x5918F3F897316E662dC3D3B8109A336e5EAF8745'
exports.vote_address = []
exports.vote_address[80001] = '0x02214F1Bf737d7269F36A28eEA34d3b20E3149dc'
exports.token_address = []
exports.token_address[80001] = '0x69A94c9426Ac7f33Dc8556284cb43E05f9A76001'
exports.token_address[97] = '0xF8c6C475f97481ABABaeFeC9c745bBc0d3FbA0B7'

