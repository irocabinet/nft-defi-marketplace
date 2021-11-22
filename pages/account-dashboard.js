import { ethers } from "ethers"
import { useEffect, useState } from "react"
import axios from "axios"
import Web3Modal from 'web3modal'

import { dMartAddress, nftAddress } from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import DMart from '../artifacts/contracts/DMart.sol/DMart.json'

export default function Dashboard() {
  const [nfts, setNfts] = useState([])
  const [sold, setSold] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNfts()
  }, [])

  async function loadNfts() {
    // to load - provider, tokenContract, marketContract, data for msg.sender items
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(dMartAddress, DMart.abi, signer)
    const data = await marketContract.minted()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      console.log("tokenUri: ", tokenUri)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      console.log("nft: ", item)
      return item
    }))
    
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setLoadingState('loaded')
  }

  if (loadingState === 'loaded' && !nfts.length) return (<h1 className='px-20 py-7 text-4x1 text-white'>You do not minted any NFTs (Products)</h1>)
  return (
    <div className='p-4'>
        <h1 style={{fontSize: '20px', color:'white'}}>NFTs (Products) Minted</h1>
      <div className='px-4' style={{maxWidth: '1600px'}}>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
          {
            nfts.map((nft, i) => (
              <div key={i} className='border shadow rounded-x1 overflow-hidden'>
                <img src={nft.image} style={{height: '400px'}}/>
                <div className='p-4'>
                  <p style={{height: '64px'}} className='text-3x1 font-semibold text-red-600'>
                    {nft.name}
                  </p>
                  <div style={{height: '72px', overflow: 'hidden'}}>
                    <p className='text-red-400'>
                      {nft.description}
                    </p>
                  </div>
                  </div>
                  <div className='p-4 bg-black'>
                    <p className='text-3x-1 mb-4 font-bold text-white'>
                      {nft.price} ETH
                    </p>
                  </div>
                </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
