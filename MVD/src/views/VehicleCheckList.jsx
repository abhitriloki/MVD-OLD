//Fixed
import React, { useState, useEffect, useRef } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    SafeAreaView,
    ScrollView,
    Image,
    StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { screenHeight, screenWidth, bold, regular, api_url, get_checklist, checklist_update, f_xl, btn_loader, loader } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import axios from 'axios';
import strings from "../languages/strings";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import DropdownAlert from 'react-native-dropdownalert';
import LottieView from 'lottie-react-native';

const VehicleCheckList = (props) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [show_loading, setShowLoading] = useState(false); 
    const [on_load, setOnLoad] = useState(0);
    const [selected_check_list, setSelectedCheckList] = useState(undefined);
    const [selected_list, setSelectedList] = useState([]);
    const [show_check_list, setShowCheckList] = useState([]);
    let dropDownAlertRef = useRef();

    const go_back = () => {
        navigation.goBack();
    }

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            await call_checklist();
            await call_checklist_update();
        });
        return unsubscribe;
    }, []);

    const call_checklist = async () => {
        setShowLoading(false);
        await axios({
            method: "post",
            url: api_url + get_checklist,
            data: { id: global.id }
        })
            .then(async (response) => {
                setShowLoading(false);
                assign_data(response.data.result.checklist);
                setShowCheckList(response.data.result.driver_checklist);
            })
            .catch(async (error) => {
                setShowLoading(false);
                dropDownAlertRef.alertWithType('error', strings.validation_error, strings.sorry_something_went_wrong);
            });
    }

    const assign_data = async (data) => {
        let selected_check_list = [{
            name: strings.select_your_available_materials_in_your_vahan,
            id: 0,
            children: data
        }];

        setSelectedCheckList(selected_check_list);
    }

    const onSelectedCheckList = (selected_list) => {
        setSelectedList(selected_list);
    }

    const check_validation = async () => {
        if (!selected_list.toString()) {
            dropDownAlertRef.alertWithType('error', strings.validation_error, strings.please_select_the_check_list_item_that_you_have_in_your_vahan);
        } else {
            call_checklist_update();
        }
    }

    const call_checklist_update = async () => {
        console.log({ id: global.id, checklist: selected_list.toString() })
        setLoading(true);
        await axios({
            method: "post",
            url: api_url + checklist_update,
            data: { id: global.id, checklist: selected_list.toString() }
        })
            .then(async (response) => {
                setLoading(false);
                call_checklist();
            })
            .catch((error) => {
                setLoading(false);
                dropDownAlertRef.alertWithType('error', strings.validation_error, strings.sorry_something_went_wrong);
            });
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
                    <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_three} style={{ fontSize: 30 }} />
                </TouchableOpacity>
                <View activeOpacity={1} style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_three, fontSize: f_xl, fontFamily: bold }}>{strings.vehicle_check_list}</Text>
                </View>
            </View>
            {show_loading == false ?
            <ScrollView style={{ padding: 10 }}>
                <View style={{ margin: 5 }} />
                <SectionedMultiSelect
                    items={selected_check_list}
                    IconRenderer={Icon}
                    uniqueKey="id"
                    subKey="children"
                    selectText={strings.click_to_add_items_in_your_vahan}
                    alwaysShowSelectText={true}
                    showDropDowns={true}
                    readOnlyHeadings={true}
                    onSelectedItemsChange={onSelectedCheckList}
                    selectedItems={selected_list}
                    confirmText={strings.close}
                    searchPlaceholderText={strings.search}
                    expandDropDowns={true}
                    selectedIconComponent={<Icon size={30} name="ios-checkmark-circle-outline" style={{ color: 'green', left: -20 }} />}
                    styles={{
                        selectToggle: {
                            color: colors.theme_fg,
                        },
                        selectToggleText: {
                            color: colors.theme_fg,
                        },
                        chipText: {
                            color: colors.theme_fg,
                            paddingRight: 20,
                            paddingLeft: 10,
                            alignItems: "center"
                        },
                        button: {
                            backgroundColor: colors.theme_fg,
                        },
                        confirmText: {
                            color: colors.theme_bg_three,
                        },
                        selectedItem: {
                            backgroundColor: 'rgba(0,0,0,0.1)',
                        },
                    }}
                />
                {show_check_list.length != 0 &&
                    <View style={{ padding: 20 }}>
                        <View style={{ alignItems: 'flex-start', justifyContent: 'center' }}>
                            <Text style={{ color: colors.theme_fg_two, fontFamily: bold, fontSize: 16 }}>{strings.your_selected_items_in_your_vahan}</Text>
                        </View>
                        <View style={{ margin: 10 }} />
                        <ScrollView
                            showsHorizontalScrollIndicator={false}
                        >
                            {show_check_list.map((item) => {
                                return (
                                    <TouchableOpacity >
                                        <Text style={{ fontSize: 14, color: colors.theme_fg, fontFamily: regular }}>{item.name}, </Text>
                                        <View style={{ margin: 5 }} />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                }
            </ScrollView>
            :
            <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                <LottieView source={loader} autoPlay loop />
            </View>
            }
            {loading == false ?
                <TouchableOpacity activeOpacity={1} onPress={check_validation.bind(this)} style={{ alignItems: 'center', justifyContent: 'center', margin: 10, borderColor: colors.theme_bg, borderWidth: 1, padding: 10, borderRadius: 10, backgroundColor: colors.theme_bg }}>
                    <Text style={{ color: colors.theme_bg_three, fontFamily: bold, fontSize: 14 }}>{strings.submit}</Text>
                </TouchableOpacity>
                :
                <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                    <LottieView source={btn_loader} autoPlay loop />
                </View>
            }
        </SafeAreaView >
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        height: screenHeight,
        width: screenWidth,
        backgroundColor: colors.theme
    },
    header: {
        height: 60,
        backgroundColor: colors.theme_bg,
        flexDirection: 'row',
        alignItems: 'center'
    },
});

export default VehicleCheckList;