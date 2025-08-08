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
import { normal, bold, regular, check_phone, api_url, f_l, f_xs, f_m, btn_loader } from '../config/Constants';
import PhoneInput from "react-native-phone-number-input";
import DropdownAlert from 'react-native-dropdownalert';
import axios from 'axios';
import strings from "../languages/strings";
import { Picker } from '@react-native-picker/picker';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const CheckPhone = (props) => {
    const navigation = useNavigation();
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [formattedValue, setFormattedValue] = useState("");
    const phoneInput = useRef();
    let dropDownAlertRef = useRef();
    const [language, setLanguage] = useState(global.lang);

    const check_valid = () => {
        if (phoneInput.current?.isValidNumber(value)) {
            call_check_phone();
        } else {
            dropDownAlertRef.alertWithType('error', strings.validation_error, strings.please_enter_valid_number);
        }
    }

    const language_change = async (lang) => {
        if (global.lang != lang) {
            try {
                await AsyncStorage.setItem('lang', lang);
                await strings.setLanguage(lang);
                global.lang = await lang;
                if (lang == 'hi') {
                    global.lang = await lang;
                    await RNRestart.Restart();
                } else {
                    global.lang = await lang;
                    await RNRestart.Restart();
                }
            } catch (e) {

            }
        }
    }

    const call_check_phone = async () => {
        setLoading(true);
        await axios({
            method: 'post',
            url: api_url + check_phone,
            data: { phone_with_code: formattedValue }
        })
            .then(async response => {
                setLoading(false);
                navigate(response.data.result);
            })
            .catch(error => {
                setLoading(false);
                dropDownAlertRef.alertWithType('error', strings.error, strings.sorry_something_went_wrong);
            });
    }

    const navigate = async (data) => {
        if (data.is_available == 1) {
            navigation.navigate('Password', { phone_number: formattedValue });
        } else {
            navigation.navigate('OTP', { otp: data.otp, phone_with_code: formattedValue, country_code: "+" + phoneInput.current?.getCallingCode(), phone_number: value, id: 0, from: "register" });
        }
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
            <View style={[styles.header]} />
            <View style={{ margin: 20 }} />
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_l, fontFamily: bold }}>{strings.enter_your_mobile_number}</Text>
                <View style={{ margin: 5 }} />
                <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: normal }}>{strings.you_need_enter_your_phone_number}</Text>
                <View style={{ margin: 20 }} />
                <View style={{ width: '80%' }}>
                    <PhoneInput
                        ref={phoneInput}
                        defaultValue={value}
                        defaultCode="IN"
                        placeholderTextColor={colors.grey}
                        placeholder={strings.phone_number}
                        onChangeText={(text) => {
                            setValue(text);
                        }}
                        // codeTextStyle={{ placeholderTextColor: colors.theme_bg_two }}
                        onChangeFormattedText={(text) => {
                            setFormattedValue(text);
                        }}
                        withDarkTheme
                        autoFocus
                    />
                    <View style={{ justifyContent: 'center', alignItems: 'flex-end' }}>
                        <Picker
                            selectedValue={language}
                            style={{ height: 100, width: 150, color: colors.theme_fg }}
                            itemStyle={{ fontFamily: normal }}
                            onValueChange={(itemValue, itemIndex) =>
                                language_change(itemValue)
                            }>
                            <Picker.Item label={strings.english} value="en" />
                            <Picker.Item label={strings.hindi} value="hi" />
                        </Picker>
                    </View>
                    <View style={{ margin: 10 }} />
                    {loading == false ?
                        <TouchableOpacity onPress={check_valid.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{strings.login}/{strings.register}</Text>
                        </TouchableOpacity>
                        :
                        <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                            <LottieView source={btn_loader} autoPlay loop />
                        </View>
                    }
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

export default CheckPhone;