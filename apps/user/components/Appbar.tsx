"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletConnectButton, WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const Appbar = () => {
    const { publicKey, signMessage, disconnect } = useWallet();

    useEffect(() => {
        const signIn = async () => {
            if (!publicKey) {
                return ;
            }

            const message = new TextEncoder().encode(`Sign in to qwator with wallet ${publicKey.toBase58()} as a user`);
            const signature = await signMessage?.(message);

            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/signin`, {
                    signature: signature,
                    address: publicKey.toString()
                });

                toast.success("Signed in successfully");
                localStorage.setItem('token', res.data.token);
            } catch (error) {
                toast.error("Failed to sign in");
                disconnect();
            }
        }
        signIn()
    }, [publicKey])

    return (
        <div className="w-screen flex justify-between items-center p-4">
            <div>qwator</div>
            {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}    
        </div>    
    )
}

export default Appbar