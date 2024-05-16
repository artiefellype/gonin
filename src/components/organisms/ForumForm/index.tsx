import { useUserContext } from '@/context';
import Image from 'next/image';
import React, { FormEvent } from 'react'
import { FaRegRectangleXmark as CloseIcon, FaPlus as AddIcon } from "react-icons/fa6";

interface ForumFormProps {
    setIsOpen: (value: boolean) => void,
    sendMessage: (e: FormEvent) => void,
    title: string,
    setTitle: (value: string) => void,
    description: string,
    setDescription: (value: string) => void,
}
const ForumForm = ({setIsOpen, sendMessage,title,setTitle,description,setDescription}: ForumFormProps) => {
  const { user } = useUserContext()
  const auth = user?.auth
  return (
    <div className="fixed max-w-4xl w-11/12 h-[450px] top-44 border shadow bg-white rounded-lg p-4 text-gray-700 z-50">
          <div className="w-full h-6 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className=""
            >
              <CloseIcon size={24} />
            </button>
          </div>
          <div className="flex flex-row w-full mb-4">
            <div className="rounded-full m-3 bg-gray-500 w-12 h-12">
              <Image className="rounded-full" src={auth?.currentUser?.photoURL ?? ""} alt={"user photo"} width={48} height={48} />
            </div>
            <div className="flex justify-center items-center">
              <h1 className="font-semibold text-base">{auth?.currentUser?.displayName ?? "Anônimo"}</h1>
            </div>
          </div>
          <form
            onSubmit={sendMessage}
            className="flex flex-col gap-2 justify-center items-center "
          >
            <input
              className="bg-white shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="username"
              placeholder="Título"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              maxLength={256}
            />
            <textarea
              className="shadow appearance-none border rounded w-full max-w-full min-h-[120px] py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline pb-24 break-words"
              id="description" 
              placeholder="Compartilhe suas ideias..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
              maxLength={4096}
            />
            <button
              className="bg-gray-700 w-1/2 h-8 border text-gray-100 rounded-md"
              type="submit"
            >
              Publicar
            </button>
          </form>
        </div>
  )
}

export default ForumForm