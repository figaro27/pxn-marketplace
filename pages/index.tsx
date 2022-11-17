import type { NextPage } from 'next'
import Listings from '../components/Listings'

const Home: NextPage = () => {
  return (
    <div className="container mx-auto">
      <Listings />
    </div>
  )
}

export default Home
