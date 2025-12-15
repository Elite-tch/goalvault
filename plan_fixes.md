# Implementation Plan: Fixes for SyncVault

This document outlines the changes I will make to address your feedback regarding the Create Task form, Certificate generation, Automation of funds, and Invite Links.

## 1. Create Task Form & Inputs
**Issue:** The form needs to clearly separate the Project Name from the Tasks. Each member needs explicit inputs for Name, Wallet, and their Specific Task.
**Fix:**
- I will add a dedicated **"Project Name"** input field at the top of the form.
- The **Member List** will explicitly show three fields for every member:
  1. **Member Name**
  2. **Wallet Address**
  3. **Assigned Task** (e.g., "Create Hero Section", "Build API")
- I will ensure these specific tasks are passed correctly to the smart contract so they appear on the dashboard.

## 2. Certificate Generation
**Issue:** Certificate is not downloading, and needs to include Project Name, Member Name, Wallet, and Assigned Task.
**Fix:**
- I will debug the `html-to-image` or `html2canvas` download logic in `CertificateCard`.
- I will update the Certificate Design to include:
  - **Project Name** (Vault Name)
  - **Member Name** & **Wallet**
  - **Specific Assigned Task**
- I will ensure the template looks professional and premium.

## 3. Automation (Funds Release & Refund)
**Issue:** "Release Funds" is manual (button). Refund is returning 0 value.
**Fix:**
- **Auto-Release:** I will modify the Smart Contract (`GoalVault.sol`). When the **last task** is verified, the contract will **automatically** check if all conditions are met and release the funds immediately. No manual button required.
- **Refund Fix:** The 0 value refund likely means the `depositedAmount` wasn't tracked or the penalty calculation resulted in 0.
  - I will verify the `joinVault` function ensures `depositedAmount` is stored.
  - I will verify the `claimRefund` deduction logic.
  - *Note:* If the penalty (10%) is deducted, the user gets 90%. If they deposited 0.01 ETH, they get 0.009 ETH. If the transaction shows 0, it might be a logic error I will find and fix.

## 4. Invite Links & Security
**Issue:** Invite links allowing any wallet to pay/join if they have the link. Links should be specific to the assigned wallet.
**Fix:**
- **URL Pattern:** I will change the invite link to: `.../join/task/<VaultId>?amount=...&invitee=<WalletAddress>`.
- **UI Validation:** Expected behavior: If I open a link meant for `0xAbc...` but I connect with `0xXyz...`, the page will say **"Wrong Wallet. This invite is for 0xAbc..."**.
- **Contract Security:** The contract `isPrivate` check already enforces this, but the UI update will prevent the user from even trying (and wasting gas) if they are using the wrong wallet.

---
**Proceeding with these changes now.**
