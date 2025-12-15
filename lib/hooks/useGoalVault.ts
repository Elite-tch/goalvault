"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GOALVAULT_ADDRESS, GOALVAULT_ABI, type Vault, type Task } from "../contracts";
import { parseEther, formatEther } from "viem";
import toast from "react-hot-toast";
import { useEffect } from "react";


// Hook to get vault counter
export function useVaultCounter() {
    const { data, isLoading, error } = useReadContract({
        address: GOALVAULT_ADDRESS,
        abi: GOALVAULT_ABI,
        functionName: "vaultCounter",
    });

    return {
        vaultCounter: data as bigint | undefined,
        isLoading,
        error,
    };
}

// Hook to get vault details
export function useVault(vaultId: bigint | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: GOALVAULT_ADDRESS,
        abi: GOALVAULT_ABI,
        functionName: "getVault",
        args: vaultId ? [vaultId] : undefined,
        query: {
            enabled: !!vaultId && vaultId > 0n,
        },
    });

    return {
        vault: data as Vault | undefined,
        isLoading,
        error,
        refetch,
    };
}

// Hook to get vault members
export function useVaultMembers(vaultId: bigint | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: GOALVAULT_ADDRESS,
        abi: GOALVAULT_ABI,
        functionName: "getVaultMembers",
        args: vaultId ? [vaultId] : undefined,
        query: {
            enabled: !!vaultId && vaultId > 0n,
        },
    });

    return {
        members: data as string[] | undefined,
        isLoading,
        error,
        refetch,
    };
}

// Hook to get member task
export function useMemberTask(vaultId: bigint | undefined, member: string | undefined, taskId: bigint | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: GOALVAULT_ADDRESS,
        abi: GOALVAULT_ABI,
        functionName: "getMemberTask",
        args: vaultId && member && taskId !== undefined ? [vaultId, member as `0x${string}`, taskId] : undefined,
        query: {
            enabled: !!vaultId && !!member && taskId !== undefined,
        },
    });

    return {
        task: data as Task | undefined,
        isLoading,
        error,
        refetch,
    };
}

// Hook to check if user has voted
export function useHasUserVoted(vaultId: bigint | undefined, member: string | undefined, taskId: bigint | undefined, voter: string | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: GOALVAULT_ADDRESS,
        abi: GOALVAULT_ABI,
        functionName: "hasUserVoted",
        args: vaultId && member && taskId !== undefined && voter ?
            [vaultId, member as `0x${string}`, taskId, voter as `0x${string}`] : undefined,
        query: {
            enabled: !!vaultId && !!member && taskId !== undefined && !!voter,
        },
    });

    return {
        hasVoted: data as boolean | undefined,
        isLoading,
        error,
        refetch,
    };
}

// Hook to check if funds can be released
export function useCanReleaseFunds(vaultId: bigint | undefined) {
    const { data, isLoading, error, refetch } = useReadContract({
        address: GOALVAULT_ADDRESS,
        abi: GOALVAULT_ABI,
        functionName: "canReleaseFunds",
        args: vaultId ? [vaultId] : undefined,
        query: {
            enabled: !!vaultId && vaultId > 0n,
        },
    });

    return {
        canRelease: data as boolean | undefined,
        isLoading,
        error,
        refetch,
    };
}

// Hook to create a vault
export function useCreateVault() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const createVault = async (
        name: string,
        financialGoal: string,
        duration: number,
        requiredTasksPerMember: number,
        taskDescriptions: string[],
        payoutAddress: string = "0x0000000000000000000000000000000000000000",
        allowedMembers: string[] = [],
        specificTasks: string[] = []
    ) => {
        const goalInWei = parseEther(financialGoal);

        writeContract({
            address: GOALVAULT_ADDRESS,
            abi: GOALVAULT_ABI,
            functionName: "createVault",
            args: [
                name,
                goalInWei,
                BigInt(duration),
                BigInt(requiredTasksPerMember),
                taskDescriptions,
                payoutAddress as `0x${string}`,
                allowedMembers as `0x${string}`[],
                specificTasks
            ],
        });
    };

    return {
        createVault,
        isPending: isPending || isConfirming,
        isSuccess,
        hash,
        error,
    };
}

// Hook to join a vault
export function useJoinVault() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const joinVault = async (vaultId: bigint, depositAmount: string) => {
        const amountInWei = parseEther(depositAmount);

        writeContract({
            address: GOALVAULT_ADDRESS,
            abi: GOALVAULT_ABI,
            functionName: "joinVault",
            args: [vaultId],
            value: amountInWei,
        });
    };

    return {
        joinVault,
        isPending: isPending || isConfirming,
        isSuccess,
        hash,
        error,
    };
}

// Hook to complete a task
export function useCompleteTask() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const completeTask = async (vaultId: bigint, taskId: bigint) => {
        writeContract({
            address: GOALVAULT_ADDRESS,
            abi: GOALVAULT_ABI,
            functionName: "completeTask",
            args: [vaultId, taskId],
        });
    };

    return {
        completeTask,
        isPending: isPending || isConfirming,
        isSuccess,
        hash,
        error,
    };
}

// Hook to verify a task
export function useVerifyTask() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const verifyTask = async (vaultId: bigint, member: string, taskId: bigint) => {
        writeContract({
            address: GOALVAULT_ADDRESS,
            abi: GOALVAULT_ABI,
            functionName: "verifyTask",
            args: [vaultId, member as `0x${string}`, taskId],
        });
    };

    return {
        verifyTask,
        isPending: isPending || isConfirming,
        isSuccess,
        hash,
        error,
    };
}

// Hook to finalize a vault
export function useFinalizeVault() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const finalizeVault = async (vaultId: bigint) => {
        toast.loading("Finalizing Vault...");
        writeContract({
            address: GOALVAULT_ADDRESS,
            abi: GOALVAULT_ABI,
            functionName: "finalizeVault",
            args: [vaultId],
        });
    };

    useEffect(() => {
        if (isSuccess) {
            toast.dismiss();
            toast.success("Vault Finalized & Settled!");
        }
    }, [isSuccess]);

    useEffect(() => {
        if (error) {
            console.error("Finalize error:", error);
            toast.dismiss();
            toast.error("Failed to finalize vault: " + (error as any).shortMessage || error.message);
        }
    }, [error]);

    return {
        finalizeVault,
        isPending: isPending || isConfirming,
        isSuccess,
        hash,
        error,
    };
}

// Hook to cancel a vault
export function useCancelVault() {
    const { writeContract, data: hash, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const cancelVault = async (vaultId: bigint) => {
        writeContract({
            address: GOALVAULT_ADDRESS,
            abi: GOALVAULT_ABI,
            functionName: "cancelVault",
            args: [vaultId],
        });
    };

    return {
        cancelVault,
        isPending: isPending || isConfirming,
        isSuccess,
        hash,
        error,
    };

}
