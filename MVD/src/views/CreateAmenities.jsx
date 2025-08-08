import React, { useState, useEffect, useRef } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    SafeAreaView,
    FlatList,
    StatusBar,
    Switch
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
import { Picker } from '@react-native-picker/picker';

const CreateAmenities = (props) => {
    const navigation = useNavigation();
    const [vehicle_type, setVehicleType] = useState(0);
    const [vehicle_type_lbl, setVehicleTypeLbl] = useState(0);
    const [loading, setLoading] = useState(false);
    const [vehicle_categories, setVehicleCategories] = useState([]);
    let dropDownAlertRef = useRef();
    const [selectedAmenities, setSelectedAmenities] = useState();
    const [checkedItems, setCheckedItems] = useState([]);
    const [switch_value, setSwitchValue] = useState(0);


    const go_back = () => {
        navigation.goBack();
    }

    const data = [
        {
            id: 1,
            title: "Mask"
        }, {
            tid: 2,
            title: "Oxygen Tank"
        }
    ]
    const toggleSwitch = (value) => {
            setSwitchValue(value);
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
                dropDownAlertRef.alertWithType('error', 'Error', strings.sorry_something_went_wrong);
            });
    }

    const check_valid = () => {
        if (vehicle_type) {
            navigate();
        } else {
            dropDownAlertRef.alertWithType('error', 'Validation error', strings.please_select_your_amenities);
        }
    }

    const navigate = async () => {
        props.updateVehicleType(vehicle_type);
        props.updateVehicleTypeLbl(vehicle_type_lbl);
        go_back();
    }

    const update_vehicle_type = (id, name, item) => {
        if (checkedItems.includes(item)) {
            // Item already checked, remove it from the checkedItems array
            setCheckedItems(checkedItems.filter((i) => i !== item));
        } else {
            // Item not checked, add it to the checkedItems array
            setCheckedItems([...checkedItems, item]);
        }
        setVehicleType(id);
        setVehicleTypeLbl(name);
    }
    const handleCheckBoxToggle = (item) => {
        if (checkedItems.includes(item)) {
            // Item already checked, remove it from the checkedItems array
            setCheckedItems(checkedItems.filter((i) => i !== item));
        } else {
            // Item not checked, add it to the checkedItems array
            setCheckedItems([...checkedItems, item]);
        }
    };

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
                <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xl, fontFamily: bold }}>{strings.select_your_amenitites}</Text>
                <View style={{ margin: 20 }} />
                <FlatList
                    data={data}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity  activeOpacity={1} style={{ width: '95%', backgroundColor: colors.theme_bg_three, borderRadius: 10, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 5 }}>
                            <View style={{ margin: 5 }} />
                            <View style={{ width: '75%', alignItems: 'flex-start', justifyContent: 'center' }}>
                                <Text style={{ color: colors.theme_fg_two, fontSize: f_m, fontFamily: regular, }}>{item.title}</Text>
                            </View>
                            <View style={{ width: '20%', alignItems: 'flex-end', justifyContent: 'center' }}>
                                <Switch
                                    trackColor={{ false: colors.grey, true: colors.theme_bg }}
                                    thumbColor={colors.lite_bg}
                                    ios_backgroundColor="#3e3e3e"
                                    onValueChange={toggleSwitch}
                                    value={switch_value}
                                />
                            </View>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                />
                <View style={{ margin: 30 }} />
                <TouchableOpacity onPress={check_valid.bind(this)} activeOpacity={1} style={{ width: '80%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>{strings.done}</Text>
                </TouchableOpacity>
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

export default connect(null, mapDispatchToProps)(CreateAmenities);