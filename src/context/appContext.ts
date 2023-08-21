import { createContext } from "react";
import { User as FirebaseUser } from "firebase/auth";

// Define o tipo dos dados do usuário
type User = {
  isAuth: boolean;
  user: FirebaseUser | null;
}
// Define o tipo do contexto
type UserContextType = {
user: User | null;
setUser: (user: User | null) => void;
};

// Cria o contexto com um valor inicial
const userContext = createContext<UserContextType>({
user: null,
setUser: () => {},
});

export {userContext};


