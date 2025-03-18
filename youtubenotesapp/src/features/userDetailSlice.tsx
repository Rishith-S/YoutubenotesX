import { createSlice } from "@reduxjs/toolkit";

export interface UserDetails {
  name: string;
  email: string;
  accessToken: string;
  message:string
}

const initialState = {
  name: "",
  email: "",
  accessToken: "",
  message:""
};

export const userDetailSlice = createSlice({
  name: "User Details",
  initialState,
  reducers: {
    setUserDetails: (
      state: UserDetails,
      action: {
        payload: UserDetails
      }
    ) => {
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.accessToken = action.payload.accessToken;
      state.message = action.payload.message;
    },
    clearMessage : (
      state: UserDetails,
    ) => {
      state.message = ""
    },
    userLogout: (state: UserDetails) => {
      state.name = "";
      state.email = "";
      state.accessToken = "";
      state.message = "";
    },
  },
});

export const { setUserDetails, clearMessage, userLogout } = userDetailSlice.actions;
export default userDetailSlice.reducer;
