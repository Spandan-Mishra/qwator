import { useWallet } from "@solana/wallet-adapter-react"
import { useState } from "react";
import { Button } from "./ui/button";
import axios from "axios";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const PayoutButton = () => {
    const { publicKey, signMessage } = useWallet();
    const [balance, setBalance] = useState<number>(0);
    const [refreshed, setRefreshed] = useState<boolean>(false);

    const handlePayout = async () => {
        axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/voter/payout`, {

        }, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })

        setRefreshed(false);
    }

    const refreshBalance = async () => {
        const res = axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/voter/balance`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        })

        setBalance((await res).data.balance / LAMPORTS_PER_SOL)
        setRefreshed(true);
    }

    return (
        <Button
            onClick={refreshed ? handlePayout : refreshBalance}
        >
            {refreshed ? `Payout ${balance} SOL` : "Refresh Balance"}
        </Button>
    )
}