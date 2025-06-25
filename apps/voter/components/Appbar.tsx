"use client";

import { Button } from "./ui/button";

const Appbar = () => {
    return (
        <div className="w-screen flex justify-between items-center p-4">
            <div>qwator</div>
            <Button variant="default" onClick={() => {alert('Connect Wallet')}}>
                Connect Wallet
            </Button>
        </div>    
    )
}

export default Appbar