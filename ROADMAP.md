# Scroll GoalVault - Development Roadmap
**Target:** Scroll Vibecoding Week Hackathon (Dec 8-13)
**Goal:** Ship a "Vibey", functional MVP of a Group Task & Savings Platform on Scroll zkEVM.

---

## 🏆 Bounty Alignment Strategy
We will target three specific prize categories:
1.  **Best Onboarding ($200):** Focus on a seamless "Create -> Invite -> Join" flow. No complex setup.
2.  **Most Creative Build ($150):** Emphasize the unique mix of *Money + Productivity*.
3.  **Vibe Award ($100):** High-end UI with smooth animations (Framer Motion) and "Scroll-themed" aesthetics (Gold/Black/Cream).

---

## 📅 Roadmap Steps

### Phase 1: The "Vibe" Foundation (Immediate)
*   **Goal:** Set up the project structure and visual identity.
*   **Tasks:**
    *   [ ] Install UI dependencies (`framer-motion`, `lucide-react`, `rainbowkit`).
    *   [ ] Define "Scroll Premium" Design System (Colors: `#101010` bg, `#D4C8BE` scroll-cream text, `#FFD700` gold accents).
    *   [ ] Create the **Landing Page**: A stunning hero section explaining the concept.

### Phase 2: Smart Contract (The Logic)
*   **Goal:** A secure, simple contract deployed on **Scroll Sepolia**.
*   **Features:**
    *   `createVault(uint256 goal, string memory name)`
    *   `joinVault(uint256 vaultId)` (payable)
    *   `completeTask(uint256 vaultId, uint256 taskId)`
    *   `releaseFunds(uint256 vaultId)` (checks logic: Goal Reached? + Tasks Done?)
*   **Deliverable:** A deployed contract address and ABI.

### Phase 3: The Dashboard (The User Experience)
*   **Goal:** Where the magic happens.
*   **Views:**
    *   **Vault Dashboard:** See all vaults you are part of.
    *   **Active Vault View:**
        *   **Progress Circle:** Visualizing the savings goal.
        *   **Task List:** Interactive checkboxes (that trigger blockchain transactions).
        *   **Member Status:** Avatars showing who has paid/worked.

### Phase 4: Integration & "Wow" Factors
*   **Goal:** Connect UI to Chain and polish.
*   **Tasks:**
    *   [ ] Integrate **RainbowKit** for wallet connection (Scroll Network).
    *   [ ] **Confetti Explosion** when a Vault is fully completed.
    *   [ ] **Shareable Link** generation for inviting friends.

### Phase 5: Demo Day Prep (Final Polish)
*   **Goal:** Ensure the judges have a smooth ride.
*   **Tasks:**
    *   [ ] Verify typical "happy path" (Create -> Join -> Win).
    *   [ ] Add "Demo Data" button (optional) to populate UI for video recording.
    *   [ ] Record succinct demo video.

---

## 🛠 Tech Stack
*   **Framework:** Next.js (App Router)
*   **Styling:** TailwindCSS + Framer Motion (Animations)
*   **Blockchain:** Scroll Sepolia Testnet
*   **Libraries:** Wagmi/Viem (Contract Interaction), RainbowKit (Wallet UI)

---

## ✅ Ready to Start?
If this roadmap looks good, I will begin **Phase 1**: Installing dependencies and setting up the Design System.
