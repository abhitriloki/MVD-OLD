import React, { useState, useEffect, useRef } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    SafeAreaView,
    FlatList,
    StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { bold, regular, vehicle_type_list, api_url, f_xl, f_m } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import DropdownAlert from 'react-native-dropdownalert';
import { connect } from 'react-redux';
import { updateVehicleType, updateVehicleTypeLbl } from '../actions/VehicleDetailActions';
import { CheckBox } from '@rneui/themed';
import axios from 'axios';
import strings from "../languages/strings";

const CreateVehicleType = (props) => {
    const navigation = useNavigation();
    const [vehicle_type, setVehicleType] = useState(0);
    const [vehicle_type_lbl, setVehicleTypeLbl] = useState(0);
    const [loading, setLoading] = useState(false);
    const [vehicle_categories, setVehicleCategories] = useState([]);
    let dropDownAlertRef = useRef();

    const go_back = () => {
        navigation.goBack();
    }

    useEffect(() => {
        call_vehicle_type_list();
    }, []);

    const call_vehicle_type_list = async () => {
        setLoading(true);
        await axios({
            method: 'post',
            url: api_url + vehicle_type_list,
            data: { lang: global.lang }
        })
            .then(async response => {
                setLoading(false);
                setVehicleCategories(response.data.result);
            })
            .catch(error => {
                setLoading(false);
                dropDownAlertRef.alertWithType('error',strings.error, strings.sorry_something_went_wrong);
            });
    }

    const check_valid = () => {
        if (vehicle_type) {
            navigate();
        } else {
            dropDownAlertRef.alertWithType('error', strings.validation_error, strings.please_select_your_vahan_type);
        }
    }

    const navigate = async () => {
        props.updateVehicleType(vehicle_type);
        props.updateVehicleTypeLbl(vehicle_type_lbl);
        go_back();
    }

    const update_vehicle_type = (id, name) => {
        setVehicleType(id);
        setVehicleTypeLbl(name);
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
                <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xl, fontFamily: bold }}>{strings.select_your_vahan_type}</Text>
                <View style={{ margin: 20 }} />
                <View style={{ width: '80%' }}>
                    <FlatList
                        data={vehicle_categories}
                        renderItem={({ item, index }) => (
                            <CheckBox
                                checked={vehicle_type === item.id}
                                onPress={() => update_vehicle_type(item.id, item.vehicle_type)}
                                title={item.vehicle_type}
                                checkedColor={colors.btn_color}
                                checkedIcon="dot-circle-o"
                                uncheckedIcon="circle-o"
                            />
                        )}
                        keyExtractor={item => item.id}
                    />
                    <View style={{ margin: 30 }} />
                    <TouchableOpacity onPress={check_valid.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{strings.done}</Text>
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
        fontSize: f_m,
        color: colors.grey,
        fontFamily: regular,
        height: 60,
        backgroundColor: colors.text_container_bg,
        width: '100%'
    },
});

const mapDispatchToProps = (dispatch) => ({
    updateVehicleType: (data) => dispatch(updateVehicleType(data)),
    updateVehicleTypeLbl: (data) => dispatch(updateVehicleTypeLbl(data)),
});

export default connect(null, mapDispatchToProps)(CreateVehicleType);