import { logoutUser } from '@/actions/auth-actions';
import '../globals.css';
export const metadata = {
    title: 'Next Auth',
    description: 'Next.js Authentication',
  };
  

export default function Layout({ children }) {
    return (
        <>
            <header id="auth-header"> 
                
                    <p >Welcome back!</p>
                   <form action={logoutUser} >
                   <button >
                        Logout
                    </button>
                   </form>
            </header>
            <main >{children}</main>
        </>
    );
}

