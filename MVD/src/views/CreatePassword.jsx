import React, { useState, useEffect, useRef } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    SafeAreaView,
    StatusBar,
    Image,
    TextInput,
    Keyboard
} from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { api_url, register, normal, bold, regular, success_icon, btn_loader, f_xl, f_xs, f_m } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import DropdownAlert from 'react-native-dropdownalert';
import { connect } from 'react-redux';
import axios from 'axios';
import LottieView from 'lottie-react-native';
import strings from "../languages/strings";

const CreatePassword = (props) => {
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [registration_status, setRegistrationStatus] = useState(0);
    const [confirm_password, setConfirmPassword] = useState('');
    let dropDownAlertRef = useRef();
    const inputRef = useRef();

    const go_back = () => {
        navigation.goBack();
    }

    useEffect(() => {
        setTimeout(() => inputRef.current.focus(), 100)
    }, []);


    const check_valid = () => {
        if (password) {
            check_password();
        } else {
            dropDownAlertRef.alertWithType('error', strings.validation_error, strings.please_enter_your_password);
        }
    }

    const check_password = () => {
        if (password == confirm_password) {
            //navigation.navigate('Home');
            call_register();
        } else {
            dropDownAlertRef.alertWithType('error', strings.validation_error, strings.your_password_and_confirm_password_did_not_match);
        }
    }

    const call_register = async () => {
        console.log({ fcm_token: global.fcm_token, phone_number: props.phone_number, phone_with_code: props.phone_with_code, country_code: props.country_code, first_name: props.first_name, last_name: props.last_name, aadhar_number: props.aadhar_number, licence_number: props.licence_number, date_of_birth: props.date_of_birth, password: password })
        Keyboard.dismiss();
        setLoading(true);
        await axios({
            method: 'post',
            url: api_url + register,
            data: { fcm_token: global.fcm_token, phone_number: props.phone_number, phone_with_code: props.phone_with_code, country_code: props.country_code, first_name: props.first_name, last_name: props.last_name, aadhar_number: props.aadhar_number, licence_number: props.licence_number, date_of_birth: "", password: password }
        })
            .then(async response => {
                setLoading(false);
                if (response.data.status == 1) {
                    setRegistrationStatus(1);
                } else {
                    dropDownAlertRef.alertWithType('error', strings.error, response.data.message);
                }
            })
            .catch(error => {
                setLoading(false);
                dropDownAlertRef.alertWithType('error', strings.error, strings.sorry_something_went_wrong);
            });
    }

    const navigate = async (data) => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "CheckPhone" }],
            })
        );
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
                {registration_status == 0 &&
                    <TouchableOpacity activeOpacity={1} onPress={go_back.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                    </TouchableOpacity>
                }
            </View>
            <View style={{ margin: 20 }} />
            {registration_status == 0 ?
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xl, fontFamily: bold }}>{strings.create_your_password}</Text>
                    <View style={{ margin: 5 }} />
                    <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: normal }}>{strings.create_your_new_password}</Text>
                    <View style={{ margin: 20 }} />
                    <View style={{ width: '80%' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '25%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg_three }}>
                                <Icon type={Icons.MaterialIcons} name="lock" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                            </View>
                            <View style={{ width: '75%', alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'center', backgroundColor: colors.text_container_bg }}>
                                <TextInput
                                    ref={inputRef}
                                    placeholder={strings.password}
                                    secureTextEntry={true}
                                    placeholderTextColor={colors.grey}
                                    style={styles.textinput}
                                    onChangeText={TextInputValue =>
                                        setPassword(TextInputValue)}
                                />
                            </View>
                        </View>
                        <View style={{ margin: 10 }} />
                        <View style={{ flexDirection: 'row' }}>
                            <View style={{ width: '25%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg_three }}>
                                <Icon type={Icons.MaterialIcons} name="lock" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                            </View>
                            <View style={{ width: '75%', alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'center', backgroundColor: colors.text_container_bg }}>
                                <TextInput
                                    placeholder={strings.confirm_password}
                                    secureTextEntry={true}
                                    placeholderTextColor={colors.grey}
                                    style={styles.textinput}
                                    onChangeText={TextInputValue =>
                                        setConfirmPassword(TextInputValue)}
                                />
                            </View>
                        </View>
                        <View style={{ margin: 30 }} />
                        {loading == false ?
                            <TouchableOpacity onPress={check_valid.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{strings.register}</Text>
                            </TouchableOpacity>
                        :
                            <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                                <LottieView source={btn_loader} autoPlay loop />
                            </View>
                        }
                    </View>
                </View>
                :
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <Text numberOfLines={1} style={{ color: colors.success, fontSize: f_xl, fontFamily: bold }}>{strings.done}</Text>
                    <View style={{ margin: 5 }} />
                    <Text style={{ color: colors.grey, fontSize: f_xs, fontFamily: normal, textAlign: 'center', width: '80%' }}>{strings.your_registration_is_successfully_completed_please_login_using_your_phone_number}</Text>
                    <View style={{ margin: 20 }} />
                    <View style={{ height: 150, width: 150 }}>
                        <Image source={success_icon} style={{ height: undefined, width: undefined, flex: 1 }} />
                    </View>
                    <View style={{ margin: 20 }} />
                    <View style={{ width: '80%' }}>
                        <TouchableOpacity onPress={navigate.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{strings.login}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
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
        fontSize: f_m,
        color: colors.grey,
        fontFamily: regular,
        height: 60,
        backgroundColor: colors.text_container_bg,
        width: '100%'
    },
});

function mapStateToProps(state) {
    return {
        phone_number: state.register.phone_number,
        phone_with_code: state.register.phone_with_code,
        country_code: state.register.country_code,
        first_name: state.register.first_name,
        last_name: state.register.last_name,
        aadhar_number: state.register.aadhar_number,
        licence_number: state.register.licence_number,
        date_of_birth: state.register.date_of_birth,
    };
}

export default connect(mapStateToProps, null)(CreatePassword);