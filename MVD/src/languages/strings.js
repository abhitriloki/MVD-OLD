import LocalizedStrings from 'react-native-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from "../languages/en.json";
import hi from "../languages/hi.json";

let strings = new LocalizedStrings({en:en,hi:hi});

export default strings;