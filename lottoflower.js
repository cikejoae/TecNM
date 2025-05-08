import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS_HERE";
const ABI = [
  "function join() external",
  "function emergencyExit() external",
  "function getCurrentFlower() external view returns (address[] memory)",
  "function getNextAmount() external view returns (uint256)"
];

export default function AbundanceFlowerApp() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentFlower, setCurrentFlower] = useState([]);
  const [nextAmount, setNextAmount] = useState("0");
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethProvider);
    }
  }, []);

  const connectWallet = async () => {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setSigner(signer);
    setUserAddress(address);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    setContract(contract);

    fetchFlower(contract);
  };

  const fetchFlower = async (contractInstance = contract) => {
    if (!contractInstance) return;
    const flower = await contractInstance.getCurrentFlower();
    const amount = await contractInstance.getNextAmount();
    setCurrentFlower(flower);
    setNextAmount(ethers.utils.formatEther(amount));
  };

  const joinFlower = async () => {
    const tx = await contract.join();
    await tx.wait();
    fetchFlower();
  };

  const exitFlower = async () => {
    const tx = await contract.emergencyExit();
    await tx.wait();
    fetchFlower();
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Card className="p-4 shadow-xl rounded-2xl">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">🌸 Abundance Flower DApp</h2>
          {userAddress ? (
            <>
              <p className="mb-2">Connected as: {userAddress}</p>
              <p className="mb-2">Current entry amount: <strong>{nextAmount} USDT</strong></p>
              <div className="flex gap-2 mb-4">
                <Button onClick={joinFlower}>Join Flower</Button>
                <Button onClick={exitFlower} variant="destructive">Emergency Exit</Button>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-2">Current Flower Members:</h4>
                <ul className="list-disc pl-5">
                  {currentFlower.map((addr, idx) => (
                    <li key={idx}>{addr}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
