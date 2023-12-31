import axios from "axios";
import { useState, useContext } from "react"; // Add useContext to the import statement
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import UserContext from '../UserContext';

export default function LoginPage() {
  const [email, setEmail]= useState('');
  const [password,setPassword]=useState(''); 
  const [redirect,setRedirect]= useState(false);
  const{setUser} = useContext(UserContext);
  async function handelLoginSubmit(ev){
    ev.preventDefault();
    try{
    const response = await axios.post('/login',{email,password});
    const user = response.data;
    setUser(user);
    alert('login successful');
    setRedirect(true);
    }catch(e){
      alert('login failed');
    }
  } 
  if (redirect){
    return <Navigate to={'/'} />
  }
 
  return (
    <div className="p-44 grow flex text-center justify-around">
      <div className="-mt-8">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={handelLoginSubmit}>
          <input type="email" placeholder="your@email.com" value={email} onChange={ev=>setEmail(ev.target.value)}/>
          <input type="password" placeholder="password" value={password} onChange={ev=>setPassword(ev.target.value)}/>
          <button className="primary">Login</button>
          <div className="text-center py-2 text-gray-500">
            Don't have an account yet?
            <Link className="underline text-black" to={"/register"}>
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

