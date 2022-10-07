/* eslint-disable radix */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSura: [],
  currentIndex: 0,
  isActive: false,
  isPlaying: false,
  activeSura: {},
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setActiveSura: (state, action) => {
      state.activeSura = action.payload?.sura;
      // {
      //   // eslint-disable-next-line no-unsafe-optional-chaining
      //   ...action.payload?.audioData[parseInt(action.payload?.sura?.id - 1)],
      //   ...action.payload.sura,
      // };

      if (action.payload?.audioData?.audio_files) {
        state.currentSura = action.payload?.audioData?.audio_files;
      } else {
        state.currentSura = action.payload?.data;
      }

      state.currentIndex = action.payload.i;
      state.isActive = true;
    },

    nextSura: (state, action) => {
      if (state.currentSura[action.payload]?.track) {
        state.activeSura = state.currentSura[action.payload]?.data;
      } else {
        state.activeSura = state.currentSura[action.payload];
      }

      state.currentIndex = action.payload;
      state.isActive = true;
    },

    prevSura: (state, action) => {
      if (state.currentSura[action.payload]?.track) {
        state.activeSura = state.currentSura[action.payload]?.track;
      } else {
        state.activeSura = state.currentSura[action.payload];
      }

      state.currentIndex = action.payload;
      state.isActive = true;
    },

    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },

    selectGenreListId: (state, action) => {
      state.genreListId = action.payload;
    },
  },
});

export const {
  setActiveSura,
  nextSura,
  prevSura,
  playPause,
  selectGenreListId,
} = playerSlice.actions;

export default playerSlice.reducer;
