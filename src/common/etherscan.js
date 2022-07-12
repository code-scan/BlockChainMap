import axios from 'axios';
import { add } from 'lodash';
const apiKey = 'JV5DBT86WFXC2T55YBN4471CECCV8XP2E5'
    // const apiKey = 'YourApiKeyToken'
const limit = 50
async function getInfo(address, type) {
    if (type === 'erc20') {
        return getERC20Info(address)
    }
    if (type === 'trc20') {
        return getTRC20Info(address)
    }
}
async function getERC20Info(address) {
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`
    const response = await axios.get(url)
    return new Promise((resolve, reject) => {
        resolve(response.data.result)
    })
}

async function getTRC20Info(address) {
    // https://apilist.tronscan.org/api/transaction?sort=-timestamp&count=true&limit=20&start=0&address=TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireY9
    const url = `https://apilist.tronscan.org/api/transaction?sort=-timestamp&count=true&limit=${limit}&start=0&address=${address}`
    const response = await axios.get(url)
    var result = []
    response.data.data.forEach(element => {
        result.push({
            from: element.ownerAddress,
            to: element.toAddress,
            value: element.amount,
        })
    })
    return new Promise((resolve, reject) => {
        resolve(result)
    })

}

export {
    getInfo
}