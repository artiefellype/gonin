"use client";
import ForumContainer from "@/components/ForumContainer";
import ForumHead from "@/components/ForumHead";
import { FormEvent, useEffect, useState } from "react";
import { auth } from "@/firebase/authentication";
import { fireApp as app } from "@/firebase/firebase";
import {
  child,
  get,
  getDatabase,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import { MessagesProps } from "@/types";
import {
  FaRegRectangleXmark as CloseIcon,
  FaPlus as AddIcon,
} from "react-icons/fa6";
import ForumForm from "@/components/ForumForm";

export default function Forum() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<MessagesProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const db = getDatabase(app);

  const getMessagesR = () => {
    const dbRef = ref(db);
    get(child(dbRef, "messages"))
      .then((snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((item) => {
            const data = item.val();

            setMessages((prev) => {
              if (!prev.some((msg) => msg.id === (data as MessagesProps).id)) {
                //console.log("AQUI: ", data);
                return [...prev, data] as MessagesProps[];
              } else {
                return prev;
              }
            });
            console.log("EITA:", messages);
          });
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const updateMessage = async (
    msgRef: string,
    data: MessagesProps,
    d?: boolean
  ) => {
    const itemRef = ref(db, "messages/" + msgRef);
    console.log("ATUALIZANDO LIKE: ", d);
    const newData = {
      id: data.id,
      title: data.title,
      description: data.description,
      user_id: data.user_id,
      user_Name: data.user_Name,
      user_photo_url: data.user_photo_url,
      created_at: data.created_at,
      liked_list: data.liked_list,
      likesCount: data.likesCount,
    };

    if (d != undefined) {
      if (data.liked_list.indexOf(auth.currentUser?.photoURL!) === -1) {
        newData.liked_list.push(auth.currentUser?.photoURL!);
        newData.likesCount = newData.likesCount + 1;
      } else {
        newData.liked_list = newData.liked_list.filter(
          (item) => item != auth.currentUser?.photoURL!
        );
        newData.likesCount = newData.likesCount - 1;
      }
    }
    console.log("ATUALIZANDO LIKE 2: ", newData.likesCount);
    console.log("ATUALIZANDO LIKE bool 2: ", newData.liked_list);

    update(itemRef, newData)
      .then(() => {
        setMessages((prev) => [
          ...prev.filter((msg) => msg.id !== data.id),
          newData,
        ]);
      })
      .catch((err) => {
        console.log("Houve um erro ao atualizar: ", err);
      });

    getMessagesR();
  };

  const removeMessage = async (msgRef: string) => {
    const itemRef = ref(db, "messages/" + msgRef);
    await remove(itemRef)
      .then(() => {
        console.log("REMOVIDO");
        setMessages((prev) => {
          return prev.filter((msg) => msg.id !== msgRef);
        });
      })
      .catch((err) => {
        console.log("Houve um erro ao remover: ", err);
      });
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();

    const uid = auth.currentUser?.uid;
    const userName = auth.currentUser?.displayName;
    const userImage = auth.currentUser?.photoURL;
    const newMessageRef = push(ref(db, "messages/"));
    const newMsgId = newMessageRef.key;

    //console.log("userName", userName);
    //console.log("userImage", userImage);

    if (title.length !== 0 && description.length !== 0) {
      await update(newMessageRef, {
        id: newMsgId,
        title: title,
        description: description,
        user_id: uid,
        user_Name: userName,
        user_photo_url: userImage,
        isLiked: false,
        likesCount: 0,
        created_at: new Date().toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });

      setTitle("");
      setDescription("");
      setIsOpen(false);
      getMessagesR();
    } else {
      if (title.length == 0) {
        alert("Qual o sentido de um tópico sem título? Ponha um :)");
      }
      if (description.length == 0) {
        alert("Qual o sentido de um tópico sem descrição? Ponha uma :)");
      }
    }
  };

  const handleLike = (isliked: boolean, data: MessagesProps) => {
    if (data.liked_list.indexOf(auth.currentUser?.photoURL!) === -1) {
      updateMessage(data.id, data, false);
    } else {
      updateMessage(data.id, data, true);
    }
  };

  const refreshPosts = () => {
    setMessages([]);
    getMessagesR();
  };

  useEffect(() => {
    getMessagesR();
  }, []);

  return (
    <div
      className={`w-screen min-h-screen bg-gray-200 relative flex justify-center items-center flex-col`}
    >
      <ForumHead refresh={refreshPosts} />
      <ForumContainer
        messages={messages}
        onDelete={removeMessage}
        onUpdate={updateMessage}
        onLike={handleLike}
      />

      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed rounded-full bg-gray-700 w-14 h-14 right-8 bottom-8 flex justify-center items-center "
        >
          <AddIcon size={30} />
        </button>
      ) : (
        <ForumForm
          setIsOpen={setIsOpen}
          sendMessage={sendMessage}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
        />
      )}
    </div>
  );
}
