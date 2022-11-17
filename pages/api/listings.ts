import type { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import { firestore } from '../../firebase/clientApp'
import { doc } from '@firebase/firestore'
import { collection, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from "@firebase/firestore"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req
  let signingAddress 
  let types

  const domain = {
    name: 'PXN',
    version: 'test',
  }

  let listings: any[] = []
  const getListings = async () =>{
    const querySnapshot  = await getDocs(collection(firestore, 'listings'));
    listings = []
    querySnapshot.forEach((doc) => {
      listings.push(doc.data())
    });
  }

  switch (method) {
    case 'GET':
      // Get data from your database
      await getListings()
      res.status(200).json(listings)
      break
    case 'POST':
      const { name, desc, image, price, creator, signature: newSignature } = body

      types = {
        Product: [
          { name: 'name', type: 'string' },
          { name: 'desc', type: 'string' },
          { name: 'image', type: 'string' },
          { name: 'price', type: 'uint256' },
        ],
      }

      try {
        signingAddress = ethers.utils.verifyTypedData(
          domain,
          types,
          {
            name: name as string, 
            desc: desc as string, 
            image: image as string,
            price: parseFloat(price as string),
          },
          newSignature
        );
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          success: false,
          data: error,
        });
      }

      if (String(signingAddress).toLocaleLowerCase() !== String(creator).toLowerCase()) {
        return res.status(400).json({
          success: false,
          data: 'Invalid Signature',
        })
      }

      const new_listing = {
        id: uuidv4(),
        name: name as string, 
        desc: desc as string, 
        image: image as string,
        price: parseFloat(price as string),
        creator: creator as string,
        favorites: [],
        createdAt: Date.now()
      }
      let listingDoc = doc(firestore, `listings/${new_listing.id}`);
      await setDoc(listingDoc, new_listing);

      await getListings()
      res.status(200).json(listings)
      break
    case 'PUT':
      // Update or create data in your database
      const { isFavorite, id: putId } = body
      if (isFavorite) {
        const { msg, address, signature: favoriteSignature } = body
        types = {
          Product: [
            { name: 'id', type: 'string' },
            { name: 'msg', type: 'string' },
          ],
        }

        try {
          signingAddress = ethers.utils.verifyTypedData(
            domain,
            types,
            {
              id: putId as string,
              msg: msg as string, 
            },
            favoriteSignature
          );
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            success: false,
            data: error,
          });
        }

        if (String(signingAddress).toLocaleLowerCase() !== String(address).toLowerCase()) {
          return res.status(400).json({
            success: false,
            data: 'Invalid Signature',
          })
        }
        const favoriteListingDoc = doc(firestore, `listings/${putId}`)
        const favoriteListing = await getDoc(favoriteListingDoc)
        const favoriteListingData = favoriteListing.data()
        const favorites = favoriteListingData?.favorites
        const idx = favorites.findIndex((fav: any) => fav.toLowerCase() === address.toLowerCase())

        if (idx === -1) {
          favorites.push(address)
        } else {
          favorites.splice(idx, 1)
        }

        await updateDoc(favoriteListingDoc, {
          favorites
        })

        await getListings()
        res.status(200).json(listings)
      }
      else {
        const { name, desc, image, price, creator, signature: updateSignature } = body

        types = {
          Product: [
            { name: 'id', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'desc', type: 'string' },
            { name: 'image', type: 'string' },
            { name: 'price', type: 'uint256' },
          ],
        }
  
        try {
          signingAddress = ethers.utils.verifyTypedData(
            domain,
            types,
            {
              id: putId as string, 
              name: name as string, 
              desc: desc as string, 
              image: image as string,
              price: parseFloat(price as string),
            },
            updateSignature
          );
        } catch (error) {
          console.log(error);
          return res.status(400).json({
            success: false,
            data: error,
          });
        }
  
        if (String(signingAddress).toLocaleLowerCase() !== String(creator).toLowerCase()) {
          return res.status(400).json({
            success: false,
            data: 'Invalid Signature',
          })
        }
        const updateListingDoc = doc(firestore,`listings/${putId}`)
        await updateDoc(updateListingDoc, {
          name: name as string, 
          desc: desc as string, 
          image: image as string,
          price: parseFloat(price as string)
        });

        await getListings()
        res.status(200).json(listings)
      }

      break
    case 'DELETE':
      const { id, msg, address, signature: delSignature } = body
      types = {
        Product: [
          { name: 'id', type: 'string' },
          { name: 'msg', type: 'string' },
        ],
      }
  
      try {
        signingAddress = ethers.utils.verifyTypedData(
          domain,
          types,
          {
            id: id as string,
            msg: msg as string, 
          },
          delSignature
        );
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          success: false,
          data: error,
        });
      }
  
      if (String(signingAddress).toLocaleLowerCase() !== String(address).toLowerCase()) {
        return res.status(400).json({
          success: false,
          data: 'Invalid Signature',
        })
      }

      const delListingDoc = doc(firestore, `listings/${id}`)
      await deleteDoc(delListingDoc)

      await getListings()
      res.status(200).json(listings)
      break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST', 'DELETE'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
