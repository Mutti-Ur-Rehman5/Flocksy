import { createSlice } from "@reduxjs/toolkit"
const modeSlice=createSlice({
    name:"mode",
    initialState:{
        currentMode:"ADULT"
    },
    reducers:{
        setCurrentMode:(state,action)=>{
            state.currentMode=action.payload
        }
    }
})

export const {setCurrentMode}=modeSlice.actions
export default modeSlice.reducer
