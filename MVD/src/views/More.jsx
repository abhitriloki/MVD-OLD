import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  FlatList,
  StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import Icon, { Icons } from '../components/Icons';
import { bold, regular, logo, menus, f_s, f_xs, normal } from '../config/Constants';
import Dialog from "react-native-dialog";
import { connect } from 'react-redux';
import strings from "../languages/strings";
import { Picker } from '@react-native-picker/picker';
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';

const More = (props) => {
  const navigation = useNavigation();
  const [dialog_visible, setDialogVisible] = useState(false);
  const [language, setLanguage] = useState(global.lang);

  const navigate = (route) => {
    if (route == 'Logout') {
      showDialog();
    } else {
      navigation.navigate(route);
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

  const showDialog = () => {
    setDialogVisible(true);
  }

  const closeDialog = () => {
    setDialogVisible(false);
  }

  const handleCancel = () => {
    setDialogVisible(false)
  }

  const handleLogout = async () => {
    closeDialog();
    navigation.navigate('Logout');
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.theme_bg_three, flex: 1 }}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <ScrollView>
        <Dialog.Container visible={dialog_visible}>
          <Dialog.Title>{strings.confirm}</Dialog.Title>
          <Dialog.Description>
            {strings.do_you_want_to_logout}
          </Dialog.Description>
          <Dialog.Button label={strings.yes} onPress={handleLogout} />
          <Dialog.Button label={strings.no} onPress={handleCancel} />
        </Dialog.Container>
        <View style={{ margin: 15, alignItems: 'center' }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderRadius: 55, padding: 2, width: 110, borderColor: colors.grey, borderStyle: 'dotted', alignSelf: 'center' }}>
            <View style={{ width: 100, height: 100 }} >
              <Image style={{ height: undefined, width: undefined, flex: 1, borderRadius: 75 }} source={logo} />
            </View>
          </View>
          <View style={{ margin: 5 }} />
          <Text style={{ color: colors.theme_fg_two, fontSize: f_s, fontFamily: bold }}>{global.first_name}</Text>
          <View style={{ margin: 2 }} />
          <Text style={{ color: colors.text_grey, fontSize: f_xs, fontFamily: regular }}>{global.email}</Text>
          <View style={{ margin: 5 }} />
          <TouchableOpacity onPress={() => navigate('Profile')} style={{ backgroundColor: colors.theme_bg, padding: 7, borderRadius: 10 }}>
            <Text style={{ color: colors.theme_fg_three, fontSize: f_xs, fontFamily: bold }}>{strings.edit_profile}</Text>
          </TouchableOpacity>
        </View>
        <View style={{width:'100%', alignItems:'center', justifyContent:'center', backgroundColor:colors.theme}} >
          <Picker
            selectedValue={language}
            style={{ height: 60, width: 150, color: colors.theme_fg }}
            itemStyle={{ fontFamily: normal }}
            dropdownIconColor={{color: colors.theme_fg }}
            onValueChange={(itemValue, itemIndex) =>
              language_change(itemValue)
            }>
            <Picker.Item label={strings.english} value="en" />
            <Picker.Item label={strings.hindi} value="hi" />
          </Picker>
        </View>
        <View style={{ backgroundColor: colors.lite_bg, padding: 10 }}>
          <Text style={{ color: colors.text_grey, fontSize: f_xs, fontFamily: regular }}>{strings.more}</Text>
        </View>
        <View style={{ margin: 5 }} />
        <FlatList
          data={menus}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => navigate(item.route)} style={{ flexDirection: 'row', width: '100%', padding: 15 }}>
              <View style={{ width: '80%', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row' }}>
                <View style={{ width: 50 }}>
                  <Icon type={Icons.FontAwesome} name={item.icon} color={colors.theme_fg_two} style={{ fontSize: 22 }} />
                </View>
                <Text style={{ color: colors.theme_fg_two, fontSize: f_s, fontFamily: regular }}>{item.menu_name}</Text>
              </View>
              <View style={{ width: '20%', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row' }}>
                <Icon type={Icons.FontAwesome5} name="chevron-right" color={colors.text_grey} style={{ fontSize: 18 }} />
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.menu_name}
        />
        <View style={{ margin: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

});

function mapStateToProps(state) {
  return {
    first_name: state.register.first_name,
    last_name: state.register.last_name,
    email: state.register.email,
  };
}

const mapDispatchToProps = (dispatch) => ({
  updateEmail: (data) => dispatch(updateEmail(data)),
  updateFirstName: (data) => dispatch(updateFirstName(data)),
  updateLastName: (data) => dispatch(updateLastName(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(More);