"use client";
import React, { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';
import GeneralForm from "./GeneralForm";
import { decode } from 'jsonwebtoken';

const EditItem = ({ item, api, storageUrl }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState(null);

  const initialData = {
    title: item.title,
    image: item.image,
    url: item.url,
    desc: item.desc || "", // Ensure desc is defined
  };

  const { data } = useSession();

    useEffect(() => {
        if (data) {
            setToken(data.user.accessToken);
        }
    }, [data]);

  useEffect(() => {
    if (token) {
        try {
            const decodedToken = decode(token);
            if (decodedToken.exp * 1000 > Date.now()) {
                setIsAdmin(decodedToken.isAdmin);
            } 
        } catch (error) {
            console.error("Invalid token:", error);
        }
    } else {
        setIsAdmin(false);
    }
}, [token]);

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="relative w-full h-full">
      <div
        className="bg-cover bg-center h-full w-full group flex flex-col justify-end transform hover:translate-y-0 transition-transform duration-300 ease-in-out"
        style={{ backgroundImage: `url(${item.image})` }}
      >
        <div className="pb-10 group-hover:pb-20">
          <p className="text-xl">{item.title}</p>
          <p className="py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-0 group-hover:-translate-y-2">
            Explore
          </p>
        </div>
      </div>
     {isAdmin && <button
        className="absolute top-2 right-2 bg-white text-black py-1 px-3"
        onClick={handleEditClick}
      >
        Edit
      </button>}
      {isAdmin && isEditing && (
        <GeneralForm
        api={`${api}/${item._id}`}
        initialData={initialData}
        storageUrl={storageUrl}
        id={item._id}
    />
      )}
    </div>
  );
};

export default EditItem;






