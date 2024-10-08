"use client";
import React, { useState, useEffect } from 'react';
import EditAddress from './landingPage/EditAddress';
import Image from 'next/image';
import { FiPhone } from "react-icons/fi";

function FindStore() {
    const [stores, setStores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredStores, setFilteredStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(null);

    useEffect(() => {
        const getData = async() => {
            try {
                let res = await fetch('/api/landingPage/store', {cache: 'no-store'});
                res = await res.json();
                setStores(res);
                setFilteredStores(res);  // Set filteredStores to the fetched stores
                if (res.length > 0) {
                    setSelectedStore(res[0]);  // Set the first store as selected by default
                }
            } catch (err) {
                console.log(err);
            }
        }
        getData();
    }, []);

    const handleSearch = (event) => {
        const term = event.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = stores.filter(store =>
            store.storeName.toLowerCase().includes(term) ||
            store.address.toLowerCase().includes(term) ||
            store.zipcode.toString().includes(term)
        );
        setFilteredStores(filtered);
        if (filtered.length > 0) {
            setSelectedStore(filtered[0]);
        } else {
            setSelectedStore(null);
        }
    };

    const handleStoreClick = (store) => {
        setSelectedStore(store);
    };

    return (
        <div className='h-screen md:flex justify-center items-center px-4 md:px-20'>
            {/* address and search container */}
            
            <div className='w-full md:w-1/4 h-1/4 md:h-3/4 flex flex-col justify-end md:justify-start'>
                <div className='px-5 h-full md:h-1/4 bg-emerald-50 p-10 flex flex-col justify-center'>
                    <p className='text-2xl tracking-wide'>Find Store</p>
                    <input
                        type="text"
                        className='p-2 w-full mt-4'
                        placeholder='Enter zipcode or location'
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className='hidden md:block w-full md:w-auto h-3/4 overflow-y-scroll scrollbar-hide bg-white p-5 flex-1 border'>
                    {filteredStores.map((store, index) => (
                        <div
                            key={index}
                            className='relative cursor-pointer mb-4 p-2'
                            onClick={() => handleStoreClick(store)}
                        >
                            <p className='text-lg text-gray-600'>{store.storeName}</p>
                            <p className='text-gray-500 text-s py-4'>{store.address}</p>
                            <p className='text-gray-500 text-sm'>{store.openOn}</p>
                            <div className='py-3 flex gap-4'>
                                <button className='px-4 py-1 text-sm bg-white hover:bg-black text-gray-500 hover:text-white border border-gray-400'>Directions</button>
                                <button className='px-4 py-1 text-sm bg-white hover:bg-black text-gray-500 hover:text-white border border-gray-400 flex gap-2 items-center'><span><FiPhone size={15} /></span><span>+919930005234</span></button>
                            </div>
                        </div>
                    ))}
                    {filteredStores.length === 0 && (
                        <p className='text-center mt-10'>Sorry, no store in this location</p>
                    )}
                </div>
            </div>
            {/* image display */}
            <div className='w-full md:w-3/4 h-3/4 z-0'>
                {selectedStore ? (
                    <div className='relative w-full h-full'>
                        <Image src={selectedStore.image} alt="stores" fill style={{objectFit: 'cover'}} unoptimized/>
                        <EditAddress item={selectedStore} api={`/api/landingPage/store`} storageUrl={'stores'}/>
                        
                        <div className='absolute bottom-0 w-full flex flex-col justify-center p-4 md:hidden'>
                            <div className='bg-white p-4'>
                                <p className='text-lg text-gray-600'>{selectedStore.storeName}</p>
                                <p className='text-gray-500 text-s py-4'>{selectedStore.address}</p>
                                <p className='text-gray-500 text-sm'>{selectedStore.openOn}</p>
                                <div className='py-3 flex gap-4'>
                                    <button className='px-4 py-1 text-sm bg-white hover:bg-black text-gray-500 hover:text-white border border-gray-400'>Directions</button>
                                    <button className='px-4 py-1 text-sm bg-white hover:bg-black text-gray-500 hover:text-white border border-gray-400 flex gap-2 items-center'><span><FiPhone size={15} /></span><span>+919930005234</span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className='text-xl'>Sorry, no store in this location</p>
                )}
            </div>
        </div>
    );
}

export default FindStore;
