import React, { useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Platform,
  StatusBar,
  PermissionsAndroid,
} from "react-native";
import {
  logo,
  app_settings,
  api_url,
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  government,
  health,
  jharkhand
} from "../config/Constants";
import { useNavigation, CommonActions } from "@react-navigation/native";
import * as colors from "../assets/css/Colors";
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, { Importance } from "react-native-push-notification";
import axios from 'axios';
import { initialLat, initialLng, initialRegion } from '../actions/BookingActions';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Geolocation from '@react-native-community/geolocation';
import VersionNumber from 'react-native-version-number';
import strings from "../languages/strings";

const Splash = (props) => {
  const navigation = useNavigation();
  const app_version_code = VersionNumber.buildVersion;

  useEffect(() => {
    if (Platform.OS == "android") {
      configure();
      channel_create();
      call_settings();

    } else {
      global.fcm_token = '123456'
      call_settings();
    }
  }, []);

  const call_settings = async () => {
    await axios({
      method: 'get',
      url: api_url + app_settings
    })
      .then(async response => {
        if (response.data.result.android_latest_version.version_code > app_version_code) {
          navigate_update_app('https://play.google.com/store/apps/details?id=com.zcabs.partner');
        } else {
          home(response.data.result);
        }
      })
      .catch(error => {
        console.log(error)
        //alert(strings.sorry_something_went_wrong);
      });
  }

  const navigate_update_app = (url) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "AppUpdate", params: { url: url } }],
      })
    );
  }

  const home = async (data) => {
    const id = await AsyncStorage.getItem('id');
    const first_name = await AsyncStorage.getItem('first_name');
    const phone_with_code = await AsyncStorage.getItem('phone_with_code');
    const aadhar_number = await AsyncStorage.getItem('aadhar_number');
    const lang = await AsyncStorage.getItem('lang');
    global.live_status = await AsyncStorage.getItem('online_status');
    const profile_picture = await AsyncStorage.getItem('profile_picture');
    global.stripe_key = data.stripe_key;
    global.razorpay_key = data.razorpay_key;
    global.app_name = data.app_name;
    global.language_status = data.language_status;
    global.default_language = data.default_language;
    global.polyline_status = data.polyline_status;
    global.driver_trip_time = data.driver_trip_time;
    global.mode = data.mode;
    global.currency = data.default_currency_symbol;

    
    //Note
    global.lang = 'hi';
    if(lang){
      strings.setLanguage(lang);
      global.lang = await lang;
    }else{
      strings.setLanguage('hi');
      global.lang = await 'hi';
    }

    if (id !== null) {
      global.id = id;
      global.first_name = first_name;
      global.phone_with_code = phone_with_code;
      global.aadhar_number = aadhar_number;
      global.profile_picture = profile_picture;
      check_location();
    } else {
      global.id = 0;
      check_location();
    }
  }

  const channel_create = () => {
    PushNotification.createChannel(
      {
        channelId: "taxi_booking", // (required)
        channelName: "Booking", // (required)
        channelDescription: "Taxi Booking Solution", // (optional) default: undefined.
        playSound: true, // (optional) default: true
        soundName: "uber.mp3", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
  }

  const configure = () => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        global.fcm_token = token.token;
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  }
  const check_location = async () => {
    if (Platform.OS === "android") {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })
        .then(async data => {
          try {
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
              'title': strings.app_access_your_location_for_tracking_in_background,
              'message': app_name +  strings.will_track_your_location_in_background_when_the_app_is_closed_or_not_in_use
            }
            )
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              await getInitialLocation();
            } else {
              navigation.navigate('LocationEnable');
              alert(strings.sorry_unable_to_fetch_your_location);
            }
          } catch (err) {
            console.log(err)
            console.log(1)
            navigation.navigate('LocationEnable');
          }
        }).catch(err => {
          console.log(err)
          console.log(2)
          navigation.navigate('LocationEnable');
        });
    } else {
      await getInitialLocation();
    }
  }

  const getInitialLocation = async () => {
    Geolocation.getCurrentPosition(async (position) => {
      let location = position.coords;
      let region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      }
      await props.initialRegion(region);
      await props.initialLat(location.latitude);
      await props.initialLng(location.longitude);
      setTimeout(() => {
        navigate();
      }, 3000)
    }, error => navigation.navigate('LocationEnable'),
      { enableHighAccuracy: false, timeout: 10000 });
  }

  const navigate = () => {
    if (global.id > 0) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    } else {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "CheckPhone" }],
        })
      );
    }
  }

  return (
    <TouchableOpacity activeOpacity={1} style={styles.background}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <View style={styles.logo_container}>
        <Image style={styles.logo} source={logo} />
      </View>
      <View style={styles.logo_subcontainer}>
        <Image style={styles.logo} source={government} />
      </View>
      <View style={styles.logo_subcontainer}>
        <Image style={styles.logo} source={health} />
      </View>
      <View style={styles.logo_subcontainer}>
        <Image style={styles.logo} source={jharkhand} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  background: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.theme_bg_three,
  },
  logo_container: {
    height: 196,
    width: 196,
  },
  logo_subcontainer: {
    height: 150,
    width: 150,
  },
  logo: {
    height: undefined,
    width: undefined,
    flex: 1,
    borderRadius: 98
  }
});

function mapStateToProps(state) {
  return {
    initial_lat: state.booking.initial_lat,
    initial_lng: state.booking.initial_lng,
    initial_region: state.booking.initial_region,
  };
}

const mapDispatchToProps = (dispatch) => ({
  initialLat: (data) => dispatch(initialLat(data)),
  initialLng: (data) => dispatch(initialLng(data)),
  initialRegion: (data) => dispatch(initialRegion(data))
});

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
