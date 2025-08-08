import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  FlatList,
  Linking,
  Platform
} from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { screenHeight, screenWidth, normal, bold, regular, trip_details, api_url, change_trip_status, GOOGLE_KEY, btn_loader, LATITUDE_DELTA, LONGITUDE_DELTA, trip_cancel, loader, f_xs, f_m, f_s, sos } from '../config/Constants';
import BottomSheet from 'react-native-simple-bottom-sheet';
import Icon, { Icons } from '../components/Icons';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import LottieView from 'lottie-react-native';
import { Badge } from '@rneui/themed';
import axios from 'axios';
import Dialog, { DialogTitle, SlideAnimation, DialogContent, DialogFooter, DialogButton } from 'react-native-popup-dialog';
import { connect } from 'react-redux';
import DialogInput from 'react-native-dialog-input';
import DropdownAlert from 'react-native-dropdownalert';
import DropShadow from "react-native-drop-shadow";
import database from '@react-native-firebase/database';
import strings from "../languages/strings";

const Trip = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  let dropDownAlertRef = useRef();
  const [trip_id, setTripId] = useState(route.params.trip_id);
  const [from, setFrom] = useState(route.params.from);
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancel_loading, setCancelLoading] = useState(false);
  const [on_load, setOnLoad] = useState(0);
  const [cancellation_reason, setCancellationReasons] = useState([]);
  const [dialog_visible, setDialogVisible] = useState(false);
  const [otp_dialog_visible, setOtpDialogVisible] = useState(false);
  const [end_otp_dialog_visible, setEndOtpDialogVisible] = useState(false);
  const [pickup_statuses, setPickupStatuses] = useState([1, 2]);
  const [drop_statuses, setDropStatuses] = useState([3, 4]);
  const [cancellation_statuses, setCancellationStatuses] = useState([6, 7]);
  const map_ref = useRef();
  const [region, setRegion] = useState({
    latitude: props.initial_lat,
    longitude: props.initial_lng,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const go_back = () => {
    if (from == 'home') {
      navigation.navigate('Dashboard')
    } else {
      navigation.goBack();
    }
  }

  useEffect(() => {
    call_trip_details();
    const onValueChange = database().ref(`/trips/${trip_id}`)
      .on('value', snapshot => {
        if (snapshot.val().status != data.status) {
          call_trip_details();
        }
      });
    return (
      onValueChange
    );
  }, []);

  const call_trip_details = async () => {
    console.log(1)
    setLoading(true);
    await axios({
      method: 'post',
      url: api_url + trip_details,
      data: { trip_id: trip_id }
    })
      .then(async response => {
        console.log(2)
        setLoading(false);
        if (response.data.result.trip.status == 5 && from == 'home') {
          navigation.navigate('Bill', { trip_id: trip_id, from: from });
        } else if (cancellation_statuses.includes(parseInt(response.data.result.trip.status)) && from == 'home') {
          navigate_home();
        }
        setData(response.data.result);
        if (response.data.result.trip.status == 10) {
          setLoading(true);
          await axios({
            method: 'post',
            url: api_url + change_trip_status,
            data: { trip_id: trip_id, status: 10 }
          })
            .then(async responsee => {
              console.log(6)
              call_trip_details();
            })
            .catch(error => {
              setLoading(false);
            });
        }
        setCancellationReasons(response.data.result.cancellation_reasons);
        setOnLoad(1);
      })
      .catch(error => {
        setLoading(false);
      });
  }

  const onRegionChange = async () => {
    console.log(4)
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + props.change_location.latitude + ',' + props.change_location.longitude + '&key=' + GOOGLE_KEY)
      .then((response) => response.json())
      .then(async (responseJson) => {
        console.log(responseJson)
        if (responseJson.results[2].formatted_address != undefined) {
          setRegion({
            latitude: props.change_location.latitude,
            longitude: props.change_location.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          })
          call_change_trip_status(responseJson.results[2].formatted_address);
        }
      })
  }

  const call_change_trip_status = async (address) => {
    console.log({ trip_id: trip_id, status: data.trip.new_status.id, address: address, lat: props.change_location.latitude, lng: props.change_location.longitude })
    setLoading(true);
    await axios({
      method: 'post',
      url: api_url + change_trip_status,
      data: { trip_id: trip_id, status: data.trip.new_status.id, address: address, lat: props.change_location.latitude, lng: props.change_location.longitude }
    })
      .then(async response => {
        console.log(6)
        console.log(response)
        call_trip_details();
      })
      .catch(error => {
        console.log(7)
        console.log(error)
        setLoading(false);
      });
  }

  const showDialog = () => {
    setDialogVisible(true);
  }

  const call_trip_cancel = async (reason_id, type) => {
    console.log({ trip_id: trip_id, status: 7, reason_id: reason_id, cancelled_by: type })
    setDialogVisible(false)
    setCancelLoading(true);
    await axios({
      method: 'post',
      url: api_url + trip_cancel,
      data: { trip_id: trip_id, status: 7, reason_id: reason_id, cancelled_by: type }
    })
      .then(async response => {
        setCancelLoading(false)
        console.log('success')
      })
      .catch(error => {
        //alert(error)
        setCancelLoading(false);
      });
  }

  const navigate_home = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Home" }],
      })
    );
  }

  const call_dialog_visible = () => {
    setDialogVisible(false)
  }

  const check_otp = () => {
    if (data.trip.new_status.id == 3) {
      setOtpDialogVisible(true);
    }else if (data.trip.new_status.id == 4) {
      setEndOtpDialogVisible(true);
    }  else {
      onRegionChange();
    }
  }

  const verify_otp = async (val) => {
    console.log(val +'-'+data.trip.otp)
    if (val == data.trip.otp) {
      setOtpDialogVisible(false);
      await onRegionChange();
    } else {
      await dropDownAlertRef.alertWithType('error', strings.validation_error, strings.enter_valid_otp);
      closeOtpDialog();
    }
  }

  const end_verify_otp = async (val) => {
    if (val == data.trip.otp) {
      setEndOtpDialogVisible(false);
      await onRegionChange();
    } else {
      await dropDownAlertRef.alertWithType('error', strings.validation_error, strings.enter_valid_otp);
      closeEndOtpDialog();
    }
  }

  const closeOtpDialog = () => {
    setOtpDialogVisible(false)
  }

  const closeEndOtpDialog = () => {
    setEndOtpDialogVisible(false)
  }

  const drop_down_alert = () => {
    return (
      <DropdownAlert
        ref={(ref) => {
          if (ref) {
            dropDownAlertRef = ref;
          }
        }}
      />
    )
  }

  const redirection = () => {
    if (pickup_statuses.includes(parseInt(data.trip.status))) {
      var lat = data.trip.pickup_lat;
      var lng = data.trip.pickup_lng;
    } else {
      var lat = data.trip.drop_lat;
      var lng = data.trip.drop_lng;
    }

    if (lat != 0 && lng != 0) {
      var scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
      var url = scheme + `${lat},${lng}`;
      if (Platform.OS === 'android') {
        Linking.openURL("google.navigation:q=" + lat + " , " + lng + "&mode=d");
      } else {
        Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng + '&travelmode=driving');
      }
    }
  }

  const call_customer = (phone_number) => {
    Linking.openURL(`tel:${phone_number}`)
  }

  const call_chat = (data) => {
    navigation.navigate("Chat", { data: data, trip_id: trip_id })
  }

  const call_sos_number = () => {
    Linking.openURL(`tel:${data.trip.hospital.contact_number}`)
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={map_ref}
        style={styles.map}
        region={region}
      >
      </MapView>
      {on_load == 1 &&
        <View>
          {from == 'home' &&
            <View style={{ flexDirection: 'row' }}>
              <DropShadow
                style={{
                  width: '50%',
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },
                  shadowOpacity: 0.3,
                  shadowRadius: 25,
                }}
              >
                <TouchableOpacity activeOpacity={0} onPress={go_back.bind(this)} style={{ width: 40, height: 40, backgroundColor: colors.theme_bg_three, borderRadius: 25, alignItems: 'center', justifyContent: 'center', top: 20, left: 20 }}>
                  <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.icon_active_color} style={{ fontSize: 22 }} />
                </TouchableOpacity>
              </DropShadow>
              {on_load == 1 &&
                <TouchableOpacity onPress={call_sos_number.bind(this)} activeOpacity={1} style={{ width: '50%', alignItems: 'flex-end' }}>
                  {drop_statuses.includes(data.trip.status) &&
                    <DropShadow
                      style={{
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 0,
                        },
                        shadowOpacity: 0.3,
                        shadowRadius: 25,
                      }}
                    >
                      <View style={{ width: 60, height: 60, backgroundColor: colors.theme_bg_three, borderRadius: 30, alignItems: 'center', justifyContent: 'center', top: 20, right: 20 }}>
                        <LottieView source={sos} autoPlay loop />
                      </View>
                    </DropShadow>
                  }
                </TouchableOpacity>
              }
            </View>
          }
        </View>
      }
      <BottomSheet sliderMinHeight={190} sliderMaxHeight={screenHeight - 200} isOpen>
        {(onScrollEndDrag) => (
          <ScrollView onScrollEndDrag={onScrollEndDrag}>
            <View style={{ padding: 10 }}>
              {on_load == 1 ?
                <View>
                  <View style={{ borderBottomWidth: 0.5, borderColor: colors.grey }}>
                    <View style={{ width: '100%', marginBottom: 10 }}>
                      {pickup_statuses.includes(parseInt(data.trip.status)) &&
                        <TouchableOpacity onPress={redirection.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three }}>
                          <View style={{ flexDirection: 'row', width: '100%', height: 50 }}>
                            <View style={{ width: '10%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 }}>
                              <Badge status="success" />
                            </View>
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                              <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>{strings.pickup_address}</Text>
                              <View style={{ margin: 2 }} />
                              <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: regular }}>{data.trip.pickup_address}</Text>
                            </View>
                            <View style={{ width: '10%', alignItems: 'flex-end', justifyContent: 'center', paddingTop: 4 }}>
                              <Icon type={Icons.MaterialCommunityIcons} name="navigation-variant" color={colors.theme_fg_two} style={{ fontSize: 25 }} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      }
                      {drop_statuses.includes(parseInt(data.trip.status)) && data.trip.trip_type != 2 &&
                        <TouchableOpacity onPress={redirection.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three }}>
                          <View style={{ flexDirection: 'row', width: '100%', height: 50 }}>
                            <View style={{ width: '10%', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 4 }}>
                              <Badge status="error" />
                            </View>
                            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                              <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>{strings.drop_address}</Text>
                              <View style={{ margin: 2 }} />
                              <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: regular }}>{data.trip.drop_address}</Text>
                            </View>
                            <View style={{ width: '10%', alignItems: 'flex-end', justifyContent: 'center', paddingTop: 4 }}>
                              <Icon type={Icons.MaterialCommunityIcons} name="navigation-variant" color={colors.theme_fg_two} style={{ fontSize: 25 }} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      }
                      {drop_statuses.includes(parseInt(data.trip.status)) && data.trip.trip_type == 2 &&
                        <TouchableOpacity activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three }}>
                          <View style={{ flexDirection: 'row', marginBottom: 20, marginLeft: 10, marginRight: 10 }}>
                            <View style={{ width: '10%' }}>
                              <Icon type={Icons.MaterialIcons} name="schedule" color={colors.icon_inactive_color} style={{ fontSize: 22 }} />
                            </View>
                            <View style={{ width: '90%' }}>
                              <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: f_m, fontFamily: bold }}>{data.trip.package_details.hours} hrs {data.trip.package_details.kilometers} {strings.km_package}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>
                      }
                    </View>
                  </View>
                  {data.trip.status <= 2 &&
                    <View style={{ borderBottomWidth: 0.5, borderTopWidth: 0.5, borderColor: colors.grey }}>
                      <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, marginBottom: 10 }}>
                        <TouchableOpacity onPress={call_chat.bind(this, data.customer)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon type={Icons.MaterialIcons} name="chat" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                        </TouchableOpacity>
                        <View style={{ width: '5%' }} />
                        <TouchableOpacity onPress={call_customer.bind(this, data.trip.customer.phone_number)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon type={Icons.MaterialIcons} name="call" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                        </TouchableOpacity>
                        <View style={{ width: '10%' }} />
                        {cancel_loading == false ?
                          <TouchableOpacity onPress={showDialog.bind(this)} activeOpacity={1} style={{
                            width: '55%', backgroundColor:
                              colors.error_background, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.error, fontFamily: bold }}>
                              {strings.cancel}
                            </Text>
                          </TouchableOpacity>
                          :
                          <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                            <LottieView source={loader} autoPlay loop />
                          </View>
                        }
                      </View>
                    </View>
                  }
                  <View style={{ borderColor: colors.grey }}>
                    <View style={{ flexDirection: 'row', width: '100%', marginTop: 10, marginBottom: 10, alignItems: 'center', justifyContent: 'center' }}>
                      <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>{strings.total_trip_distance}</Text>
                      <View style={{ margin: 2 }} />
                      <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: bold }}>{data.trip.distance} {strings.km}</Text>
                      {/*                       <View style={{ width: '33%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>Trip Type</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                          <Icon type={Icons.MaterialIcons} name="commute" color={colors.theme_fg_two} style={{ fontSize: 22 }} />
                          <View style={{ margin: 2 }} />
                          <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: normal }}>{data.trip.trip_type_name}</Text>
                        </View>
                      </View>
                      <View style={{ width: '33%', alignItems: 'center', justifyContent: 'center' }}>
                        <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: regular }}>Estimated Fare</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                          <Icon type={Icons.MaterialIcons} name="local-atm" color={colors.theme_fg_two} style={{ fontSize: 22 }} />
                          <View style={{ margin: 2 }} />
                          <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: normal }}>{global.currency}{data.trip.total}</Text>
                        </View>
                      </View> */}
                    </View>
                  </View>
                  <DialogInput
                    isDialogVisible={otp_dialog_visible}
                    title={strings.enter_your_otp}
                    message={strings.collect_your_otp_from_your_patient}
                    textInputProps={{ keyboardType: "phone-pad" }}
                    submitInput={(inputText) => { verify_otp(inputText) }}
                    closeDialog={() => { closeOtpDialog(false) }}
                    submitText={strings.submit}
                    cancelText={strings.cancel}
                    modelStyle={{ fontFamily: regular, fontSize: 14, textColor: colors.theme_fg }}>
                  </DialogInput>
                
                  <DialogInput
                    isDialogVisible={end_otp_dialog_visible}
                    title={strings.enter_your_otp}
                    message={strings.collect_your_otp_from_your_patient}
                    textInputProps={{ keyboardType: "phone-pad" }}
                    submitInput={(inputText) => { end_verify_otp(inputText) }}
                    closeDialog={() => { closeEndOtpDialog(false) }}
                    submitText={strings.submit}
                    cancelText={strings.cancel}
                    modelStyle={{ fontFamily: regular, fontSize: 14, textColor: colors.theme_fg }}>
                  </DialogInput>
                 
                  {data.trip.status < 5 &&
                    <View>
                      {loading == false ?
                        <View>
                          {global.lang == 'en' ?
                            <TouchableOpacity onPress={check_otp.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                              <Text onPress={check_otp.bind(this)} style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{data.trip.new_status.status_name}</Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity onPress={check_otp.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                              <Text onPress={check_otp.bind(this)} style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{data.trip.new_status.status_name_ar}</Text>
                            </TouchableOpacity>
                          }
                        </View>
                        :
                        <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                          <LottieView source={btn_loader} autoPlay loop />
                        </View>
                      }
                    </View>
                  }
                  <Dialog
                    visible={dialog_visible}
                    width={'90%'}
                    animationDuration={100}
                    dialogTitle={<DialogTitle title={strings.reason_to_cancel_your_ride} />}
                    dialogAnimation={new SlideAnimation({
                      slideFrom: 'bottom',
                    })}
                    footer={
                      <DialogFooter>
                        <DialogButton
                          text="Close"
                          textStyle={{ fontSize: f_m, color: colors.theme_fg_two, fontFamily: regular }}
                          onPress={call_dialog_visible.bind(this)}
                        />
                      </DialogFooter>
                    }
                    onTouchOutside={() => {
                      call_dialog_visible()
                    }}
                  >
                    <DialogContent>
                      <FlatList
                        data={cancellation_reason}
                        renderItem={({ item, index }) => (
                          <TouchableOpacity onPress={call_trip_cancel.bind(this, item.id, item.type)} activeOpacity={1} >
                            <View style={{ padding: 10 }}>
                              <Text style={{ fontFamily: regular, fontSize: f_xs, color: colors.theme_fg_two }}>{item.reason}</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        keyExtractor={item => item.id}
                      />
                    </DialogContent>
                  </Dialog>
                </View>
                :
                <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <Text style={{ color: colors.theme_fg_two, fontSize: f_s, fontFamily: regular }}>{strings.loading}</Text>
                </View>
              }
            </View>
          </ScrollView>
        )}
      </BottomSheet>
      {drop_down_alert()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: screenHeight,
    width: screenWidth,
    backgroundColor: colors.lite_bg
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

function mapStateToProps(state) {
  return {
    change_location: state.change_location.change_location,
    initial_lat: state.booking.initial_lat,
    initial_lng: state.booking.initial_lng,
    initial_region: state.booking.initial_region,
  };
}

export default connect(mapStateToProps, null)(Trip);