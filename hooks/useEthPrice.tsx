import { useState, useEffect } from 'react'
import axios from 'axios'

const uesEthPrice = () => {
  const [ethPrice, setPrice] = useState()
  
  useEffect(() => {
    const getPrice = async () => {
      const { data } = await axios.get('https://production.api.coindesk.com/v2/tb/price/ticker?assets=ETH')
      setPrice(data.data.ETH.ohlc.c)
    }
    getPrice()
  }, [])

  return ethPrice
}

export default uesEthPrice