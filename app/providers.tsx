"use client";

import * as React from "react";
import {
    RainbowKitProvider,
    getDefaultWallets,
    getDefaultConfig,
    darkTheme,
} from "@rainbow-me/rainbowkit";
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import {
    scrollSepolia,
    scroll,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
    appName: "Scroll GoalVault",
    projectId: "YOUR_PROJECT_ID", // TODO: User needs to replace this (WalletConnect)
    wallets: [
        ...wallets,
        {
            groupName: "Other",
            wallets: [argentWallet, trustWallet, ledgerWallet],
        },
    ],
    chains: [
        scrollSepolia,
        scroll
    ],
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#ffd675', // Scroll Gold
                        accentColorForeground: 'black',
                        borderRadius: 'large',
                        fontStack: 'system',
                        overlayBlur: 'small',
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
