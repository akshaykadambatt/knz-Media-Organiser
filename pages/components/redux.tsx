import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface HandleState {
    folder: any,
    db: any
}

const initialState: HandleState = {
    folder: {},
    db: {}
}

export const handleSlice = createSlice({
    name: 'handle',
    initialState,
    reducers: {
        setFolderDirHandle: (state, action: PayloadAction<any>) => {
            state.folder = action.payload
        },
        setDbFileHandle: (state, action: PayloadAction<any>) => {
            state.db = action.payload
        }
    }
})

export const { setFolderDirHandle, setDbFileHandle } = handleSlice.actions

export default handleSlice.reducer
