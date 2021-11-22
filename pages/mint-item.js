import { ethers } from "ethers"
import { useState } from "react"
import Web3Modal from 'web3modal'
import {create as ipfsHttpClient} from 'ipfs-http-client'
import { dMartAddress, nftAddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import DMart from '../artifacts/contracts/DMart.sol/DMart.json'
import { useRouter } from "next/dist/client/router"

const client = ipfsHttpClient('http://127.0.0.1:5001')

export default function Mint(){
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({price: '', name: '', description: ''})
    const router = useRouter()

    async function onChange(e) {
        const file = e.target.files[0]
        try {
            const added = await client.add(
                file, {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            const url = `http://127.0.0.1:8080/ipfs/${added.path}`
            setFileUrl(url)
        } catch(error){
            console.log('Error uploading file: ', error)
        }
    }

    async function createMarket(){
        const {name, description, price} = formInput
        if (!name || !description || !price || !fileUrl) return
        const data = JSON.stringify({
            name, description, image: fileUrl
        })
        try {
            const added = await client.add(data)
            const url = `http://127.0.0.1:8080/ipfs/${added.path}`
            createSale(url)
        } catch(error){
            console.log('Error uploading file: ', error)
        }
    }

    async function createSale(url){
            const web3Modal = new Web3Modal()
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)
            const signer = provider.getSigner()
            let contract = new ethers.Contract(nftAddress, NFT.abi, signer)
            console.log("url: ", url)
            let txn = await contract.mint(url)
            let tx = await txn.wait()
            let event = tx.events[0]
            let value = event.args[2]
            let tokenId = value.toNumber()
            const price = ethers.utils.parseUnits(formInput.price, 'ether')
            console.log("price: ", price.toString())
            contract = new ethers.Contract(dMartAddress, DMart.abi, signer)
            let listPrice = await contract.listPrice()
            listPrice = listPrice.toString()
            console.log("list price: ", listPrice)
            txn = await contract.makeMarketItem(nftAddress, tokenId, price, {value: listPrice}) 
            await txn.wait()

            router.push('./')
    }

    return (
        <div className='flex justify-center'>
            <div className='w-1/2 flex flex-col pb-12'>
                <input className='mt-8 border rounded p-4' placeholder='Product Name' onChange={e => updateFormInput({...formInput, name: e.target.value})}/>
                <textarea className='mt-2 border rounded p-4' placeholder='Product Description' onChange={e => updateFormInput({...formInput, description: e.target.value})}/>
                <input className='mt-2 border rounded p-4' placeholder='Product Price (ETH)' onChange={e => updateFormInput({...formInput, price: e.target.value})}/>
                <input type='file' name='Product' className='mt-4' onChange={onChange}/>
                { 
                    fileUrl && (<img className='rounded mt-4' width='350px' src={fileUrl} /> )
                }
                <button onClick={createMarket} className='font-bold mt-4 bg-red-500 text-white rounded p-4 shadow-lg'>Mint NFT</button>
            </div>
        </div>
    )
}