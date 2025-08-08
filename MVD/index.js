import {AppRegistry, LogBox} from 'react-native';
import React from 'react';
import allReducers from './src/reducers/index.js';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import App from './App';
import {name as appName} from './app.json';
import InternetConnectionAlert from "react-native-internet-connection-alert";

const store = createStore(allReducers);
const ReduxApp = () => (
	<Provider store = { store }>
	    <InternetConnectionAlert
			onChange={(connectionState) => {
				console.log("Connection State: ", connectionState);
			}}>
			<App />
		</InternetConnectionAlert>
	</Provider>
)

LogBox.ignoreAllLogs();
AppRegistry.registerComponent(appName, () => ReduxApp);