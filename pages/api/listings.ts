import type { NextApiRequest, NextApiResponse } from 'next'
import { IListing } from '../../interfaces/listings'
import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'

let listings: Array<IListing> = [
  {
    id: uuidv4(),
    name: "ShogunSamurai",
    desc: "This is ShogunSamurai NFT",
    image: "https://i.seadn.io/gae/AU2QJQ2tg5CP-YdjjPwQdYNIKhwLwRvRGgrwd3bqJnmgszQvQmEn1qLD9gRHuYApaq6gq3tMw-UQqhq52GFv2wSyGZXVYOR7A7JonA",
    price: 10,
    creator: "0xc4922ddc62c6b67e3f4f26b86a82f515494200f8",
    favorites: [],
    createdAt: Date.now()
  },
  {
    id: uuidv4(),
    name: "Uninterested Unicorn",
    desc: "This is Uninterested Unicorn NFT",
    image: "https://i.seadn.io/gae/8xUASz9wNqC_yd8DYDg3xhTgz4JnvZCTEH-HFUiR36lDl2AxKHIGcqMvgojQL-csPigODPWnyD5IhvEHwTzS8rM9z3Dign2-RcS3",
    price: 15,
    creator: "0xc4922ddc62c6b67e3f4f26b86a82f515494200f8",
    favorites: [
      "0xc4922ddc62c6b67e3f4f26b86a82f515494200f8"
    ],
    createdAt: Date.now()
  }
]

export default function handler(
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

  switch (method) {
    case 'GET':
      // Get data from your database
      res.status(200).json(listings)
      break
    case 'POST':
      const { name, desc, image, price, creator, signature: postSignature } = body

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
          postSignature
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

      listings.push({
        id: uuidv4(),
        name: name as string, 
        desc: desc as string, 
        image: image as string,
        price: parseFloat(price as string),
        creator: creator as string,
        favorites: [],
        createdAt: Date.now()
      })

      res.status(200).json(listings)
      break
    case 'PUT':
      // Update or create data in your database
      const { isFavorite, id: putId } = body
      if (isFavorite) {
        const { msg, address, signature: putSignature } = body
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
            putSignature
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

        const listingId = listings.findIndex((lising) => lising.id === putId)
        const favorites = listings[listingId].favorites
        const idx = favorites.findIndex(fav => fav.toLowerCase() === address.toLowerCase())

        if (idx === -1) {
          favorites.push(address)
        } else {
          favorites.splice(idx, 1)
        }

        res.status(200).json(listings)
      }
      else {
        const { name, desc, image, price, creator, signature: postSignature } = body

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
            postSignature
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

        const listingId = listings.findIndex((lising) => lising.id === putId)
        listings[listingId].name = name
        listings[listingId].desc = desc
        listings[listingId].image = image
        listings[listingId].price = price

        res.status(200).json(listings)
      }

      break
    case 'DELETE':
      // Update or create data in your database
      const { id: delId, msg: delMsg, address: delAddress, signature: delSignature } = body
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
            id: delId as string,
            msg: delMsg as string, 
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
  
        if (String(signingAddress).toLocaleLowerCase() !== String(delAddress).toLowerCase()) {
          return res.status(400).json({
            success: false,
            data: 'Invalid Signature',
          })
        }
  
        const listingIdx = listings.findIndex((lising) => lising.id === delId)
  
        if (listingIdx !== -1) {
          listings.splice(listingIdx, 1)
        }
  
        res.status(200).json(listings)
        break
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
