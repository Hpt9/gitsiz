import { create } from "zustand";

const loggedStore = create((set) => ({
  loggedIn: true,
  setLoggedIn: (loggedIn) => {
    set({ loggedIn });
  },
}));

export default loggedStore;
