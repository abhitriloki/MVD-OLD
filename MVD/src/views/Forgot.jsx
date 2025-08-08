import React, { useState, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { normal, bold, regular, forgot_password, api_url, f_l, f_xs, f_m } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import PhoneInput from "react-native-phone-number-input";
import DropdownAlert from 'react-native-dropdownalert';
import axios from 'axios';
import strings from "../languages/strings";

const Forgot = (props) => {
  const navigation = useNavigation();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [formattedValue, setFormattedValue] = useState("");
  const phoneInput = useRef();
  let dropDownAlertRef = useRef();

  const go_back = () => {
    navigation.goBack();
  }

  const check_valid = () => {
    if (phoneInput.current?.isValidNumber(value)) {
      call_forgot_password();
    } else {
      dropDownAlertRef.alertWithType('error', strings.validation_error, strings.please_enter_valid_phone_number);
    }
  }

  const call_forgot_password = async () => {
    setLoading(true);
    await axios({
      method: 'post',
      url: api_url + forgot_password,
      data: { phone_with_code: formattedValue }
    })
      .then(async response => {
        setLoading(false);
        if (response.data.status == 1) {
          navigate(response.data.result);
        } else {
          dropDownAlertRef.alertWithType('error', strings.error, strings.please_enter_your_registered_phone_number);
        }
      })
      .catch(error => {
        setLoading(false);
        dropDownAlertRef.alertWithType('error',strings.error, strings.sorry_something_went_wrong);
      });
  }

  const navigate = async (data) => {
    navigation.navigate('OTP', { otp: data.otp, id: data.id, from: "forgot", phone_with_code: formattedValue, country_code: "+" + phoneInput.current?.getCallingCode(), phone_number: value });
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

  return (
    <SafeAreaView style={{ backgroundColor: colors.lite_bg, flex: 1 }}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <View style={[styles.header]}>
        <TouchableOpacity activeOpacity={1} onPress={go_back.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
          <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
        </TouchableOpacity>
      </View>
      <View style={{ margin: 20 }} />
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_l, fontFamily: bold }}>{strings.enter_your_phone_number}</Text>
        <View style={{ margin: 5 }} />
        <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: normal }}>{strings.please_enter_your_phone_number_for_reset_the_password}</Text>
        <View style={{ margin: 20 }} />
        <View style={{ width: '80%' }}>
          <PhoneInput
            ref={phoneInput}
            defaultValue={value}
            defaultCode="IN"
            onChangeText={(text) => {
              setValue(text);
            }}

            codeTextStyle={{ placeholderTextColor: colors.theme_bg_two }}
            onChangeFormattedText={(text) => {
              setFormattedValue(text);
            }}
            withDarkTheme
            autoFocus
          />
          <View style={{ margin: 30 }} />
          <TouchableOpacity onPress={check_valid.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{strings.next}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {drop_down_alert()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: colors.lite_bg,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textinput: {
    fontSize: f_l,
    color: colors.grey,
    fontFamily: regular,
    height: 60,
    backgroundColor: '#FAF9F6'
  },
});

export default Forgot;