import React, { useState, useEffect, useContext } from 'react'
import { ListingsContext } from './Listings'
import { IListing } from '../interfaces/listings'
import Image from 'next/image'
import axios from 'axios'
import Search from '../public/images/search.png'

const SearchInput: React.FC = () => {
  const [searchKey, setSearchKey] = useState()
  const [fullListings, setFullListings] = useState<IListing[]>()
  const { listings, setListings } = useContext(ListingsContext)

  useEffect(() => {
    const hint = searchKey ? searchKey : ''
    const list = fullListings?.filter((listing: IListing) => listing.name.toLowerCase().includes(hint.toLowerCase()))
    setListings(list)
  }, [searchKey])

  useEffect(() => {
    const getData = async () => {
      const { data } = await axios.get(`/api/listings`)
      setFullListings(data)
    }
    getData()
  }, [listings])

  return (
    <div className='flex relative'>
      <input
        type='text'
        placeholder="Filter by Name"
        value={searchKey}
        onChange={(e: any) => setSearchKey(e.target.value)}
        className='border rounded-lg p-1 pl-6 md:py-2'
      />
      <Image
        src={Search}
        width={15}
        height={15}
        className='searchInput'
        alt='search'
      />
    </div>
  )
}

export default SearchInput