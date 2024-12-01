import React from "react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { MINT_SIZE, TOKEN_2022_PROGRAM_ID, createMintToInstruction, createAssociatedTokenAccountInstruction, getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType, mintTo, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { BatInput } from './BatInput';
import { BatButton } from './BatButton';

export function TokenLaunchpad() {
    const { connection } = useConnection();
    const wallet = useWallet();

    async function createToken() {
        const name = document.getElementById('name').value;
        const symbol = document.getElementById('symbol').value;
        const initialSupply = document.getElementById('initialSupply').value;
        const mintKeypair = Keypair.generate();
        const metadata = {
            mint: mintKeypair.publicKey,
            name: name,
            symbol: symbol,
            uri: 'https://cdn.100xdevs.com/metadata.json',
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );
            
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);

        await wallet.sendTransaction(transaction, connection);

        const associatedToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
        );

        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintKeypair.publicKey,
                TOKEN_2022_PROGRAM_ID,
            ),
        );

        await wallet.sendTransaction(transaction2, connection);

        const transaction3 = new Transaction().add(
            createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey, initialSupply, [], TOKEN_2022_PROGRAM_ID)
        );

        await wallet.sendTransaction(transaction3, connection);
    }

    return (
        <div className="h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex justify-center items-center p-4">
            <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl p-8 border-2 border-yellow-500 mt-[-70px]">
                <div className="flex items-center justify-center mb-8">
                </div>
                
                <h1 className="text-3xl font-bold text-center mb-8 text-yellow-500">
                    Knight Launch
                </h1>
                
                <div className="space-y-6">
                    <BatInput
                        id="name"
                        label="Token Name"
                        type="text"
                        placeholder="Enter token name"
                    />
                    
                    <BatInput
                        id="symbol"
                        label="Token Symbol"
                        type="text"
                        placeholder="Enter token symbol"
                    />
                    
                    <BatInput
                        id="initialSupply"
                        label="Initial Supply"
                        type="text"
                        placeholder="Enter initial supply"
                    />
                    
                    <div className="flex justify-center mt-8">
                        <BatButton onClick={createToken}>
                            Forge Token
                        </BatButton>
                    </div>
                </div>
            </div>
        </div>
    );
}