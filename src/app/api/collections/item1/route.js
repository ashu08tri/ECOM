import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { CollectionOne, Allcollection } from '@/utils/Modal/collectionSchema';

if (!mongoose.connection.readyState) {
  mongoose.connect('mongodb://127.0.0.1:27017/ecom').then(() => {
    console.log('Connected to MongoDB');
  }).catch((err) => {
    console.error('Connection to MongoDB failed:', err);
  });
}

export async function GET(){
    try{
        const item = await CollectionOne.find();
        return NextResponse.json(item)
    }catch(err){
        return NextResponse.json({error:'Something went wrong!'})
    }
}

export async function POST(request) {
    const data =  
      {
        title: 'HONEY TOP HIBISCUS',
        quantity: {
          size: [
            { quantity: 5, size: "S" },
            { quantity: 4, size: "M" },
            { quantity: 2, size: "L" },
            { quantity: 6, size: "XL" }
          ]
        },
        amount: 300,
        img: ['https://sahara-theme.myshopify.com/cdn/shop/products/FAEStudio-384.jpg']
      };
  
    try {
      const newItem = new CollectionOne(data);
      await newItem.save();

      const newItemIds = newItem._id;
  
      // // Assuming you want to update the `newArrival` field in the `Allproduct` collection
      await Allcollection.findOneAndUpdate(
        {}, // Specify the query to find the document to update, or {} to update the first document found
        { $push: { itemfirst: [ newItemIds ] } },
        { new: true, upsert: true } // Create a new document if none exists
      );
  
      return NextResponse.json({ ok: true });
    } catch (err) {
      return NextResponse.json({ error: 'Something went wrong!', details: err.message})
    }
}