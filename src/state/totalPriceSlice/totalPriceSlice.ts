import { createSlice } from '@reduxjs/toolkit';
import { decrement, increment } from '../counter/counterSlice';

interface CounterState {
    value: number; // Type `number` in TypeScript already supports floating-point values.
}

const initialState: CounterState = {
    value: 0,
};


export const totalPriceSlice = createSlice({
    name: 'toytalPrice',
    initialState,
    reducers: {    
        reset: (state) => {
            state.value = 0; // Reset the value to 0
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload; // Use the payload to update the value
        }
        ,
        decrementByAmount: (state, action) => {
            state.value -= action.payload; // Use the payload to update the value
        }



    },
  });

  export const { reset, incrementByAmount, decrementByAmount } = totalPriceSlice.actions;
  export default totalPriceSlice.reducer;