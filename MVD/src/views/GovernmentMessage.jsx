import React, { useState, useEffect, useRef } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    SafeAreaView,
    FlatList,
    Image,
    StatusBar,
    ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { get_government_messages, bold, regular, api_url, f_xs, f_m, f_xl, loader, img_url } from '../config/Constants';
import axios from 'axios';
import Icon, { Icons } from '../components/Icons';
import LottieView from 'lottie-react-native';
import strings from "../languages/strings";

const GovernmentMessage = (props) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [odd_array, setOddArray] = useState([]);
    const [even_array, setEvenArray] = useState([]);

    const go_back = () => {
        navigation.goBack();
    }

    useEffect(() => {
        call_get_government_messages();
    }, []);

    const call_get_government_messages = (fl) => {
        setLoading(true);
        axios({
            method: 'post',
            url: api_url + get_government_messages,
        })
            .then(async response => {
                setLoading(false);
                setData(response.data.result)
            })
            .catch(error => {
                setLoading(false);
                alert(error)
            });
    }

    const show_list = ({ item }) => (
        <View>
        <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity style={{ width: 80, height: 80, borderWidth: 2, borderColor: colors.theme_fg, borderRadius: 50, borderStyle: 'dotted' }}>
                    <Image source={{ uri: img_url+item.profile_picture }} style={{ width: undefined, height: undefined, flex: 1, borderRadius: 50, }} />
                </TouchableOpacity>
                <View style={{ margin: 10 }} />
                <View>
                    <Text style={{ color: colors.theme_fg, fontSize: f_m, fontFamily: bold }}>{item.name}</Text>
                    <Text style={{ color: colors.theme_fg_two, fontSize: f_m, fontFamily: regular }}>{item.position}</Text>
                </View>
            </View>
            <View style={{ borderTopWidth: 1, marginTop: 10, marginBottom: 10, borderColor: colors.theme_fg_two, borderStyle: 'dashed' }} />
            <Text style={{ color: colors.theme_fg_two, fontSize: f_xs, fontFamily: regular }}>{item.description}</Text>
        </View>
        <View style={{ margin: 10 }} />
        </View>

    );

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
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_three, fontSize: f_xl, fontFamily: bold }}>{strings.government_messages}</Text>
                </View>
            </View>
            {data.length > 0 &&
                <ScrollView style={{ padding: 10 }}>
                    <FlatList
                        data={data}
                        renderItem={show_list}
                        keyExtractor={item => item.id}
                    />
                </ScrollView>
            }
            {loading == true &&
                <View style={{ height: 100, width: '90%', alignSelf: 'center', justifyContent: 'center' }}>
                    <LottieView source={loader} autoPlay loop />
                </View>
            }
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
    card: {
        backgroundColor: colors.theme_bg_three,
        borderRadius: 10,
        padding: 10,
        elevation: 5,
        margin: 5
    },
    header: {
        height: 60,
        backgroundColor: colors.theme_bg,
        flexDirection: 'row',
        alignItems: 'center'
    },
});

export default GovernmentMessage;