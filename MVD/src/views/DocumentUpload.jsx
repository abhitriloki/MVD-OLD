import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet, View, SafeAreaView, Text, TouchableOpacity, Image, StatusBar
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { connect } from 'react-redux';
import axios from 'axios';
import * as ImagePicker from "react-native-image-picker";
import RNFetchBlob from "rn-fetch-blob";
import ImgToBase64 from 'react-native-image-base64';
import { bold, api_url, image_upload, img_url, update_document, btn_loader, f_m } from '../config/Constants';
import * as colors from '../assets/css/Colors';
import DropdownAlert from 'react-native-dropdownalert';
import Icon, { Icons } from '../components/Icons';
import LottieView from 'lottie-react-native';
import strings from "../languages/strings";

const options = {
  title: 'Select a photo',
  takePhotoButtonTitle: 'Take a photo',
  chooseFromLibraryButtonTitle: 'Choose from gallery',
  base64: true,
  quality: 1,
  maxWidth: 500,
  maxHeight: 500,
};

const DocumentUpload = (props) => {
  const navigation = useNavigation();
  const route = useRoute();
  let dropDownAlertRef = useRef();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(route.params.status);
  const [slug, setSlug] = useState(route.params.slug);
  const [path, setPath] = useState(route.params.path);
  const [table, setTable] = useState(route.params.table);
  const [find_field, setFindField] = useState(route.params.find_field);
  const [find_value, setFindValue] = useState(route.params.find_value);
  const [status_field, setStatusField] = useState(route.params.status_field);
  const [img_data, setImageData] = useState(undefined);

  useEffect(() => {

  }, []);

  const go_back = () => {
    navigation.goBack();
  }

  const select_photo = async () => {
    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = response.assets[0].uri;
        setImageData(response.assets[0].uri);
        ImgToBase64.getBase64String(response.assets[0].uri)
          .then(async base64String => {
            await call_upload_document(base64String);
          }
          )
          .catch(err => console.log(err));
      }
    });
  }

  const call_upload_document = async (data) => {
    setLoading(true);
    RNFetchBlob.fetch('POST', api_url + image_upload, {
      'Content-Type': 'multipart/form-data',
    }, [
      {
        name: 'image',
        filename: 'image.png',
        data: data
      },
      {
        name: 'upload_path',
        data: 'drivers/vehicle_documents'
      }
    ]).then(async (resp) => {
      //setLoading(false);
      let data = await JSON.parse(resp.data);
      if (data.result) {
        call_update_document(data.result);
      }
    }).catch((err) => {
      setLoading(false);
      dropDownAlertRef.alertWithType('error', strings.validation_error, strings.error_on_while_upload_try_again_later);
    })
  }

  const call_update_document = async (path) => {
    await axios({
      method: 'post',
      url: api_url + update_document,
      data: { table: table, find_field: find_field, find_value: find_value, update_field: slug, update_value: path, status_field: status_field }
    })
      .then(async response => {
        setLoading(false);
        if (response.data.status == 1) {
          setPath({ uri: img_url + path });
          setStatus(15);
          dropDownAlertRef.alertWithType('success', strings.success, strings.successfully_uploaded_your_document);
        }
      })
      .catch(error => {
        setLoading(false);
        dropDownAlertRef.alertWithType('error', strings.validation_error, strings.sorry_something_went_wrong);
      });
  }

  const show_button = () => {
    if (status == 14 || status == 17) {
      return(
        <View style={{ margin:10 }}>
          <TouchableOpacity onPress={select_photo.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{strings.upload}</Text>
          </TouchableOpacity>
        </View>
      )
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
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <View style={[styles.header]}>
        <TouchableOpacity activeOpacity={1} onPress={go_back.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
        </TouchableOpacity>
      </View>
      {drop_down_alert()}
      <View style={{ marginBottom: 40, alignItems: 'center', justifyContent: 'center', flex:1 }}>
        <View style={{ height: 200, width: 200 }}>
          <Image source={path} style={{ flex: 1, height: undefined, width: undefined }} />
        </View>
        <View style={{ margin: 10 }} />
        {status == 14 &&
          <Text style={{ fontFamily: bold, color: colors.theme_fg, fontSize: f_m }}>{strings.upload_your_file}</Text>
        }
      </View>
      {loading == false ?
        <View>
          {show_button()}
        </View>
      :
        <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
          <LottieView source={btn_loader} autoPlay loop />
        </View>
      }
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.theme_bg_three
  },
  header: {
    height: 60,
    backgroundColor: colors.theme_bg_three,
    flexDirection: 'row',
    alignItems: 'center'
},
});

export default connect(null, null)(DocumentUpload);