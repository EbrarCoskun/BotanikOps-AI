import { initializeApp } from 'firebase/app';

import {
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDO4wiuUYfUyryBVs7hvaDv2Wc1JqYq42I",
  authDomain: "botanicai-b0ba8.firebaseapp.com",
  projectId: "botanicai-b0ba8",
  storageBucket: "botanicai-b0ba8.firebasestorage.app",
  messagingSenderId: "195995718873",
  appId: "1:195995718873:web:281e4f3d1889af9adcdac8",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});