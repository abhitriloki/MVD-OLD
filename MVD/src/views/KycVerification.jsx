//Fixed
import React, { useState, useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import Icon, { Icons } from '../components/Icons';
import { bold, regular, api_url, get_kyc, btn_loader, update_kyc, f_xl, f_xs, f_m, normal } from '../config/Constants';
import axios from 'axios';
import DropdownAlert from "react-native-dropdownalert";
import LottieView from 'lottie-react-native';
import strings from "../languages/strings";

const KycVerification = (props) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [on_load, setOnLoad] = useState(0);
  const [aadhar_number, setAadharNumber] = useState('');
  const [account_number, setAccountNumber] = useState('');
  const [bank_name, setBankName] = useState('');
  const [ifsc_code, setIfscCode] = useState('');
  const [pan_number, setPanNumber] = useState('');
  const [update_status, setUpdateStatus] = useState(0);
  const [approval_status, setApprovalStatus] = useState(0);

  let dropDownAlertRef = useRef();

  const go_back = () => {
    navigation.goBack();
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      call_get_kyc();
    });

    return (
      unsubscribe
    );
  }, []);

  const call_get_kyc = () => {
    setLoading(true);
    axios({
      method: 'post',
      url: api_url + get_kyc,
      data: { driver_id: global.id }
    })
      .then(async response => {
        setLoading(false);
        setOnLoad(1);
        setUpdateStatus(response.data.status);
        if (response.data.status == 1) {
          setApprovalStatus(response.data.result.status);
          setAadharNumber(response.data.result.aadhar_number);
          setAccountNumber(response.data.result.bank_account_number);
          setBankName(response.data.result.bank_name);
          setIfscCode(response.data.result.ifsc_code);
          setPanNumber(response.data.result.pan_number);
        } else {
          dropDownAlertRef.alertWithType('error', strings.validation_error, response.data.message);
        }
      })
      .catch(error => {
        setLoading(false);
        dropDownAlertRef.alertWithType('error', strings.validation_error, strings.sorry_something_went_wrong);
      });
  }

  const check_validation = () => {
    if (bank_name == "" || account_number == "" || ifsc_code == "" || aadhar_number == "" || pan_number == "") {
      dropDownAlertRef.alertWithType('error', strings.validation_error, strings.please_fill_required_field);
    } else {
      call_update_kyc();
    }
  }

  const call_update_kyc = () => {
    setLoading(true);
    axios({
      method: 'post',
      url: api_url + update_kyc,
      data: { driver_id: global.id, bank_name: bank_name, bank_account_number: account_number, ifsc_code: ifsc_code, aadhar_number: aadhar_number, pan_number: pan_number }
    })
      .then(async response => {
        setLoading(false);
        dropDownAlertRef.alertWithType('success', strings.successfully_updated, strings.your_bank_name_has_been_updated);
        go_back();
      })
      .catch(error => {
        setLoading(false);
        alert(strings.sorry_something_went_wrong)
      });
  }

  const navigate = (route) => {
    navigation.navigate(route);
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
          <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_three} style={{ fontSize: 30 }} />
        </TouchableOpacity>
        <View activeOpacity={1} style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
          <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_three, fontSize: f_xl, fontFamily: bold }}>{strings.update_your_bank_details}</Text>
        </View>
      </View>
      <ScrollView>
        {on_load == 1 &&
          <View>
            {approval_status == 1 &&
              <View style={{ margin: 10 }}>
                <View style={{ backgroundColor: colors.success_background, alignItems: 'center', justifyContent: 'center', padding: 5 }}>
                  <Text style={{ fontFamily: normal, color: colors.error, fontSize: f_xs }}>{strings.note} : {strings.your_bank_verification_is_under_process_please_update_again}</Text>
                </View>
              </View>
            }
            {approval_status == 3 &&
              <View style={{ margin: 10 }}>
                <View style={{ backgroundColor: colors.error_background, alignItems: 'center', justifyContent: 'center', padding: 5 }}>
                  <Text style={{ fontFamily: normal, color: colors.error, fontSize: f_xs }}>{strings.note} : {strings.your_bank_verification_process_is_rejected_please_update_again}</Text>
                </View>
              </View>
            }
            <ScrollView>
              <View style={{ alignItems: 'center' }}>
                <View style={{ margin: 10 }} />
                <View style={{ width: '90%' }}>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: colors.text_grey, fontSize: f_xs, fontFamily: bold }}>{strings.bank_name}</Text>
                    <View style={{ margin: 5 }} />
                    <TouchableOpacity activeOpacity={1} style={{ flexDirection: 'row' }}>
                      <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg_three }}>
                        <Icon type={Icons.FontAwesome} name="bank" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                      </View>
                      <View style={{ width: '85%', alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'center', backgroundColor: colors.text_container_bg }}>
                        <TextInput
                          value={bank_name}
                          placeholderTextColor={colors.grey}
                          style={styles.textinput}
                          onChangeText={TextInputValue =>
                            setBankName(TextInputValue)}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: colors.text_grey, fontSize: f_xs, fontFamily: bold }}>{strings.account_number}</Text>
                    <View style={{ margin: 5 }} />
                    <TouchableOpacity activeOpacity={1} style={{ flexDirection: 'row' }}>
                      <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg_three }}>
                        <Icon type={Icons.Octicons} name="number" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                      </View>
                      <View style={{ width: '85%', alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'center', backgroundColor: colors.text_container_bg }}>
                        <TextInput
                          value={account_number}
                          placeholderTextColor={colors.grey}
                          style={styles.textinput}
                          onChangeText={TextInputValue =>
                            setAccountNumber(TextInputValue)}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: colors.text_grey, fontSize: f_xs, fontFamily: bold }}>{strings.ifsc_code}</Text>
                    <View style={{ margin: 5 }} />
                    <TouchableOpacity activeOpacity={1} style={{ flexDirection: 'row' }}>
                      <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg_three }}>
                        <Icon type={Icons.MaterialCommunityIcons} name="unicode" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                      </View>
                      <View style={{ width: '85%', alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'center', backgroundColor: colors.text_container_bg }}>
                        <TextInput
                          value={ifsc_code}
                          placeholderTextColor={colors.grey}
                          style={styles.textinput}
                          onChangeText={TextInputValue =>
                            setIfscCode(TextInputValue)}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: colors.text_grey, fontSize: f_xs, fontFamily: bold }}>{strings.aadhar_number}</Text>
                    <View style={{ margin: 5 }} />
                    <TouchableOpacity activeOpacity={1} style={{ flexDirection: 'row' }}>
                      <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg_three }}>
                        <Icon type={Icons.Octicons} name="number" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                      </View>
                      <View style={{ width: '85%', alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'center', backgroundColor: colors.text_container_bg }}>
                        <TextInput
                          value={aadhar_number}
                          placeholderTextColor={colors.grey}
                          style={styles.textinput}
                          onChangeText={TextInputValue =>
                            setAadharNumber(TextInputValue)}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: colors.text_grey, fontSize: f_xs, fontFamily: bold }}>{strings.pan_number}</Text>
                    <View style={{ margin: 5 }} />
                    <TouchableOpacity activeOpacity={1} style={{ flexDirection: 'row' }}>
                      <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg_three }}>
                        <Icon type={Icons.MaterialCommunityIcons} name="unicode" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                      </View>
                      <View style={{ width: '85%', alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'center', backgroundColor: colors.text_container_bg }}>
                        <TextInput
                          value={pan_number}
                          placeholderTextColor={colors.grey}
                          style={styles.textinput}
                          onChangeText={TextInputValue =>
                            setPanNumber(TextInputValue)}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        }
        <View style={{ margin: 40 }} />
      </ScrollView>
      {loading == false ?
        <View>
          {update_status == 0 &&
            <View>
              <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity onPress={check_validation.bind(this)} activeOpacity={1} style={{ width: '90%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{strings.submit}</Text>
                </TouchableOpacity>
              </View>
            </View>

          }
        </View>
        :
        <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
          <LottieView source={btn_loader} autoPlay loop />
        </View>
      }
      <View>
        {approval_status == 3 &&
          <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity onPress={check_validation.bind(this)} activeOpacity={1} style={{ width: '90%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{strings.submit}</Text>
            </TouchableOpacity>
          </View>

        }
      </View>
      {drop_down_alert()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: colors.theme_bg,
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

export default KycVerification;