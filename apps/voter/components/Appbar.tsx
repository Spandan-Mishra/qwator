"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect} from "react";
import axios from "axios";
import { toast } from "sonner";
import { PayoutButton } from "./PayoutButton";

const Appbar = () => {
    const { publicKey, signMessage, disconnect } = useWallet();

    useEffect(() => {
        const signIn = async () => {
            if (!publicKey) {
                return ;
            }

            const message = new TextEncoder().encode(`Sign in to qwator with wallet ${publicKey.toBase58()} as voter`);
            const signature = await signMessage?.(message);

            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/voter/signin`, {
                    signature: signature,
                    address: publicKey.toString()
                });

                toast.success("Signed in successfully as voter");
                localStorage.setItem('token', res.data.token);
            } catch (error) {
                toast.error("Failed to sign in as voter");
                disconnect();
            }
        }
        signIn()
    }, [publicKey])

    return (
        <div className="w-screen flex justify-between items-center p-4">
            <div>qwator voter</div>
            {publicKey 
            ? <div className="flex items-center justify-center gap-4"> 
                <PayoutButton />
                <WalletDisconnectButton />
             </div> 
            : <WalletMultiButton />}    
        </div>    
    )
}

export default Appbar